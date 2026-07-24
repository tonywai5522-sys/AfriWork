import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const NOTIFICATIONS_COLLECTION = process.env.APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications'
const PREFERENCES_COLLECTION = process.env.APPWRITE_NOTIFICATION_PREFERENCES_COLLECTION_ID || 'notification_preferences'

// In-memory reference to io for real-time delivery
let io = null
export function setNotificationSocket(ioInstance) {
  io = ioInstance
}

// ─── Notification Types ────────────────────────────────
export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  APPLICATION_REVIEWED: 'application_reviewed',
  APPLICATION_WITHDRAWN: 'application_withdrawn',
  MESSAGE_RECEIVED: 'message_received',
  JOB_MATCH: 'job_match',
  PROJECT_INVITE: 'project_invite',
  TEAM_INVITE: 'team_invite',
  MILESTONE_COMPLETED: 'milestone_completed',
  MILESTONE_APPROVED: 'milestone_approved',
  COMMENT_ADDED: 'comment_added',
  PORTFOLIO_ENDORSED: 'portfolio_endorsed',
  PROFILE_VIEWED: 'profile_viewed',
  CONTRACT_SIGNED: 'contract_signed',
  PAYMENT_RECEIVED: 'payment_received',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
}

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.APPLICATION_SUBMITTED]: 'briefcase',
  [NOTIFICATION_TYPES.APPLICATION_ACCEPTED]: 'checkBadge',
  [NOTIFICATION_TYPES.APPLICATION_REJECTED]: 'xCircle',
  [NOTIFICATION_TYPES.APPLICATION_REVIEWED]: 'eye',
  [NOTIFICATION_TYPES.MESSAGE_RECEIVED]: 'mail',
  [NOTIFICATION_TYPES.JOB_MATCH]: 'sparkles',
  [NOTIFICATION_TYPES.PROJECT_INVITE]: 'folderPlus',
  [NOTIFICATION_TYPES.TEAM_INVITE]: 'userPlus',
  [NOTIFICATION_TYPES.MILESTONE_COMPLETED]: 'checkCircle',
  [NOTIFICATION_TYPES.MILESTONE_APPROVED]: 'checkBadge',
  [NOTIFICATION_TYPES.COMMENT_ADDED]: 'chatBubble',
  [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: 'currencyDollar',
  [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: 'megaphone',
}

function sendRealtime(recipientId, notification) {
  if (io) {
    io.to(`user:${recipientId}`).emit('notification:new', notification)
    const unreadCount = notification._unreadCount || 1
    io.to(`user:${recipientId}`).emit('notification:unread_count', unreadCount)
  }
}

export async function createNotification({
  recipientId,
  senderId = '',
  senderName = '',
  type,
  title,
  body,
  entityType = '',
  entityId = '',
  link = '',
  image = '',
}) {
  const databases = getDatabases()
  const now = new Date().toISOString()
  const data = {
    recipientId,
    senderId,
    senderName,
    type,
    title,
    body,
    entityType,
    entityId,
    link,
    image,
    isRead: false,
    isSeen: false,
    readAt: '',
    seenAt: '',
    status: 'active',
    createdAt: now,
  }

  try {
    const doc = await databases.createDocument(DB_ID, NOTIFICATIONS_COLLECTION, ID.unique(), data)
    const notification = { id: doc.$id, ...data, createdAt: doc.$createdAt }

    // Get unread count for real-time
    const unreadResult = await getUnreadCount(recipientId)
    notification._unreadCount = unreadResult

    sendRealtime(recipientId, notification)

    logger.info(`Notification created`, { recipientId, type, notificationId: doc.$id })
    return notification
  } catch (err) {
    logger.error(`Failed to create notification`, { recipientId, type, error: err.message })
    return null
  }
}

// ─── Helper notification creators ──────────────────────

export async function notifyApplicationSubmitted({ employerId, applicantName, applicantId, jobTitle, jobId, applicationId }) {
  return createNotification({
    recipientId: employerId,
    senderId: applicantId,
    senderName: applicantName,
    type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
    title: 'New Application Received',
    body: `${applicantName || 'A talent'} applied to "${jobTitle}"`,
    entityType: 'application',
    entityId: applicationId,
    link: `/employer/applications/${applicationId}`,
  })
}

export async function notifyApplicationStatusChanged({ applicantId, employerName, jobTitle, status, applicationId }) {
  const labels = { accepted: 'Accepted', rejected: 'Not selected', reviewed: 'Reviewed', withdrawn: 'Withdrawn' }
  const label = labels[status] || status
  const typeMap = {
    accepted: NOTIFICATION_TYPES.APPLICATION_ACCEPTED,
    rejected: NOTIFICATION_TYPES.APPLICATION_REJECTED,
    reviewed: NOTIFICATION_TYPES.APPLICATION_REVIEWED,
    withdrawn: NOTIFICATION_TYPES.APPLICATION_WITHDRAWN,
  }
  return createNotification({
    recipientId: applicantId,
    type: typeMap[status] || `application_${status}`,
    title: `Application ${label}`,
    body: `Your application for "${jobTitle}" has been ${label.toLowerCase()}${employerName ? ` by ${employerName}` : ''}`,
    entityType: 'application',
    entityId: applicationId,
    link: `/applications/${applicationId}`,
  })
}

export async function notifyNewMessage({ recipientId, senderId, senderName, conversationId, preview }) {
  return createNotification({
    recipientId,
    senderId,
    senderName,
    type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
    title: `New message from ${senderName || 'someone'}`,
    body: preview || 'Sent you a message',
    entityType: 'conversation',
    entityId: conversationId,
    link: `/messages/${conversationId}`,
  })
}

export async function notifyTeamInvite({ userId, teamName, inviterName, teamId }) {
  return createNotification({
    recipientId: userId,
    senderName: inviterName,
    type: NOTIFICATION_TYPES.TEAM_INVITE,
    title: `Team Invitation`,
    body: `${inviterName || 'Someone'} invited you to join "${teamName}"`,
    entityType: 'team',
    entityId: teamId,
    link: `/teams/${teamId}`,
  })
}

export async function notifyProjectInvite({ userId, projectName, inviterName, projectId }) {
  return createNotification({
    recipientId: userId,
    senderName: inviterName,
    type: NOTIFICATION_TYPES.PROJECT_INVITE,
    title: `Project Invitation`,
    body: `${inviterName || 'Someone'} invited you to join "${projectName}"`,
    entityType: 'project',
    entityId: projectId,
    link: `/projects/${projectId}`,
  })
}

export async function notifyMilestoneCompleted({ ownerId, projectName, milestoneName, projectId }) {
  return createNotification({
    recipientId: ownerId,
    type: NOTIFICATION_TYPES.MILESTONE_COMPLETED,
    title: 'Milestone Completed',
    body: `"${milestoneName}" completed in "${projectName}"`,
    entityType: 'milestone',
    entityId: projectId,
    link: `/projects/${projectId}`,
  })
}

export async function notifyPaymentReceived({ userId, amount, projectName, projectId }) {
  return createNotification({
    recipientId: userId,
    type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
    title: 'Payment Received',
    body: `$${amount} received for "${projectName}"`,
    entityType: 'project',
    entityId: projectId,
    link: `/projects/${projectId}`,
  })
}

export async function notifySystemAnnouncement({ recipients, title, body }) {
  const results = []
  for (const recipientId of recipients) {
    const result = await createNotification({
      recipientId,
      type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
      title,
      body,
      entityType: 'system',
      entityId: 'announcement',
    })
    if (result) results.push(result)
  }
  return results
}

// ─── Queries ────────────────────────────────────────────

export async function getNotifications(recipientId, { unreadOnly = false, page = 1, limit = 20 } = {}) {
  const databases = getDatabases()
  try {
    const queries = [
      Query.equal('recipientId', [recipientId]),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ]
    if (unreadOnly) queries.push(Query.equal('isRead', [false]))

    const docs = await databases.listDocuments(DB_ID, NOTIFICATIONS_COLLECTION, queries)
    const notifications = docs.documents.map(d => ({
      id: d.$id,
      recipientId: d.recipientId,
      senderId: d.senderId || '',
      senderName: d.senderName || '',
      type: d.type || '',
      title: d.title || '',
      body: d.body || '',
      entityType: d.entityType || '',
      entityId: d.entityId || '',
      link: d.link || '',
      image: d.image || '',
      isRead: d.isRead || false,
      isSeen: d.isSeen || false,
      readAt: d.readAt || '',
      seenAt: d.seenAt || '',
      createdAt: d.$createdAt || '',
    }))

    return {
      notifications,
      total: docs.total,
      unread: notifications.filter(n => !n.isRead).length,
      page,
      limit,
      hasMore: docs.total > page * limit,
    }
  } catch (err) {
    logger.error(`Failed to get notifications`, { recipientId, error: err.message })
    return { notifications: [], total: 0, unread: 0, page, limit, hasMore: false }
  }
}

export async function getNotificationById(notificationId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, NOTIFICATIONS_COLLECTION, notificationId)
    return {
      id: doc.$id,
      recipientId: doc.recipientId,
      senderId: doc.senderId || '',
      senderName: doc.senderName || '',
      type: doc.type || '',
      title: doc.title || '',
      body: doc.body || '',
      entityType: doc.entityType || '',
      entityId: doc.entityId || '',
      link: doc.link || '',
      image: doc.image || '',
      isRead: doc.isRead || false,
      isSeen: doc.isSeen || false,
      readAt: doc.readAt || '',
      seenAt: doc.seenAt || '',
      createdAt: doc.$createdAt || '',
    }
  } catch {
    return null
  }
}

