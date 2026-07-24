import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import { logger } from '../utils/logger.js'
import { validateJobCreatePayload, validateJobUpdatePayload } from '../validators/jobValidator.js'
import * as jobService from '../services/jobService.js'

export async function createJob(req, res) {
  try {
    const validation = validateJobCreatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)
    const job = await jobService.createJob(req.user.id, { ...req.body, companyName: req.body.companyName || req.user.name })
    return sendSuccess(res, { job: job.toJSON() }, 'Job created')
  } catch (error) { logger.error('createJob failed', { error: error.message }); return sendError(res, 'Failed to create job', 400) }
}

export async function updateJob(req, res) {
  try {
    const validation = validateJobUpdatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)
    const job = await jobService.updateJob(req.params.jobId, req.body)
    if (!job) return sendError(res, 'Job not found', 404)
    return sendSuccess(res, { job: job.toJSON() }, 'Job updated')
  } catch (error) { return sendError(res, 'Failed to update job', 400) }
}

export async function getJob(req, res) {
  try {
    const job = await jobService.getJobById(req.params.jobId)
    if (!job) return sendError(res, 'Job not found', 404)
    return sendSuccess(res, { job: job.toJSON() }, 'Job retrieved')
  } catch (error) { return sendError(res, 'Job not found', 404) }
}

export async function searchJobs(req, res) {
  try {
    const { query, location, remote, jobType, category, experienceLevel, skills, salaryMin, salaryMax, status, featured, employerId, sortBy, sortOrder, page, limit } = req.query
    const result = await jobService.searchJobs({
      query, location, remote: remote !== undefined ? remote === 'true' : undefined,
      jobType, category, experienceLevel,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',')) : undefined,
      salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
      status, featured: featured === 'true' ? true : undefined,
      employerId, sortBy, sortOrder,
      page: parseInt(page) || 1, limit: Math.min(50, parseInt(limit) || 12),
    })
    return sendSuccess(res, result, 'Jobs retrieved')
  } catch (error) { return sendError(res, 'Failed to search jobs', 400) }
}

export async function getEmployerJobs(req, res) {
  try {
    const result = await jobService.getEmployerJobs(req.user.id)
    return sendSuccess(res, result, 'Employer jobs retrieved')
  } catch (error) { return sendError(res, 'Failed to get jobs', 400) }
}

export async function incrementView(req, res) {
  try {
    const job = await jobService.incrementViewCount(req.params.jobId)
    if (!job) return sendError(res, 'Job not found', 404)
    return sendSuccess(res, { job: job.toJSON() }, 'View counted')
  } catch (error) { return sendError(res, 'Failed to increment view', 400) }
}

export async function toggleFeatured(req, res) {
  try {
    const job = await jobService.getJobById(req.params.jobId)
    if (!job) return sendError(res, 'Job not found', 404)
    const updated = await jobService.updateJob(req.params.jobId, { isFeatured: !job.isFeatured })
    return sendSuccess(res, { job: updated.toJSON() }, `Job ${updated.isFeatured ? 'featured' : 'unfeatured'}`)
  } catch (error) { return sendError(res, 'Failed to toggle featured', 400) }
}

export async function bookmarkJob(req, res) {
  try {
    const { jobId } = req.body
    if (!jobId) return sendError(res, 'jobId is required', 400)
    const result = await jobService.bookmarkJob(req.user.id, jobId)
    return sendSuccess(res, result, result.bookmarked ? 'Job bookmarked' : 'Already bookmarked')
  } catch (error) { return sendError(res, 'Failed to bookmark job', 400) }
}

export async function unbookmarkJob(req, res) {
  try {
    const result = await jobService.unbookmarkJob(req.user.id, req.params.jobId)
    return sendSuccess(res, result, 'Bookmark removed')
  } catch (error) { return sendError(res, 'Failed to remove bookmark', 400) }
}

export async function getBookmarkedJobs(req, res) {
  try {
    const ids = await jobService.getBookmarkedJobIds(req.user.id)
    return sendSuccess(res, { ids }, 'Bookmarked job IDs retrieved')
  } catch (error) { return sendError(res, 'Failed to get bookmarks', 400) }
}
