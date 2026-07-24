export class Task {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.projectId = data.projectId || ''
    this.taskListId = data.taskListId || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.priority = data.priority || 'none'
    this.status = data.status || 'backlog'
    this.position = data.position || 0
    this.assigneeId = data.assigneeId || ''
    this.assigneeName = data.assigneeName || ''
    this.dueDate = data.dueDate || ''
    this.startDate = data.startDate || ''
    this.estimatedHours = data.estimatedHours || 0
    this.loggedHours = data.loggedHours || 0
    this.progress = data.progress || 0
    this.milestoneId = data.milestoneId || ''
    this.labels = data.labels || []
    this.attachments = data.attachments || []
    this.commentCount = data.commentCount || 0
    this.isArchived = data.isArchived || false
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  get statusLabel() {
    const labels = {
      backlog: 'Backlog',
      todo: 'To Do',
      in_progress: 'In Progress',
      in_review: 'In Review',
      done: 'Done',
      cancelled: 'Cancelled',
    }
    return labels[this.status] || this.status
  }

  get priorityLabel() {
    const labels = {
      none: 'None',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    }
    return labels[this.priority] || this.priority
  }

  get priorityColor() {
    const colors = {
      none: '#6b7280',
      low: '#22c55e',
      medium: '#eab308',
      high: '#f97316',
      urgent: '#ef4444',
    }
    return colors[this.priority] || '#6b7280'
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      taskListId: this.taskListId,
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      position: this.position,
      assigneeId: this.assigneeId,
      assigneeName: this.assigneeName,
      dueDate: this.dueDate,
      startDate: this.startDate,
      estimatedHours: this.estimatedHours,
      loggedHours: this.loggedHours,
      progress: this.progress,
      milestoneId: this.milestoneId,
      labels: this.labels,
      attachments: this.attachments,
      commentCount: this.commentCount,
      isArchived: this.isArchived,
      statusLabel: this.statusLabel,
      priorityLabel: this.priorityLabel,
      priorityColor: this.priorityColor,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}