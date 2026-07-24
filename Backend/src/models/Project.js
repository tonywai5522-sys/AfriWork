export class Project {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.status = data.status || 'draft'
    this.visibility = data.visibility || 'private'
    this.ownerId = data.ownerId || ''
    this.organizationId = data.organizationId || ''
    this.startDate = data.startDate || ''
    this.endDate = data.endDate || ''
    this.budget = data.budget || 0
    this.currency = data.currency || 'USD'
    this.progress = data.progress || 0
    this.members = data.members || []
    this.categories = data.categories || []
    this.tags = data.tags || []
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  get memberCount() {
    return this.members.length
  }

  isOwner(userId) {
    return this.ownerId === userId
  }

  getMember(userId) {
    return this.members.find(m => m.userId === userId) || null
  }

  updateProgress(progress) {
    this.progress = Math.max(0, Math.min(100, Number(progress)))
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      visibility: this.visibility,
      ownerId: this.ownerId,
      organizationId: this.organizationId,
      startDate: this.startDate,
      endDate: this.endDate,
      budget: this.budget,
      currency: this.currency,
      progress: this.progress,
      members: this.members,
      categories: this.categories,
      tags: this.tags,
      memberCount: this.memberCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}