export class Review {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.reviewerId = data.reviewerId || ''
    this.reviewerName = data.reviewerName || ''
    this.reviewerAvatar = data.reviewerAvatar || ''
    this.reviewerRole = data.reviewerRole || ''
    this.targetType = data.targetType || '' // 'talent', 'employer', 'organization', 'project', 'portfolio'
    this.targetId = data.targetId || ''
    this.rating = data.rating || 0
    this.title = data.title || ''
    this.body = data.body || ''
    this.pros = data.pros || ''
    this.cons = data.cons || ''
    this.categories = data.categories || {} // e.g. { communication: 5, quality: 4, timeliness: 5, professionalism: 4 }
    this.jobId = data.jobId || ''
    this.projectId = data.projectId || ''
    this.contractId = data.contractId || ''
    this.isVerified = data.isVerified || false
    this.isAnonymous = data.isAnonymous || false
    this.isRecommended = data.isRecommended || true
    this.status = data.status || 'pending' // 'pending', 'approved', 'flagged', 'rejected'
    this.reportedBy = data.reportedBy || []
    this.reportReason = data.reportReason || ''
    this.reviewedBy = data.reviewedBy || '' // moderator/admin who reviewed
    this.reviewedAt = data.reviewedAt || ''
    this.helpfulCount = data.helpfulCount || 0
    this.helpfulUsers = data.helpfulUsers || []
    this.reply = data.reply || null // { body, createdAt, updatedAt }
    this.editedAt = data.editedAt || ''
    this.metadata = data.metadata || {}
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  get isValid() {
    return this.rating >= 1 && this.rating <= 5 && this.body?.trim()
  }

  get ratingColor() {
    if (this.rating >= 4) return 'emerald'
    if (this.rating >= 3) return 'amber'
    return 'red'
  }

  get statusLabel() {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1)
  }

  toJSON() {
    return {
      id: this.id,
      reviewerId: this.reviewerId,
      reviewerName: this.isAnonymous ? 'Anonymous' : this.reviewerName,
      reviewerAvatar: this.isAnonymous ? '' : this.reviewerAvatar,
      reviewerRole: this.reviewerRole,
      targetType: this.targetType,
      targetId: this.targetId,
      rating: this.rating,
      title: this.title,
      body: this.body,
      pros: this.pros,
      cons: this.cons,
      categories: this.categories,
      jobId: this.jobId,
      projectId: this.projectId,
      contractId: this.contractId,
      isVerified: this.isVerified,
      isAnonymous: this.isAnonymous,
      isRecommended: this.isRecommended,
      status: this.status,
      helpfulCount: this.helpfulCount,
      helpfulUsers: this.helpfulUsers,
      reply: this.reply,
      editedAt: this.editedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export function calculateOverallRating(ratings) {
  if (!ratings || ratings.length === 0) return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }

  let sum = 0
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of ratings) {
    const val = Math.round(r)
    if (val >= 1 && val <= 5) {
      sum += val
      distribution[val] = (distribution[val] || 0) + 1
    }
  }
  return {
    average: ratings.length > 0 ? +(sum / ratings.length).toFixed(1) : 0,
    count: ratings.length,
    distribution,
  }
}