export async function markAsRead(notificationId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, NOTIFICATIONS_COLLECTION, notificationId)
    await databases.updateDocument(DB_ID, NOTIFICATIONS_COLLECTION, notificationId, {
      isRead: true,
      isSeen: true,
      readAt: new Date().toISOString(),
      seenAt: new Date().toISOString(),
    })
    // Update unread count for recipient
    const count = await getUnreadCount(doc.recipientId)
    if (io) {
      io.to(`user:${doc.recipientId}`).emit('notification:unread_count', count)
    }
    return true
  } catch {
    return false
  }
}

export async function markAllAsRead(recipientId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, NOTIFICATIONS_COLLECTION, [
      Query.equal('recipientId', [recipientId]),
      Query.equal('isRead', [false]),
      Query.limit(100),
    ])
    const now = new Date().toISOString()
    for (const doc of docs.documents) {
      await databases.updateDocument(DB_ID, NOTIFICATIONS_COLLECTION, doc.$id, { isRead: true, readAt: now, isSeen: true, seenAt: now })
    }
    if (io) {
      io.to(`user:${recipientId}`).emit('notification:unread_count', 0)
    }
    return docs.documents.length
  } catch {
    return 0
  }
}

export async function markAsSeen(notificationId) {
  const databases = getDatabases()
  try {
    await databases.updateDocument(DB_ID, NOTIFICATIONS_COLLECTION, notificationId, {
      isSeen: true,
      seenAt: new Date().toISOString(),
    })
    return true
  } catch {
    return false
  }
}

