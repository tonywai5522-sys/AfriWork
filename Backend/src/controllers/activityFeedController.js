import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as activityFeedService from '../services/activityFeedService.js'

export async function getProjectActivity(req, res) {
  try {
    const { page, limit } = req.query
    const result = await activityFeedService.getProjectActivity(req.params.projectId, {
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 30),
    })
    return sendSuccess(res, {
      entries: result.entries.map(e => e.toJSON()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }, 'Activity feed retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve activity feed', 400)
  }
}
