import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Comment } from '../models/Comment.js'
import { logger } from '../utils/logger.js'
import { createActivityEntry } from './activityFeedService.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION = process.env.APPWRITE_COMMENTS_COLLECTION_ID || 'comments'
const TASKS_COLLECTION = process.env.APPWRITE_TASKS_COLLECTION_ID || 'tasks'

export async function getCommentById(commentId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, COLLECTION, commentId)
    return new Comment({ ...doc, mentions: JSON.parse(doc.mentions || '[]'), attachments: JSON.parse(doc.attachments || '[]') })
  } catch { return null }
}

export async function createComment(userId, data) {
  const databases = getDatabases()
  const commentData = {
    entityType: data.entityType,
    entityId: data.entityId,
    authorId: userId,
    authorName: data.authorName || '',
    authorAvatar: data.authorAvatar || '',
    content: data.content,
    parentId: data.parentId || '',
    mentions: data.mentions ? JSON.stringify(data.mentions) : '[]',
    attachments: data.attachments ? JSON.stringify(data.attachments) : '[]',
    isEdited: false,
    editedAt: '',
    createdBy: userId,
  }

  const doc = await databases.createDocument(DB_ID, COLLECTION, ID.unique(), commentData)
  logger.info(`Comment created`, { commentId: doc.$id, entityType: data.entityType, entityId: data.entityId })

  // Increment commentCount on the entity (task)
  if (data.entityType === 'task') {
    try {
      const task = await databases.getDocument(DB_ID, TASKS_COLLECTION, data.entityId)
      const currentCount = parseInt(task.commentCount || 0)
      await databases.updateDocument(DB_ID, TASKS_COLLECTION, data.entityId, { commentCount: currentCount + 1 })
    } catch (error) {
      logger.warn(`Failed to increment comment count`, { entityId: data.entityId, error: error.message })
    }
  }

  // Activity feed for non-reply comments
  if (!data.parentId && data.projectId) {
    try {
      await createActivityEntry(data.projectId, userId, 'comment_added', {
        entityType: data.entityType,
        entityId: data.entityId,
        description: `Added a comment on ${data.entityType}`,
        actorName: data.authorName || '',
        metadata: { commentId: doc.$id },
      })
    } catch { /* non-critical */ }
  }

  return new Comment({ ...doc, mentions: JSON.parse(doc.mentions || '[]'), attachments: JSON.parse(doc.attachments || '[]') })
}

export async function updateComment(commentId, data) {
  const databases = getDatabases()
  const updates = {
    content: data.content,
    isEdited: true,
    editedAt: new Date().toISOString(),
  }
  if (data.mentions) updates.mentions = JSON.stringify(data.mentions)
  if (data.attachments) updates.attachments = JSON.stringify(data.attachments)

  const doc = await databases.updateDocument(DB_ID, COLLECTION, commentId, updates)
  return new Comment({ ...doc, mentions: JSON.parse(doc.mentions || '[]'), attachments: JSON.parse(doc.attachments || '[]') })
}

export async function deleteComment(commentId) {
  const databases = getDatabases()
  const comment = await getCommentById(commentId)
  if (comment) {
    // Decrement commentCount on the entity
    if (comment.entityType === 'task') {
      try {
        const task = await databases.getDocument(DB_ID, TASKS_COLLECTION, comment.entityId)
        const currentCount = parseInt(task.commentCount || 0)
        await databases.updateDocument(DB_ID, TASKS_COLLECTION, comment.entityId, { commentCount: Math.max(0, currentCount - 1) })
      } catch { /* non-critical */ }
    }
  }
  await databases.deleteDocument(DB_ID, COLLECTION, commentId)
  logger.info(`Comment deleted`, { commentId })
  return { deleted: true }
}

export async function getEntityComments(entityType, entityId, options = {}) {
  const { page = 1, limit = 30 } = options
  const databases = getDatabases()
  try {
    const queries = [
      Query.equal('entityType', [entityType]),
      Query.equal('entityId', [entityId]),
      Query.equal('parentId', ['']),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ]

    const docs = await databases.listDocuments(DB_ID, COLLECTION, queries)
    return {
      comments: docs.documents.map(d => new Comment({ ...d, mentions: JSON.parse(d.mentions || '[]'), attachments: JSON.parse(d.attachments || '[]') })),
      total: docs.total,
      page, limit,
    }
  } catch {
    return { comments: [], total: 0, page, limit }
  }
}

export async function getCommentReplies(commentId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, [
      Query.equal('parentId', [commentId]),
      Query.orderAsc('$createdAt'),
      Query.limit(50),
    ])
    return docs.documents.map(d => new Comment({ ...d, mentions: JSON.parse(d.mentions || '[]'), attachments: JSON.parse(d.attachments || '[]') }))
  } catch {
    return []
  }
}
