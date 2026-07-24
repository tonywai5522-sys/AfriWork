export class Message {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.conversationId = data.conversationId || ''
    this.senderId = data.senderId || ''
    this.senderName = data.senderName || ''
    this.senderAvatar = data.senderAvatar || ''
    this.content = data.content || ''
    this.type = data.type || 'text' // 'text', 'image', 'file', 'system'
    this.attachments = data.attachments || []
    this.replyTo = data.replyTo || null
    this.reactions = data.reactions || []
    this.readBy = data.readBy || []
    this.deliveredTo = data.deliveredTo || []
    this.isEdited = data.isEdited || false
    this.isDeleted = data.isDeleted || false
    this.metadata = data.metadata || {}
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  get readCount() {
    return this.readBy.length
  }

  get reactionCount() {
    return this.reactions.length
  }

  isReadBy(userId) {
    return this.readBy.some(r => r.userId === userId)
  }

  isDeliveredTo(userId) {
    return this.deliveredTo.some(d => d.userId === userId)
  }

  addReaction(userId, emoji) {
    const existing = this.reactions.find(r => r.userId === userId && r.emoji === emoji)
    if (existing) {
      this.reactions = this.reactions.filter(r => r.id !== existing.id)
      return false
    }
    this.reactions.push({ id: `rxn_${Date.now()}`, userId, emoji, createdAt: new Date().toISOString() })
    return true
  }

  toJSON() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      senderName: this.senderName,
      senderAvatar: this.senderAvatar,
      content: this.content,
      type: this.type,
      attachments: this.attachments,
      replyTo: this.replyTo,
      reactions: this.reactions,
      readBy: this.readBy,
      deliveredTo: this.deliveredTo,
      isEdited: this.isEdited,
      isDeleted: this.isDeleted,
      metadata: this.metadata,
      readCount: this.readCount,
      reactionCount: this.reactionCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class MessageAttachment {
  constructor(data = {}) {
    this.id = data.id || `att_${Date.now()}`
    this.name = data.name || ''
    this.url = data.url || ''
    this.type = data.type || '' // mime type
    this.size = data.size || 0
    this.width = data.width || 0
    this.height = data.height || 0
    this.thumbnailUrl = data.thumbnailUrl || ''
  }

  get isImage() {
    return this.type.startsWith('image/')
  }

  get isVideo() {
    return this.type.startsWith('video/')
  }

  get sizeFormatted() {
    if (this.size < 1024) return `${this.size} B`
    if (this.size < 1024 * 1024) return `${(this.size / 1024).toFixed(1)} KB`
    return `${(this.size / (1024 * 1024)).toFixed(1)} MB`
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      type: this.type,
      size: this.size,
      width: this.width,
      height: this.height,
      thumbnailUrl: this.thumbnailUrl,
    }
  }
}
