import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as commentService from '../services/commentService.js'
import { validateCommentCreatePayload, validateCommentUpdatePayload } from '../validators/commentValidator.js'

export async function createComment(req, res) {
  try {
    const validation = validateCommentCreatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const comment = await commentService.createComment(req.user.id, {
      ...req.body,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
    })
    return sendSuccess(res, { comment: comment.toJSON() }, 'Comment created')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to create comment', 400)
  }
}

export async function getCommentById(req, res) {
  try {
    const comment = await commentService.getCommentById(req.params.commentId)
    if (!comment) return sendError(res, 'Comment not found', 404)
    return sendSuccess(res, { comment: comment.toJSON() }, 'Comment retrieved')
  } catch (error) {
    return sendError(res, 'Comment not found', 404)
  }
}

export async function updateComment(req, res) {
  try {
    const validation = validateCommentUpdatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const comment = await commentService.getCommentById(req.params.commentId)
    if (!comment) return sendError(res, 'Comment not found', 404)
    if (comment.authorId !== req.user.id) return sendError(res, 'You can only edit your own comments', 403)

    const updated = await commentService.updateComment(req.params.commentId, req.body)
    return sendSuccess(res, { comment: updated.toJSON() }, 'Comment updated')
  } catch (error) {
    return sendError(res, 'Failed to update comment', 400)
  }
}

export async function deleteComment(req, res) {
  try {
    const comment = await commentService.getCommentById(req.params.commentId)
    if (!comment) return sendError(res, 'Comment not found', 404)
    if (comment.authorId !== req.user.id) return sendError(res, 'You can only delete your own comments', 403)

    await commentService.deleteComment(req.params.commentId)
    return sendSuccess(res, null, 'Comment deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete comment', 400)
  }
}

export async function getEntityComments(req, res) {
  try {
    const { entityType, entityId } = req.params
    const { page, limit } = req.query
    const result = await commentService.getEntityComments(entityType, entityId, {
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 30),
    })
    return sendSuccess(res, {
      comments: result.comments.map(c => c.toJSON()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }, 'Comments retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve comments', 400)
  }
}
