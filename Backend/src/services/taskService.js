import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Task } from '../models/Task.js'
import { logger } from '../utils/logger.js'
import { createActivityEntry } from './activityFeedService.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION = process.env.APPWRITE_TASKS_COLLECTION_ID || 'tasks'

export async function getTaskById(taskId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, COLLECTION, taskId)
    return new Task({ ...doc, labels: JSON.parse(doc.labels || '[]'), attachments: JSON.parse(doc.attachments || '[]') })
  } catch { return null }
}

export async function createTask(userId, data) {
  const databases = getDatabases()

  // Auto-calculate position
  let position = 0
  try {
    const existing = await databases.listDocuments(DB_ID, COLLECTION, [
      Query.equal('taskListId', [data.taskListId]),
      Query.limit(1),
      Query.orderDesc('position'),
    ])
    if (existing.documents.length > 0) {
      position = (existing.documents[0].position || 0) + 1
    }
  } catch { /* use default position */ }

  const taskData = {
    projectId: data.projectId,
    taskListId: data.taskListId,
    title: data.title,
    description: data.description || '',
    priority: data.priority || 'none',
    status: data.status || 'todo',
    position,
    assigneeId: data.assigneeId || '',
    assigneeName: data.assigneeName || '',
    dueDate: data.dueDate || '',
    startDate: data.startDate || '',
    estimatedHours: data.estimatedHours || 0,
    loggedHours: 0,
    progress: 0,
    milestoneId: data.milestoneId || '',
    labels: data.labels ? JSON.stringify(data.labels) : '[]',
    attachments: '[]',
    commentCount: 0,
    isArchived: false,
    createdBy: userId,
  }

  const doc = await databases.createDocument(DB_ID, COLLECTION, ID.unique(), taskData)
  logger.info(`Task created`, { taskId: doc.$id, title: data.title, projectId: data.projectId })

  // Create activity feed entry
  try {
    await createActivityEntry(data.projectId, userId, 'task_created', {
      entityType: 'task',
      entityId: doc.$id,
      description: `Created task "${data.title}"`,
      actorName: data.actorName || '',
      actorAvatar: data.actorAvatar || '',
      metadata: { taskListId: data.taskListId },
    })
  } catch { /* non-critical */ }

  return new Task({ ...doc, labels: JSON.parse(doc.labels || '[]'), attachments: JSON.parse(doc.attachments || '[]') })
}

export async function updateTask(taskId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowedFields = [
    'title', 'description', 'priority', 'status', 'position',
    'assigneeId', 'assigneeName', 'dueDate', 'startDate',
    'estimatedHours', 'loggedHours', 'progress', 'milestoneId',
    'isArchived', 'taskListId', 'commentCount',
  ]
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field]
  }
  if (data.labels) updates.labels = JSON.stringify(data.labels)
  if (data.attachments) updates.attachments = JSON.stringify(data.attachments)

  const doc = await databases.updateDocument(DB_ID, COLLECTION, taskId, updates)
  logger.info(`Task updated`, { taskId })

  // Create activity feed entry for status changes
  if (data.status) {
    try {
      const projectId = doc.projectId || data.projectId
      if (projectId) {
        await createActivityEntry(projectId, data.updatedBy || userId, `task_${data.status}`, {
          entityType: 'task',
          entityId: taskId,
          description: `Moved task "${doc.title || data.title}" to ${data.status}`,
          metadata: { status: data.status },
        })
      }
    } catch { /* non-critical */ }
  }

  return new Task({ ...doc, labels: JSON.parse(doc.labels || '[]'), attachments: JSON.parse(doc.attachments || '[]') })
}

export async function deleteTask(taskId) {
  const databases = getDatabases()
  const task = await getTaskById(taskId)
  if (task) {
    try {
      await createActivityEntry(task.projectId, task.createdBy || '', 'task_deleted', {
        entityType: 'task',
        description: `Deleted task "${task.title}"`,
      })
    } catch { /* non-critical */ }
  }
  await databases.deleteDocument(DB_ID, COLLECTION, taskId)
  logger.info(`Task deleted`, { taskId })
  return { deleted: true }
}

export async function getProjectTasks(projectId, options = {}) {
  const { page = 1, limit = 50, taskListId, assigneeId, priority, status } = options
  const databases = getDatabases()
  const queries = [
    Query.equal('projectId', [projectId]),
    Query.equal('isArchived', [false]),
    Query.orderAsc('position'),
    Query.limit(limit),
    Query.offset((page - 1) * limit),
  ]

  if (taskListId) queries.push(Query.equal('taskListId', [taskListId]))
  if (assigneeId) queries.push(Query.equal('assigneeId', [assigneeId]))
  if (priority) queries.push(Query.equal('priority', [priority]))
  if (status) queries.push(Query.equal('status', [status]))

  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, queries)
    return {
      tasks: docs.documents.map(d => new Task({ ...d, labels: JSON.parse(d.labels || '[]'), attachments: JSON.parse(d.attachments || '[]') })),
      total: docs.total,
      page, limit,
    }
  } catch {
    return { tasks: [], total: 0, page, limit }
  }
}

export async function getTaskListTasks(taskListId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, [
      Query.equal('taskListId', [taskListId]),
      Query.equal('isArchived', [false]),
      Query.orderAsc('position'),
      Query.limit(100),
    ])
    return docs.documents.map(d => new Task({ ...d, labels: JSON.parse(d.labels || '[]'), attachments: JSON.parse(d.attachments || '[]') }))
  } catch {
    return []
  }
}

export async function reorderTasks(taskListId, taskIds) {
  const databases = getDatabases()
  const userId = arguments[2] || ''
  const updates = taskIds.map((id, index) =>
    databases.updateDocument(DB_ID, COLLECTION, id, { position: index, taskListId })
  )
  await Promise.all(updates)
  logger.info(`Tasks reordered`, { taskListId })
  return { reordered: true }
}

export async function bulkUpdateTasks(taskIds, updates) {
  const databases = getDatabases()
  const allowedFields = ['status', 'assigneeId', 'assigneeName', 'priority', 'taskListId', 'milestoneId']
  const safeUpdates = {}
  for (const field of allowedFields) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field]
  }

  const results = []
  for (const taskId of taskIds) {
    try {
      const doc = await databases.updateDocument(DB_ID, COLLECTION, taskId, safeUpdates)
      results.push(doc.$id)
    } catch (error) {
      logger.warn(`Bulk update failed for task`, { taskId, error: error.message })
    }
  }
  logger.info(`Bulk updated tasks`, { count: results.length })
  return { updated: results.length }
}

export async function getTasksByMilestone(milestoneId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, [
      Query.equal('milestoneId', [milestoneId]),
      Query.limit(100),
    ])
    return docs.documents.map(d => new Task({ ...d, labels: JSON.parse(d.labels || '[]'), attachments: JSON.parse(d.attachments || '[]') }))
  } catch {
    return []
  }
}
