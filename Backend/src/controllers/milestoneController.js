import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as milestoneService from '../services/milestoneService.js'
import { validateMilestoneCreatePayload, validateMilestoneUpdatePayload } from '../validators/milestoneValidator.js'

export async function createMilestone(req, res) {
  try {
    const validation = validateMilestoneCreatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const milestone = await milestoneService.createMilestone(req.user.id, req.body)
    return sendSuccess(res, { milestone: milestone.toJSON() }, 'Milestone created')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to create milestone', 400)
  }
}

export async function getMilestoneById(req, res) {
  try {
    const milestone = await milestoneService.getMilestoneById(req.params.milestoneId)
    if (!milestone) return sendError(res, 'Milestone not found', 404)
    return sendSuccess(res, { milestone: milestone.toJSON() }, 'Milestone retrieved')
  } catch (error) {
    return sendError(res, 'Milestone not found', 404)
  }
}

export async function updateMilestone(req, res) {
  try {
    const validation = validateMilestoneUpdatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const milestone = await milestoneService.getMilestoneById(req.params.milestoneId)
    if (!milestone) return sendError(res, 'Milestone not found', 404)

    const updated = await milestoneService.updateMilestone(req.params.milestoneId, {
      ...req.body,
      updatedBy: req.user.id,
      completedBy: req.body.status === 'completed' ? req.user.id : undefined,
    })
    return sendSuccess(res, { milestone: updated.toJSON() }, 'Milestone updated')
  } catch (error) {
    return sendError(res, 'Failed to update milestone', 400)
  }
}

export async function deleteMilestone(req, res) {
  try {
    const milestone = await milestoneService.getMilestoneById(req.params.milestoneId)
    if (!milestone) return sendError(res, 'Milestone not found', 404)

    await milestoneService.deleteMilestone(req.params.milestoneId)
    return sendSuccess(res, null, 'Milestone deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete milestone', 400)
  }
}

export async function getProjectMilestones(req, res) {
  try {
    const { page, limit, status } = req.query
    const result = await milestoneService.getProjectMilestones(req.params.projectId, {
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 20),
      status,
    })
    return sendSuccess(res, {
      milestones: result.milestones.map(m => m.toJSON()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }, 'Milestones retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve milestones', 400)
  }
}
