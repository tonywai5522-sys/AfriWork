import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import { logger } from '../utils/logger.js'
import {
  validateOrganizationCreatePayload,
  validateOrganizationUpdatePayload,
  validateRecruiterInvitePayload,
} from '../validators/organizationValidator.js'
import * as orgService from '../services/organizationService.js'
import * as notificationService from '../services/notificationService.js'

export async function getMyOrganization(req, res) {
  try {
    const org = await orgService.getOrganizationByOwner(req.user.id)
    if (!org) return sendSuccess(res, { organization: null }, 'No organization found')
    return sendSuccess(res, { organization: org.toJSON() }, 'Organization retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve organization', 400)
  }
}

export async function createOrganization(req, res) {
  try {
    const validation = validateOrganizationCreatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    const existing = await orgService.getOrganizationByOwner(req.user.id)
    if (existing) return sendError(res, 'You already have an organization', 409)

    const org = await orgService.createOrganization(req.user.id, {
      ...req.body,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
    })
    return sendSuccess(res, { organization: org.toJSON() }, 'Organization created successfully')
  } catch (error) {
    logger.error(`Organization creation failed`, { userId: req.user.id, error: error.message })
    return sendError(res, error?.message || 'Failed to create organization', 400)
  }
}

export async function updateOrganization(req, res) {
  try {
    const validation = validateOrganizationUpdatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    let org = await orgService.getOrganizationByOwner(req.user.id)
    if (!org) return sendError(res, 'Organization not found', 404)
    if (org.ownerId !== req.user.id) return sendError(res, 'Only the owner can update the organization', 403)

    org = await orgService.updateOrganization(org.id, req.body)
    return sendSuccess(res, { organization: org.toJSON() }, 'Organization updated')
  } catch (error) {
    return sendError(res, 'Failed to update organization', 400)
  }
}

export async function uploadLogo(req, res) {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400)
    const org = await orgService.getOrganizationByOwner(req.user.id)
    if (!org) return sendError(res, 'Organization not found', 404)
    if (org.ownerId !== req.user.id) return sendError(res, 'Unauthorized', 403)

    const result = await orgService.uploadOrganizationLogo(org.id, req.file)
    return sendSuccess(res, result, 'Logo uploaded')
  } catch (error) {
    return sendError(res, 'Failed to upload logo', 400)
  }
}

export async function updateBranding(req, res) {
  try {
    const org = await orgService.getOrganizationByOwner(req.user.id)
    if (!org) return sendError(res, 'Organization not found', 404)
    if (org.ownerId !== req.user.id) return sendError(res, 'Unauthorized', 403)

    const branding = {
      ...org.branding,
      ...req.body,
    }
    await orgService.updateOrganization(org.id, { branding })
    return sendSuccess(res, { branding }, 'Branding updated')
  } catch (error) {
    return sendError(res, 'Failed to update branding', 400)
  }
}

export async function requestVerification(req, res) {
  try {
    const org = await orgService.getOrganizationByOwner(req.user.id)
    if (!org) return sendError(res, 'Organization not found', 404)
    if (org.ownerId !== req.user.id) return sendError(res, 'Unauthorized', 403)

    const result = await orgService.requestVerification(org.id, req.body.documents || {})
    return sendSuccess(res, result, 'Verification requested')
  } catch (error) {
    return sendError(res, 'Failed to request verification', 400)
  }
}

// Admin: verify or reject an organization
export async function verifyOrganization(req, res) {
  try {
    const { status } = req.body
    if (!['verified', 'rejected'].includes(status)) {
      return sendError(res, 'Status must be "verified" or "rejected"', 400)
    }
    const result = await orgService.verifyOrganization(req.params.orgId, status)
    return sendSuccess(res, result, `Organization ${status}`)
  } catch (error) {
    return sendError(res, 'Failed to update verification', 400)
  }
}

export async function getOrganizationById(req, res) {
  try {
    const org = await orgService.getOrganizationById(req.params.orgId)
    if (!org) return sendError(res, 'Organization not found', 404)
    return sendSuccess(res, { organization: org.toJSON() }, 'Organization retrieved')
  } catch (error) {
    return sendError(res, 'Organization not found', 404)
  }
}

export async function listOrganizations(req, res) {
  try {
    const { page, limit, verified } = req.query
    const result = await orgService.listOrganizations({
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 12),
      verified: verified !== undefined ? verified === 'true' : undefined,
    })
    return sendSuccess(res, result, 'Organizations retrieved')
  } catch (error) {
    return sendError(res, 'Failed to list organizations', 400)
  }
}

export async function addRecruiter(req, res) {
  try {
    const validation = validateRecruiterInvitePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    const org = await orgService.getOrganizationByOwner(req.user.id)
    if (!org) return sendError(res, 'Organization not found', 404)

    const recruiter = await orgService.addRecruiter(org.id, {
      ...req.body,
      invitedBy: req.user.id,
      invitedByName: req.user.name,
    })

    // Send notification to invitee if they exist
    try {
      await notificationService.createNotification({
        recipientId: req.body.userId || req.body.email,
        type: 'recruiter_invite',
        title: `Invitation to join ${org.name}`,
        body: `You've been invited to join ${org.name} as a ${req.body.role || 'recruiter'}`,
        entityType: 'organization',
        entityId: org.id,
      })
    } catch { /* notification is best-effort */ }

    return sendSuccess(res, { recruiter: recruiter.toJSON() }, 'Recruiter invited')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to invite recruiter', 400)
  }
}

export async function updateRecruiter(req, res) {
  try {
    const org = await orgService.getOrganizationByOwner(req.user.id)
    if (!org) return sendError(res, 'Organization not found', 404)

    await orgService.updateRecruiter(org.id, req.params.recruiterId, req.body)
    return sendSuccess(res, null, 'Recruiter updated')
  } catch (error) {
    return sendError(res, 'Failed to update recruiter', 400)
  }
}

export async function removeRecruiter(req, res) {
  try {
    const org = await orgService.getOrganizationByOwner(req.user.id)
    if (!org) return sendError(res, 'Organization not found', 404)

    await orgService.removeRecruiter(org.id, req.params.recruiterId)
    return sendSuccess(res, null, 'Recruiter removed')
  } catch (error) {
    return sendError(res, 'Failed to remove recruiter', 400)
  }
}

export async function getEmployerDashboard(req, res) {
  try {
    const data = await orgService.getEmployerDashboard(req.user.id)
    return sendSuccess(res, data, 'Dashboard data retrieved')
  } catch (error) {
    return sendError(res, 'Failed to get dashboard data', 400)
  }
}
