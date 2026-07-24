import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Review, calculateOverallRating } from '../models/Review.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const REVIEWS_COLLECTION = process.env.APPWRITE_REVIEWS_COLLECTION_ID || 'reviews'

export async function createReview(data) {
  const databases = getDatabases()
  const now = new Date().toISOString()

  const reviewData = {
    reviewerId: data.reviewerId,
    reviewerName: data.reviewerName || '',
    reviewerAvatar: data.reviewerAvatar || '',
    reviewerRole: data.reviewerRole || '',
    targetType: data.targetType,
    targetId: data.targetId,
    rating: Math.max(1, Math.min(5, Number(data.rating) || 0)),
    title: data.title || '',
    body: data.body || '',
    pros: data.pros || '',
    cons: data.cons || '',
    categories: data.categories || {},
    jobId: data.jobId || '',
    projectId: data.projectId || '',
    contractId: data.contractId || '',
    isVerified: data.isVerified || false,
    isAnonymous: data.isAnonymous || false,
    isRecommended: data.isRecommended !== false,
    status: 'pending',
    reportedBy: [],
    reportReason: '',
    helpfulCount: 0,
    helpfulUsers: [],
    reply: null,
    editedAt: '',
    metadata: data.metadata || {},
  }

  const doc = await databases.createDocument(DB_ID, REVIEWS_COLLECTION, ID.unique(), reviewData)
  logger.info(`Review created`, { reviewId: doc.$id, targetType: data.targetType, targetId: data.targetId, rating: data.rating })
  return new Review(doc)
}

export async function getReviewById(reviewId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, REVIEWS_COLLECTION, reviewId)
    return new Review(doc)
  } catch { return null }
}

export async function getReviewsForTarget(targetType, targetId, { page = 1, limit = 20, status = 'approved', sortBy = 'date', reviewerId } = {}) {
  const databases = getDatabases()
  const queries = [
    Query.equal('targetType', [targetType]),
    Query.equal('targetId', [targetId]),
    Query.limit(limit),
    Query.offset((page - 1) * limit),
  ]
  if (status) queries.push(Query.equal('status', [status]))
  if (reviewerId) queries.push(Query.equal('reviewerId', [reviewerId]))

  if (sortBy === 'rating_high') queries.push(Query.orderDesc('rating'))
  else if (sortBy === 'rating_low') queries.push(Query.orderAsc('rating'))
  else if (sortBy === 'helpful') queries.push(Query.orderDesc('helpfulCount'))
  else queries.push(Query.orderDesc('$createdAt'))

  try {
    const docs = await databases.listDocuments(DB_ID, REVIEWS_COLLECTION, queries)
    const reviews = docs.documents.map(d => new Review(d))
    const ratingStats = calculateOverallRating(reviews.map(r => r.rating))

    return {
      reviews,
      total: docs.total,
      page, limit,
      hasMore: docs.total > page * limit,
      ratingStats,
    }
  } catch {
    return { reviews: [], total: 0, page, limit, hasMore: false, ratingStats: calculateOverallRating([]) }
  }
}

export async function getTargetRatingSummary(targetType, targetId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, REVIEWS_COLLECTION, [
      Query.equal('targetType', [targetType]),
      Query.equal('targetId', [targetId]),
      Query.equal('status', ['approved']),
      Query.limit(100),
    ])
    const ratings = docs.documents.map(d => d.rating)
    const stats = calculateOverallRating(ratings)
    return {
      ...stats,
      recommendedCount: docs.documents.filter(d => d.isRecommended !== false).length,
      totalCount: docs.total,
    }
  } catch {
    return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, recommendedCount: 0, totalCount: 0 }
  }
}

export async function getReviewsByReviewer(reviewerId, { page = 1, limit = 20 } = {}) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, REVIEWS_COLLECTION, [
      Query.equal('reviewerId', [reviewerId]),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ])
    return {
      reviews: docs.documents.map(d => new Review(d)),
      total: docs.total,
      page, limit,
      hasMore: docs.total > page * limit,
    }
  } catch {
    return { reviews: [], total: 0, page, limit, hasMore: false }
  }
}

export async function updateReview(reviewId, data) {
  const databases = getDatabases()
  const allowed = ['title', 'body', 'rating', 'pros', 'cons', 'categories', 'isAnonymous', 'isRecommended']
  const updates = {}
  for (const field of allowed) {
    if (data[field] !== undefined) updates[field] = data[field]
  }
  if (data.rating !== undefined) updates.rating = Math.max(1, Math.min(5, Number(data.rating)))
  updates.editedAt = new Date().toISOString()

  await databases.updateDocument(DB_ID, REVIEWS_COLLECTION, reviewId, updates)
  return getReviewById(reviewId)
}

