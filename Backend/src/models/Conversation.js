export class Conversation {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.type = data.type || 'direct' // 'direct' or 'group'
    this.title = data.title || ''
    this.avatar = data.avatar || ''
    this.participants = data.participants || []
    this.lastMessage = data.lastMessage || null
    this.lastActivity = data.lastActivity || ''
    this.createdBy = data.createdBy || ''
    this.projectId = data.projectId || ''
    this.teamId = data.teamId || ''
    this.metadata = data.metadata || {}
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  get participantCount() {
    return this.participants.length
  }

  isParticipant(userId) {
    return this.participants.some(p => p.userId === userId)
  }

  getParticipant(userId) {
    return this.participants.find(p => p.userId === userId) || null
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      avatar: this.avatar,
      participants: this.participants,
      lastMessage: this.lastMessage,
      lastActivity: this.lastActivity,
      createdBy: this.createdBy,
      projectId: this.projectId,
      teamId: this.teamId,
      metadata: this.metadata,
      participantCount: this.participantCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class ConversationParticipant {
  constructor(data = {}) {
    this.id = data.id || `cp_${Date.now()}`
    this.userId = data.userId || ''
    this.name = data.name || ''
    this.email = data.email || ''
    this.avatarUrl = data.avatarUrl || ''
    this.role = data.role || 'member' // 'admin', 'member'
    this.joinedAt = data.joinedAt || new Date().toISOString()
    this.lastReadAt = data.lastReadAt || ''
    this.isTyping = data.isTyping || false
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      email: this.email,
      avatarUrl: this.avatarUrl,
      role: this.role,
      joinedAt: this.joinedAt,
      lastReadAt: this.lastReadAt,
      isTyping: this.isTyping,
    }
  }
}
