export class ActivityFeedEntry {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.projectId = data.projectId || ''
    this.actorId = data.actorId || ''
    this.actorName = data.actorName || ''
    this.actorAvatar = data.actorAvatar || ''
    this.action = data.action || ''
    this.entityType = data.entityType || ''
    this.entityId = data.entityId || ''
    this.description = data.description || ''
    this.metadata = data.metadata || {}
    this.createdAt = data.$createdAt || data.createdAt || ''
  }

  get formattedAction() {
    const actions = {
      task_created: 'Created a task',
      task_updated: 'Updated a task',
      task_completed: 'Completed a task',
      task_deleted: 'Deleted a task',
      comment_added: 'Added a comment',
      comment_updated: 'Updated a comment',
      comment_deleted: 'Deleted a comment',
      member_added: 'Added a member',
      member_removed: 'Removed a member',
      member_role_changed: 'Changed a member\'s role',
      project_created: 'Created the project',
      project_updated: 'Updated the project',
      status_changed: 'Changed status',
      milestone_created: 'Created a milestone',
      milestone_completed: 'Completed a milestone',
      file_uploaded: 'Uploaded a file',
      file_deleted: 'Deleted a file',
    }
    return actions[this.action] || this.action
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
      projectId: this.projectId,
      actorId: this.actorId,
      actorName: this.actorName,
      actorAvatar: this.actorAvatar,
      action: this.action,
      entityType: this.entityType,
      entityId: this.entityId,
      description: this.description,
      metadata: this.metadata,
      formattedAction: this.formattedAction,
      timeAgo: this.timeAgo,
      createdAt: this.createdAt,
    }
  }
}