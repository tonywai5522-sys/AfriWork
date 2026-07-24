export class Comment {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.entityType = data.entityType || ''
    this.entityId = data.entityId || ''
    this.authorId = data.authorId || ''
    this.authorName = data.authorName || ''
    this.authorAvatar = data.authorAvatar || ''
    this.content = data.content || ''
    this.parentId = data.parentId || null
    this.mentions = data.mentions || []
    this.attachments = data.attachments || []
    this.isEdited = data.isEdited || false
    this.editedAt = data.editedAt || ''
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  get isReply() {
    return this.parentId !== null && this.parentId !== ''
  }

  get timeAgo() {
    if (!this.createdAt) return ''
    const now = new Date()
    const created = new Date(this.createdAt)
    const diffMs = now - created
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffSeconds < 60) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffWeeks < 4) return `${diffWeeks}w ago`
    return `${diffMonths}mo ago`
  }

  toJSON() {
    return {
      id: this.id,
      entityType: this.entityType,
      entityId: this.entityId,
      authorId: this.authorId,
      authorName: this.authorName,
      authorAvatar: this.authorAvatar,
      content: this.content,
      parentId: this.parentId,
      mentions: this.mentions,
      attachments: this.attachments,
      isEdited: this.isEdited,
      editedAt: this.editedAt,
      isReply: this.isReply,
      timeAgo: this.timeAgo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}