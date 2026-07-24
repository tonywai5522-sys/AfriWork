export class TaskList {
  constructor(data = {}) {
    this.id = data.id || data.$id || ''
    this.projectId = data.projectId || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.position = data.position || 0
    this.color = data.color || '#6b7280'
    this.status = data.status || 'active'
    this.createdAt = data.$createdAt || data.createdAt || ''
    this.updatedAt = data.$updatedAt || data.updatedAt || ''
  }

  static generateDefaultLists(projectId) {
    return [
      new TaskList({
        projectId,
        title: 'Backlog',
        description: 'Tasks that have not been started yet',
        position: 0,
        color: '#6b7280',
      }),
      new TaskList({
        projectId,
        title: 'In Progress',
        description: 'Tasks currently being worked on',
        position: 1,
        color: '#3b82f6',
      }),
      new TaskList({
        projectId,
        title: 'Done',
        description: 'Completed tasks',
        position: 2,
        color: '#22c55e',
      }),
    ]
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      position: this.position,
      color: this.color,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}