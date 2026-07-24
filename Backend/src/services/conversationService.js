import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Conversation, ConversationParticipant } from '../models/Conversation.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const CONVERSATIONS_COLLECTION = process.env.APPWRITE_CONVERSATIONS_COLLECTION_ID || 'conversations'

export async function getConversationById(conversationId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId)
    return new Conversation(doc)
  } catch {
    return null
  }
}

export async function createConversation(userId, data) {
  const databases = getDatabases()
  const now = new Date().toISOString()

  const participants = data.participants || []
  const isCreatorIncluded = participants.some(p => p.userId === userId)
  if (!isCreatorIncluded) {
    participants.unshift({
      id: `cp_${Date.now()}`,
      userId,
      name: data.creatorName || '',
      email: data.creatorEmail || '',
      avatarUrl: data.creatorAvatar || '',
      role: 'admin',
      joinedAt: now,
      lastReadAt: now,
      isTyping: false,
    })
  }

  const conversationData = {
    type: data.type || 'direct',
    title: data.title || '',
    avatar: data.avatar || '',
    participants,
    lastMessage: null,
    lastActivity: now,
    createdBy: userId,
    projectId: data.projectId || '',
    teamId: data.teamId || '',
    metadata: data.metadata || {},
  }

  const doc = await databases.createDocument(DB_ID, CONVERSATIONS_COLLECTION, ID.unique(), conversationData)
  logger.info(`Conversation created`, { conversationId: doc.$id, type: data.type, userId })
  return new Conversation(doc)
}

export async function updateConversation(conversationId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowedFields = ['title', 'avatar', 'metadata']
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field]
  }
  const doc = await databases.updateDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId, updates)
  return new Conversation(doc)
}

export async function deleteConversation(conversationId) {
  const databases = getDatabases()
  await databases.deleteDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId)
  logger.info(`Conversation deleted`, { conversationId })
  return { deleted: true }
}

export async function getUserConversations(userId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, CONVERSATIONS_COLLECTION, [
      Query.orderDesc('lastActivity'),
      Query.limit(50),
    ])
    return docs.documents
      .map(d => new Conversation(d))
      .filter(c => c.isParticipant(userId))
  } catch {
    return []
  }
}

export async function findDirectConversation(userIdA, userIdB) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, CONVERSATIONS_COLLECTION, [
      Query.equal('type', ['direct']),
      Query.limit(50),
    ])
    return docs.documents
      .map(d => new Conversation(d))
      .find(c => c.isParticipant(userIdA) && c.isParticipant(userIdB)) || null
  } catch {
    return null
  }
}

export async function addParticipant(conversationId, participantData) {
  const databases = getDatabases()
  const conversation = await getConversationById(conversationId)
  if (!conversation) throw new Error('Conversation not found')

  const participants = [...conversation.participants]
  const exists = participants.find(p => p.userId === participantData.userId)
  if (exists) throw new Error('User already in conversation')

  const newParticipant = new ConversationParticipant({
    ...participantData,
    joinedAt: new Date().toISOString(),
    lastReadAt: new Date().toISOString(),
  })

  participants.push(newParticipant.toJSON())
  await databases.updateDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId, { participants })
  return newParticipant
}

export async function removeParticipant(conversationId, userId) {
  const databases = getDatabases()
  const conversation = await getConversationById(conversationId)
  if (!conversation) throw new Error('Conversation not found')

  const participants = conversation.participants.filter(p => p.userId !== userId)
  await databases.updateDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId, { participants })
  return { removed: true }
}

export async function updateLastMessage(conversationId, messageData) {
  const databases = getDatabases()
  await databases.updateDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId, {
    lastMessage: messageData,
    lastActivity: new Date().toISOString(),
  })
}

export async function markAsRead(conversationId, userId) {
  const databases = getDatabases()
  const conversation = await getConversationById(conversationId)
  if (!conversation) return

  const participants = conversation.participants.map(p => {
    if (p.userId === userId) {
      return { ...p, lastReadAt: new Date().toISOString() }
    }
    return p
  })
  await databases.updateDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId, { participants })
}
