import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { ActivityFeedEntry } from '../models/ActivityFeed.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION = process.env.APPWRITE_ACTIVITY_FEEDS_COLLECTION_ID || 'activity_feeds'

export async function createActivityEntry(projectId, actorId, action, data = {}) {
  const databases = getDatabases()
  try {
    const entryData = {
      projectId,
      actorId,
      action,
      entityType: data.entityType || '',
      entityId: data.entityId || '',
      description: data.description || '',
      actorName: data.actorName || '',
      actorAvatar: data.actorAvatar || '',
      metadata: data.metadata ? JSON.stringify(data.metadata) : '{}',
      status: 'active',
      createdBy: actorId,
    }

    const doc = await databases.createDocument(DB_ID, COLLECTION, ID.unique(), entryData)
    logger.info(`Activity entry created`, { projectId, action, actorId })
    return new ActivityFeedEntry(doc)
  } catch (error) {
    logger.warn(`Failed to create activity entry`, { projectId, action, error: error.message })
    return null
  }
}

export async function getProjectActivity(projectId, options = {}) {
  const { page = 1, limit = 30 } = options
  const databases = getDatabases()
  try {
    const queries = [
      Query.equal('projectId', [projectId]),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ]

    const docs = await databases.listDocuments(DB_ID, COLLECTION, queries)
    return {
      entries: docs.documents.map(d => new ActivityFeedEntry(d)),
      total: docs.total,
      page,
      limit,
    }
  } catch {
    return { entries: [], total: 0, page, limit }
  }
}

export async function deleteProjectActivity(projectId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, [
      Query.equal('projectId', [projectId]),
      Query.limit(100),
    ])
    for (const doc of docs.documents) {
      await databases.deleteDocument(DB_ID, COLLECTION, doc.$id)
    }
    logger.info(`Activity entries deleted for project`, { projectId })
    return { deleted: docs.documents.length }
  } catch {
    return { deleted: 0 }
  }
}
