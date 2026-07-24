export class Team {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.name = data.name || ''
    this.description = data.description || ''
    this.projectId = data.projectId || ''
    this.ownerId = data.ownerId || ''
    this.organizationId = data.organizationId || ''
    this.status = data.status || 'active'
    this.members = data.members || []
    this.permissions = data.permissions || {
      canInvite: ['owner', 'admin'],
      canRemove: ['owner', 'admin'],
      canEdit: ['owner', 'admin', 'manager'],
      canView: ['owner', 'admin', 'manager', 'member'],
    }
    this.metadata = data.metadata || {}
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

  hasPermission(userId, action) {
    if (this.isOwner(userId)) return true
    const member = this.getMember(userId)
    if (!member) return false
    const roles = this.permissions[action] || []
    return roles.includes(member.role)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      projectId: this.projectId,
      ownerId: this.ownerId,
      organizationId: this.organizationId,
      status: this.status,
      members: this.members,
      permissions: this.permissions,
      metadata: this.metadata,
      memberCount: this.memberCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class TeamMember {
  constructor(data = {}) {
    this.id = data.id || `tm_${Date.now()}`
    this.userId = data.userId || ''
    this.teamId = data.teamId || ''
    this.role = data.role || 'member'
    this.name = data.name || ''
    this.email = data.email || ''
    this.avatarUrl = data.avatarUrl || ''
    this.invitedBy = data.invitedBy || ''
    this.invitedAt = data.invitedAt || new Date().toISOString()
    this.joinedAt = data.joinedAt || ''
    this.status = data.status || 'pending'
  }

  get roleLabel() {
    return this.role.charAt(0).toUpperCase() + this.role.slice(1)
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      teamId: this.teamId,
      role: this.role,
      name: this.name,
      email: this.email,
      avatarUrl: this.avatarUrl,
      invitedBy: this.invitedBy,
      invitedAt: this.invitedAt,
      joinedAt: this.joinedAt,
      status: this.status,
    }
  }
}