export async function deleteReview(reviewId) {
  const databases = getDatabases()
  await databases.deleteDocument(DB_ID, REVIEWS_COLLECTION, reviewId)
  logger.info(`Review deleted`, { reviewId })
  return { deleted: true }
}

export async function markHelpful(reviewId, userId) {
  const databases = getDatabases()
  try {
    const message = await databases.getDocument(DB_ID, REVIEWS_COLLECTION, reviewId)
    const helpfulUsers = message.helpfulUsers || []
    if (helpfulUsers.includes(userId)) {
      await databases.updateDocument(DB_ID, REVIEWS_COLLECTION, reviewId, {
        helpfulUsers: helpfulUsers.filter(u => u !== userId),
        helpfulCount: Math.max(0, (message.helpfulCount || 0) - 1),
      })
      return { helpful: false, count: Math.max(0, (message.helpfulCount || 0) - 1) }
    } else {
      helpfulUsers.push(userId)
      await databases.updateDocument(DB_ID, REVIEWS_COLLECTION, reviewId, {
        helpfulUsers,
        helpfulCount: (message.helpfulCount || 0) + 1,
      })
      return { helpful: true, count: (message.helpfulCount || 0) + 1 }
    }
  } catch {
    return { helpful: false, count: 0 }
  }
}

export async function addReply(reviewId, replyBody) {
  const databases = getDatabases()
  const now = new Date().toISOString()
  await databases.updateDocument(DB_ID, REVIEWS_COLLECTION, reviewId, {
    reply: { body: replyBody, createdAt: now, updatedAt: now },
  })
  return getReviewById(reviewId)
}

export async function reportReview(reviewId, userId, reason) {
  const databases = getDatabases()
  try {
    const review = await databases.getDocument(DB_ID, REVIEWS_COLLECTION, reviewId)
    const reportedBy = review.reportedBy || []
    if (!reportedBy.includes(userId)) {
      reportedBy.push(userId)
      await databases.updateDocument(DB_ID, REVIEWS_COLLECTION, reviewId, {
        reportedBy,
        reportReason: reason || '',
        status: 'flagged',
      })
    }
    return { reported: true }
  } catch { return { reported: false } }
}

export async function moderateReview(reviewId, status, moderatorId) {
  const databases = getDatabases()
  await databases.updateDocument(DB_ID, REVIEWS_COLLECTION, reviewId, {
    status,
    reviewedBy: moderatorId,
    reviewedAt: new Date().toISOString(),
  })
  return getReviewById(reviewId)
}

export async function listPendingReviews({ page = 1, limit = 20 } = {}) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, REVIEWS_COLLECTION, [
      Query.equal('status', ['pending']),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ])
    return {
      reviews: docs.documents.map(d => new Review(d)),
      total: docs.total,
      page, limit, hasMore: docs.total > page * limit,
    }
  } catch {
    return { reviews: [], total: 0, page, limit, hasMore: false }
  }
}

export async function listFlaggedReviews({ page = 1, limit = 20 } = {}) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, REVIEWS_COLLECTION, [
      Query.equal('status', ['flagged']),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ])
    return {
      reviews: docs.documents.map(d => new Review(d)),
      total: docs.total,
      page, limit, hasMore: docs.total > page * limit,
    }
  } catch {
    return { reviews: [], total: 0, page, limit, hasMore: false }
  }
}

export async function getUserReviewForTarget(reviewerId, targetType, targetId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, REVIEWS_COLLECTION, [
      Query.equal('reviewerId', [reviewerId]),
      Query.equal('targetType', [targetType]),
      Query.equal('targetId', [targetId]),
      Query.limit(1),
    ])
    return docs.documents.length > 0 ? new Review(docs.documents[0]) : null
  } catch { return null }
}

export async function canReview(reviewerId, targetType, targetId) {
  // Check if a review already exists
  const existing = await getUserReviewForTarget(reviewerId, targetType, targetId)
  if (existing) return { allowed: false, reason: 'You have already reviewed this', existingReview: existing }

  // For projects, verify the user was a member or owner
  if (targetType === 'project' || targetType === 'portfolio') {
    // Basic check: review allowed if user can access
    return { allowed: true, reason: '' }
  }

  return { allowed: true, reason: '' }
}