export async function deleteNotification(notificationId) {
  const databases = getDatabases()
  try {
    await databases.deleteDocument(DB_ID, NOTIFICATIONS_COLLECTION, notificationId)
    return true
  } catch {
    return false
  }
}

export async function getUnreadCount(recipientId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, NOTIFICATIONS_COLLECTION, [
      Query.equal('recipientId', [recipientId]),
      Query.equal('isRead', [false]),
      Query.limit(1),
    ])
    return docs.total
  } catch {
    return 0
  }
}

// ─── Notification Preferences ──────────────────────────

const DEFAULT_PREFERENCES = {
  email_notifications: true,
  push_notifications: true,
  in_app_notifications: true,
  application_updates: true,
  message_alerts: true,
  project_updates: true,
  team_invites: true,
  marketing_emails: false,
  digest_frequency: 'instant', // 'instant', 'daily', 'weekly'
  quiet_hours_start: '',
  quiet_hours_end: '',
}

export async function getNotificationPreferences(userId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, PREFERENCES_COLLECTION, [
      Query.equal('userId', [userId]),
      Query.limit(1),
    ])
    if (docs.documents.length > 0) {
      const d = docs.documents[0]
      return { id: d.$id, ...DEFAULT_PREFERENCES, ...d, userId: d.userId }
    }
    return { id: null, userId, ...DEFAULT_PREFERENCES }
  } catch {
    return { id: null, userId, ...DEFAULT_PREFERENCES }
  }
}

export async function updateNotificationPreferences(userId, preferences) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, PREFERENCES_COLLECTION, [
      Query.equal('userId', [userId]),
      Query.limit(1),
    ])

    const data = { userId, ...DEFAULT_PREFERENCES, ...preferences }

    if (docs.documents.length > 0) {
      await databases.updateDocument(DB_ID, PREFERENCES_COLLECTION, docs.documents[0].$id, data)
      return { id: docs.documents[0].$id, ...data }
    } else {
      const doc = await databases.createDocument(DB_ID, PREFERENCES_COLLECTION, ID.unique(), data)
      return { id: doc.$id, ...data }
    }
  } catch {
    return { id: null, userId, ...DEFAULT_PREFERENCES }
  }
}
