export class Milestone {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.projectId = data.projectId || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.dueDate = data.dueDate || ''
    this.completedAt = data.completedAt || ''
    this.status = data.status || 'pending'
    this.progress = data.progress || 0
    this.budget = data.budget || 0
    this.currency = data.currency || 'USD'
    this.completedBy = data.completedBy || ''
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  get isOverdue() {
    if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
      return false
    }
    return new Date(this.dueDate) < new Date()
  }

  get statusLabel() {
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    return labels[this.status] || this.status
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      completedAt: this.completedAt,
      status: this.status,
      progress: this.progress,
      budget: this.budget,
      currency: this.currency,
      completedBy: this.completedBy,
      isOverdue: this.isOverdue,
      statusLabel: this.statusLabel,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}