import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Message } from '../models/Message.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const MESSAGES_COLLECTION = process.env.APPWRITE_MESSAGES_COLLECTION_ID || 'messages'

export async function getMessages(conversationId, { page = 1, limit = 50 } = {}) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, MESSAGES_COLLECTION, [
      Query.equal('conversationId', [conversationId]),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ])
    return {
      messages: docs.documents.map(d => new Message(d)),
      total: docs.total,
      hasMore: docs.total > page * limit,
    }
  } catch {
    return { messages: [], total: 0, hasMore: false }
  }
}

export async function createMessage(data) {
  const databases = getDatabases()
  const now = new Date().toISOString()
  const messageData = {
    conversationId: data.conversationId,
    senderId: data.senderId,
    senderName: data.senderName || '',
    senderAvatar: data.senderAvatar || '',
    content: data.content || '',
    type: data.type || 'text',
    attachments: data.attachments || [],
    replyTo: data.replyTo || null,
    reactions: [],
    readBy: [{ userId: data.senderId, readAt: now }],
    deliveredTo: [],
    isEdited: false,
    isDeleted: false,
    metadata: data.metadata || {},
  }

  const doc = await databases.createDocument(DB_ID, MESSAGES_COLLECTION, ID.unique(), messageData)
  return new Message(doc)
}

export async function editMessage(messageId, content) {
  const databases = getDatabases()
  const doc = await databases.updateDocument(DB_ID, MESSAGES_COLLECTION, messageId, {
    content,
    isEdited: true,
  })
  return new Message(doc)
}

export async function deleteMessage(messageId) {
  const databases = getDatabases()
  await databases.updateDocument(DB_ID, MESSAGES_COLLECTION, messageId, { isDeleted: true })
  return { deleted: true }
}

export async function addReaction(messageId, userId, emoji) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, MESSAGES_COLLECTION, messageId)
    const message = new Message(doc)
    message.addReaction(userId, emoji)
    await databases.updateDocument(DB_ID, MESSAGES_COLLECTION, messageId, {
      reactions: message.reactions,
    })
    return message.reactions
  } catch {
    return []
  }
}

export async function markAsDelivered(messageId, userId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, MESSAGES_COLLECTION, messageId)
    const deliveredTo = doc.deliveredTo || []
    if (!deliveredTo.some(d => d.userId === userId)) {
      deliveredTo.push({ userId, deliveredAt: new Date().toISOString() })
      await databases.updateDocument(DB_ID, MESSAGES_COLLECTION, messageId, { deliveredTo })
    }
  } catch { /* ignore */ }
}

export async function markAsRead(messageId, userId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, MESSAGES_COLLECTION, messageId)
    const readBy = doc.readBy || []
    if (!readBy.some(r => r.userId === userId)) {
      readBy.push({ userId, readAt: new Date().toISOString() })
      await databases.updateDocument(DB_ID, MESSAGES_COLLECTION, messageId, { readBy })
    }
  } catch { /* ignore */ }
}

export async function getUnreadCount(conversationId, userId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, MESSAGES_COLLECTION, [
      Query.equal('conversationId', [conversationId]),
      Query.limit(100),
    ])
    return docs.documents.filter(d => {
      const readBy = d.readBy || []
      return !readBy.some(r => r.userId === userId)
    }).length
  } catch {
    return 0
  }
}

export async function getMessageById(messageId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, MESSAGES_COLLECTION, messageId)
    return new Message(doc)
  } catch {
    return null
  }
}
