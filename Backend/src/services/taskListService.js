import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { TaskList } from '../models/TaskList.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION = process.env.APPWRITE_TASK_LISTS_COLLECTION_ID || 'task_lists'

export async function getTaskListById(listId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, COLLECTION, listId)
    return new TaskList(doc)
  } catch { return null }
}

export async function createTaskList(userId, data) {
  const databases = getDatabases()

  // Auto-calculate position
  let position = 0
  try {
    const existing = await databases.listDocuments(DB_ID, COLLECTION, [
      Query.equal('projectId', [data.projectId]),
      Query.limit(1),
      Query.orderDesc('position'),
    ])
    if (existing.documents.length > 0) {
      position = (existing.documents[0].position || 0) + 1
    }
  } catch { /* use default position */ }

  const listData = {
    projectId: data.projectId,
    title: data.title,
    description: data.description || '',
    position,
    color: data.color || '#6366f1',
    status: 'active',
    createdBy: userId,
  }

  const doc = await databases.createDocument(DB_ID, COLLECTION, ID.unique(), listData)
  logger.info(`Task list created`, { listId: doc.$id, title: data.title, projectId: data.projectId })
  return new TaskList(doc)
}

export async function updateTaskList(listId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowedFields = ['title', 'description', 'position', 'color', 'status']
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field]
  }

  const doc = await databases.updateDocument(DB_ID, COLLECTION, listId, updates)
  return new TaskList(doc)
}

export async function deleteTaskList(listId) {
  const databases = getDatabases()
  await databases.deleteDocument(DB_ID, COLLECTION, listId)
  logger.info(`Task list deleted`, { listId })
  return { deleted: true }
}

export async function getProjectTaskLists(projectId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, [
      Query.equal('projectId', [projectId]),
      Query.equal('status', ['active']),
      Query.orderAsc('position'),
      Query.limit(50),
    ])
    return docs.documents.map(d => new TaskList(d))
  } catch {
    return []
  }
}

export async function reorderTaskLists(projectId, listIds) {
  const databases = getDatabases()
  const updates = listIds.map((id, index) =>
    databases.updateDocument(DB_ID, COLLECTION, id, { position: index })
  )
  await Promise.all(updates)
  logger.info(`Task lists reordered`, { projectId })
  return { reordered: true }
}

export async function createDefaultLists(projectId, userId) {
  const defaults = [
    { title: 'Backlog', color: '#6b7280', position: 0 },
    { title: 'In Progress', color: '#3b82f6', position: 1 },
    { title: 'Done', color: '#22c55e', position: 2 },
  ]

  const results = []
  for (const list of defaults) {
    const listData = {
      projectId,
      title: list.title,
      description: '',
      position: list.position,
      color: list.color,
      status: 'active',
      createdBy: userId,
    }
    const doc = await (getDatabases()).createDocument(DB_ID, COLLECTION, ID.unique(), listData)
    results.push(new TaskList(doc))
  }
  return results
}
