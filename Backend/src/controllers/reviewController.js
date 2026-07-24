import * as reviewService from '../services/reviewService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'

export async function createReview(req, res) {
  try {
    if (!req.body.targetType || !req.body.targetId) return sendError(res, 'targetType and targetId are required', 400)
    if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) return sendError(res, 'Rating must be between 1 and 5', 400)

    const can = await reviewService.canReview(req.user.id, req.body.targetType, req.body.targetId)
    if (!can.allowed) return sendError(res, can.reason, 400)

    const review = await reviewService.createReview({
      ...req.body,
      reviewerId: req.user.id,
      reviewerName: req.user.name,
      reviewerRole: req.user.role,
    })
    return sendSuccess(res, { review: review.toJSON() }, 'Review submitted for moderation')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getReviews(req, res) {
  try {
    const { targetType, targetId } = req.params
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const sortBy = req.query.sortBy || 'date'
    const status = req.query.status || 'approved'

    const result = await reviewService.getReviewsForTarget(targetType, targetId, { page, limit, sortBy, status })
    return sendSuccess(res, result, 'Reviews retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getRatingSummary(req, res) {
  try {
    const { targetType, targetId } = req.params
    const summary = await reviewService.getTargetRatingSummary(targetType, targetId)
    return sendSuccess(res, summary, 'Rating summary retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getMyReview(req, res) {
  try {
    const { targetType, targetId } = req.params
    const review = await reviewService.getUserReviewForTarget(req.user.id, targetType, targetId)
    return sendSuccess(res, { review: review ? review.toJSON() : null }, 'Review retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function updateReview(req, res) {
  try {
    const review = await reviewService.getReviewById(req.params.id)
    if (!review) return sendError(res, 'Review not found', 404)
    if (review.reviewerId !== req.user.id && req.user.role !== 'admin') return sendError(res, 'Access denied', 403)

    const updated = await reviewService.updateReview(req.params.id, req.body)
    return sendSuccess(res, { review: updated.toJSON() }, 'Review updated')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function deleteReview(req, res) {
  try {
    const review = await reviewService.getReviewById(req.params.id)
    if (!review) return sendError(res, 'Review not found', 404)
    if (review.reviewerId !== req.user.id && req.user.role !== 'admin') return sendError(res, 'Access denied', 403)

    await reviewService.deleteReview(req.params.id)
    return sendSuccess(res, null, 'Review deleted')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function markHelpful(req, res) {
  try {
    const result = await reviewService.markHelpful(req.params.id, req.user.id)
    return sendSuccess(res, result, 'Helpful status updated')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function addReply(req, res) {
  try {
    const { body } = req.body
    if (!body?.trim()) return sendError(res, 'Reply body is required', 400)

    const review = await reviewService.getReviewById(req.params.id)
    if (!review) return sendError(res, 'Review not found', 404)

    const updated = await reviewService.addReply(req.params.id, body)
    return sendSuccess(res, { review: updated.toJSON() }, 'Reply added')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function reportReview(req, res) {
  try {
    const { reason } = req.body
    const result = await reviewService.reportReview(req.params.id, req.user.id, reason)
    return sendSuccess(res, result, 'Review reported')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function moderateReview(req, res) {
  try {
    const { status } = req.body
    if (!['approved', 'rejected'].includes(status)) return sendError(res, 'Status must be approved or rejected', 400)

    const review = await reviewService.moderateReview(req.params.id, status, req.user.id)
    return sendSuccess(res, { review: review.toJSON() }, `Review ${status}`)
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getPendingReviews(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const result = await reviewService.listPendingReviews({ page, limit })
    return sendSuccess(res, result, 'Pending reviews retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getFlaggedReviews(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const result = await reviewService.listFlaggedReviews({ page, limit })
    return sendSuccess(res, result, 'Flagged reviews retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getMyReviews(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const result = await reviewService.getReviewsByReviewer(req.user.id, { page, limit })
    return sendSuccess(res, result, 'My reviews retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function canReviewTarget(req, res) {
  try {
    const { targetType, targetId } = req.params
    const result = await reviewService.canReview(req.user.id, targetType, targetId)
    return sendSuccess(res, result, 'Review eligibility checked')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}
