import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import { logger } from '../utils/logger.js'
import {
  validateApplicationCreatePayload,
  validateApplicationUpdatePayload,
} from '../validators/applicationValidator.js'
import * as applicationService from '../services/applicationService.js'

export async function createApplication(req, res) {
  try {
    const validation = validateApplicationCreatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    const applicantId = req.user.id
    const application = await applicationService.createApplication(applicantId, req.body)
    return sendSuccess(res, { application: application.toJSON() }, 'Application submitted successfully')
  } catch (error) {
    const status = error.statusCode || 400
    return sendError(res, error.message || 'Failed to submit application', status)
  }
}

export async function getApplication(req, res) {
  try {
    const application = await applicationService.getApplicationById(req.params.applicationId)
    if (!application) return sendError(res, 'Application not found', 404)

    // Only the applicant, the job's employer, or admin can view
    if (application.applicantId !== req.user.id && application.employerId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403)
    }

    return sendSuccess(res, { application: application.toJSON() }, 'Application retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve application', 400)
  }
}

export async function updateApplication(req, res) {
  try {
    const validation = validateApplicationUpdatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    const application = await applicationService.getApplicationById(req.params.applicationId)
    if (!application) return sendError(res, 'Application not found', 404)

    // Only applicant can update their own application (and only if still pending)
    if (application.applicantId !== req.user.id) {
      return sendError(res, 'Access denied', 403)
    }
    if (application.status !== 'pending') {
      return sendError(res, 'Cannot update an application that has already been reviewed', 400)
    }

    const updated = await applicationService.updateApplication(req.params.applicationId, req.body)
    return sendSuccess(res, { application: updated.toJSON() }, 'Application updated')
  } catch (error) {
    return sendError(res, error.message || 'Failed to update application', 400)
  }
}

export async function withdrawApplication(req, res) {
  try {
    const application = await applicationService.getApplicationById(req.params.applicationId)
    if (!application) return sendError(res, 'Application not found', 404)
    if (application.applicantId !== req.user.id) {
      return sendError(res, 'Access denied', 403)
    }
    if (application.status === 'withdrawn' || application.status === 'accepted' || application.status === 'rejected') {
      return sendError(res, `Cannot withdraw an application that is already ${application.status}`, 400)
    }

    const updated = await applicationService.updateApplication(req.params.applicationId, { status: 'withdrawn' })
    return sendSuccess(res, { application: updated.toJSON() }, 'Application withdrawn')
  } catch (error) {
    return sendError(res, error.message || 'Failed to withdraw application', 400)
  }
}

export async function deleteApplication(req, res) {
  try {
    const application = await applicationService.getApplicationById(req.params.applicationId)
    if (!application) return sendError(res, 'Application not found', 404)
    if (application.applicantId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403)
    }

    await applicationService.deleteApplication(req.params.applicationId)
    return sendSuccess(res, null, 'Application deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete application', 400)
  }
}

// ─── Queries ────────────────────────────────────────────

export async function listMyApplications(req, res) {
  try {
    const { status, sortBy, sortOrder, page, limit } = req.query
    const result = await applicationService.getApplicationsByApplicant(
      req.user.id,
      status || undefined,
      parseInt(page) || 1,
      Math.min(50, parseInt(limit) || 20)
    )
    return sendSuccess(res, result, 'Applications retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve applications', 400)
  }
}

export async function listEmployerApplications(req, res) {
  try {
    const { jobId, status, sortBy, sortOrder, page, limit } = req.query
    const filters = { employerId: req.user.id, page: parseInt(page) || 1, limit: Math.min(50, parseInt(limit) || 20) }
    if (jobId) filters.jobId = jobId
    if (status) filters.status = status
    if (sortBy) filters.sortBy = sortBy
    if (sortOrder) filters.sortOrder = sortOrder

    const result = await applicationService.searchApplications(filters)
    return sendSuccess(res, result, 'Applications retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve applications', 400)
  }
}

export async function listJobApplications(req, res) {
  try {
    const { status, page, limit } = req.query
    // Verify the job belongs to this employer or user is admin
    const { getJobById } = await import('../services/jobService.js')
    const job = await getJobById(req.params.jobId)
    if (!job) return sendError(res, 'Job not found', 404)
    if (job.employerId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403)
    }

    const result = await applicationService.getApplicationsByJob(
      req.params.jobId,
      status || undefined,
      parseInt(page) || 1,
      Math.min(50, parseInt(limit) || 20)
    )
    return sendSuccess(res, result, 'Job applications retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve job applications', 400)
  }
}

// ─── Status Updates (Employer) ─────────────────────────

export async function reviewApplication(req, res) {
  try {
    const application = await applicationService.getApplicationById(req.params.applicationId)
    if (!application) return sendError(res, 'Application not found', 404)
    if (application.employerId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403)
    }

    const { status, reviewNotes } = req.body
    if (status && !['reviewed', 'accepted', 'rejected'].includes(status)) {
      return sendError(res, 'Status must be one of: reviewed, accepted, rejected', 400)
    }

    const updated = await applicationService.reviewApplication(req.params.applicationId, req.user.id, { status, reviewNotes })
    return sendSuccess(res, { application: updated.toJSON() }, `Application ${status || 'updated'}`)
  } catch (error) {
    return sendError(res, error.message || 'Failed to review application', 400)
  }
}

export async function bulkReviewApplications(req, res) {
  try {
    const { applicationIds, status } = req.body
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return sendError(res, 'applicationIds must be a non-empty array', 400)
    }
    if (!['reviewed', 'accepted', 'rejected'].includes(status)) {
      return sendError(res, 'Status must be one of: reviewed, accepted, rejected', 400)
    }

    const results = await applicationService.bulkUpdateStatus(applicationIds, status)
    return sendSuccess(res, { applications: results }, `${results.length} applications updated to ${status}`)
  } catch (error) {
    return sendError(res, error.message || 'Failed to bulk update applications', 400)
  }
}

// ─── Stats ──────────────────────────────────────────────

export async function getApplicationStats(req, res) {
  try {
    const stats = await applicationService.getApplicationStats(req.user.id)
    return sendSuccess(res, stats, 'Application stats retrieved')
  } catch (error) {
    return sendError(res, 'Failed to get application stats', 400)
  }
}
