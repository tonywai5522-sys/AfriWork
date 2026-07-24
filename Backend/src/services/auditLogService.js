import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const AUDIT_LOGS_COLL = process.env.APPWRITE_AUDIT_LOGS_COLLECTION_ID || 'audit_logs'

const SENSITIVE_ACTIONS = new Set([
  'user.delete', 'user.role_change', 'user.suspend', 'user.activate',
  'admin.login', 'admin.action', 'verification.approve', 'verification.reject',
  'content.remove', 'content.reject', 'settings.update', 'system.config',
])

const SEVERITY_LEVELS = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical' }

function determineSeverity(action) {
  if (action.startsWith('admin.') || action.startsWith('user.delete') || action.startsWith('content.remove')) return SEVERITY_LEVELS.HIGH
  if (action.startsWith('user.suspend') || action.startsWith('verification.')) return SEVERITY_LEVELS.MEDIUM
  return SEVERITY_LEVELS.LOW
}

export async function createAuditLog({
  userId,
  userEmail,
  userName,
  userRole,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
  ipAddress,
  userAgent,
  sessionId,
  severity,
}) {
  const databases = getDatabases()
  const sev = severity || determineSeverity(action)

  const entry = {
    userId: userId || '',
    userEmail: userEmail || '',
    userName: userName || '',
    userRole: userRole || 'anonymous',
    action,
    entityType: entityType || '',
    entityId: entityId || '',
    description: description || `${action} on ${entityType || 'system'}`,
    metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : '{}',
    ipAddress: ipAddress || '',
    userAgent: userAgent || '',
    sessionId: sessionId || '',
    severity: sev,
    isSensitive: SENSITIVE_ACTIONS.has(action),
    timestamp: new Date().toISOString(),
  }

  try {
    const doc = await databases.createDocument(DB_ID, AUDIT_LOGS_COLL, ID.unique(), entry)
    if (sev === SEVERITY_LEVELS.HIGH || sev === SEVERITY_LEVELS.CRITICAL) {
      logger.warn(`AUDIT:${sev.toUpperCase()}`, { action, userId, entityType, entityId })
    }
    return { id: doc.$id, ...entry, createdAt: doc.$createdAt }
  } catch (error) {
    logger.error(`Failed to create audit log`, { action, error: error.message })
    // Fallback: log to console
    logger.warn(`AUDIT_FALLBACK`, { action, userId, description, severity: sev })
    return null
  }
}

export async function queryAuditLogs({
  userId,
  action,
  entityType,
  entityId,
  severity,
  isSensitive,
  userRole,
  search,
  from,
  to,
  sortBy = 'timestamp',
  sortOrder = 'desc',
  page = 1,
  limit = 30,
}) {
  const databases = getDatabases()
  const queries = []

  if (userId) queries.push(Query.equal('userId', [userId]))
  if (action) queries.push(Query.equal('action', [action]))
  if (entityType) queries.push(Query.equal('entityType', [entityType]))
  if (entityId) queries.push(Query.equal('entityId', [entityId]))
  if (severity) queries.push(Query.equal('severity', [severity]))
  if (isSensitive !== undefined) queries.push(Query.equal('isSensitive', [isSensitive]))
  if (userRole) queries.push(Query.equal('userRole', [userRole]))
  if (from) queries.push(Query.greaterThan('timestamp', [from]))
  if (to) queries.push(Query.lessThan('timestamp', [to]))
  if (search) queries.push(Query.search('description', search))

  if (sortBy === 'timestamp') {
    queries.push(sortOrder === 'asc' ? Query.orderAsc('timestamp') : Query.orderDesc('timestamp'))
  }
  queries.push(Query.limit(limit))
  queries.push(Query.offset((page - 1) * limit))

  try {
    const docs = await databases.listDocuments(DB_ID, AUDIT_LOGS_COLL, queries)
    return {
      logs: docs.documents.map(d => ({
        id: d.$id,
        userId: d.userId,
        userEmail: d.userEmail,
        userName: d.userName,
        userRole: d.userRole,
        action: d.action,
        entityType: d.entityType,
        entityId: d.entityId,
        description: d.description,
        metadata: parseJSON(d.metadata),
        ipAddress: d.ipAddress,
        userAgent: d.userAgent,
        sessionId: d.sessionId,
        severity: d.severity,
        isSensitive: d.isSensitive,
        timestamp: d.timestamp,
        createdAt: d.$createdAt,
      })),
      total: docs.total,
      page,
      limit,
      hasMore: docs.total > page * limit,
    }
  } catch (error) {
    logger.error(`Failed to query audit logs`, { error: error.message })
    return { logs: [], total: 0, page, limit, hasMore: false }
  }
}

export async function getAuditLogById(logId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, AUDIT_LOGS_COLL, logId)
    return {
      id: doc.$id,
      userId: doc.userId,
      userEmail: doc.userEmail,
      userName: doc.userName,
      userRole: doc.userRole,
      action: doc.action,
      entityType: doc.entityType,
      entityId: doc.entityId,
      description: doc.description,
      metadata: parseJSON(doc.metadata),
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      sessionId: doc.sessionId,
      severity: doc.severity,
      isSensitive: doc.isSensitive,
      timestamp: doc.timestamp,
      createdAt: doc.$createdAt,
    }
  } catch {
    return null
  }
}

export async function getAuditStats({ from, to } = {}) {
  const databases = getDatabases()
  const queries = []
  if (from) queries.push(Query.greaterThan('timestamp', [from]))
  if (to) queries.push(Query.lessThan('timestamp', [to]))

  try {
    const [total, sensitive, severityCounts, actionCounts] = await Promise.all([
      databases.listDocuments(DB_ID, AUDIT_LOGS_COLL, [...queries, Query.limit(1)]),
      databases.listDocuments(DB_ID, AUDIT_LOGS_COLL, [...queries, Query.equal('isSensitive', [true]), Query.limit(1)]),
      Promise.all(
        ['low', 'medium', 'high', 'critical'].map(sev =>
          databases.listDocuments(DB_ID, AUDIT_LOGS_COLL, [...queries, Query.equal('severity', [sev]), Query.limit(1)])
        )
      ),
      // Get recent unique actions
      databases.listDocuments(DB_ID, AUDIT_LOGS_COLL, [...queries, Query.orderDesc('timestamp'), Query.limit(100)]),
    ])

    const actionMap = {}
    for (const doc of actionCounts.documents) {
      actionMap[doc.action] = (actionMap[doc.action] || 0) + 1
    }
    const topActions = Object.entries(actionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }))

    return {
      total: total.total,
      sensitiveCount: sensitive.total,
      bySeverity: {
        low: severityCounts[0].total,
        medium: severityCounts[1].total,
        high: severityCounts[2].total,
        critical: severityCounts[3].total,
      },
      topActions,
    }
  } catch (error) {
    logger.error(`Failed to get audit stats`, { error: error.message })
    return { total: 0, sensitiveCount: 0, bySeverity: {}, topActions: [] }
  }
}

export async function getUserActivityHistory(userId, { page = 1, limit = 30 } = {}) {
  return queryAuditLogs({ userId, page, limit, sortOrder: 'desc' })
}

export async function getEntityAuditHistory(entityType, entityId, { page = 1, limit = 30 } = {}) {
  return queryAuditLogs({ entityType, entityId, page, limit, sortOrder: 'desc' })
}

export async function getAdminActivityLogs({ page = 1, limit = 30 } = {}) {
  return queryAuditLogs({
    isSensitive: true,
    page,
    limit,
    sortOrder: 'desc',
  })
}

export async function cleanupAuditLogs(retentionDays = 90) {
  const databases = getDatabases()
  const cutoff = new Date(Date.now() - retentionDays * 86400000).toISOString()
  try {
    const toDelete = await databases.listDocuments(DB_ID, AUDIT_LOGS_COLL, [
      Query.lessThan('timestamp', cutoff),
      Query.limit(100),
    ])
    let deleted = 0
    for (const doc of toDelete.documents) {
      await databases.deleteDocument(DB_ID, AUDIT_LOGS_COLL, doc.$id)
      deleted++
    }
    logger.info(`Audit log cleanup: deleted ${deleted} logs older than ${retentionDays} days`)
    return { deleted }
  } catch (error) {
    logger.error(`Audit log cleanup failed`, { error: error.message })
    return { deleted: 0 }
  }
}

export const AuditActions = {
  // User actions
  USER_CREATE: 'user.create',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_SUSPEND: 'user.suspend',
  USER_ACTIVATE: 'user.activate',
  USER_ROLE_CHANGE: 'user.role_change',
  USER_PROFILE_UPDATE: 'user.profile_update',

  // Admin actions
  ADMIN_LOGIN: 'admin.login',
  ADMIN_ACTION: 'admin.action',
  ADMIN_SETTINGS_UPDATE: 'settings.update',

  // Content actions
  CONTENT_CREATE: 'content.create',
  CONTENT_UPDATE: 'content.update',
  CONTENT_DELETE: 'content.delete',
  CONTENT_FLAG: 'content.flag',
  CONTENT_APPROVE: 'content.approve',
  CONTENT_REJECT: 'content.reject',
  CONTENT_REMOVE: 'content.remove',

  // Entity actions
  ENTITY_CREATE: 'entity.create',
  ENTITY_UPDATE: 'entity.update',
  ENTITY_DELETE: 'entity.delete',

  // Verification
  VERIFICATION_REQUEST: 'verification.request',
  VERIFICATION_APPROVE: 'verification.approve',
  VERIFICATION_REJECT: 'verification.reject',

  // System
  SYSTEM_ERROR: 'system.error',
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_BACKUP: 'system.backup',
}

export const EntityTypes = {
  USER: 'user',
  JOB: 'job',
  PROJECT: 'project',
  ORGANIZATION: 'organization',
  REVIEW: 'review',
  COMMENT: 'comment',
  APPLICATION: 'application',
  PORTFOLIO: 'portfolio',
  COURSE: 'course',
  SETTINGS: 'settings',
  TEAM: 'team',
  MESSAGE: 'message',
}

// AuditLog middleware factory: wraps any route handler with automatic audit logging
export function auditMiddleware(action, entityTypeFn, descriptionFn) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res)
    res.json = function (body) {
      if (res.statusCode < 400 && body?.success !== false) {
        const entityType = typeof entityTypeFn === 'function' ? entityTypeFn(req) : entityTypeFn
        const description = typeof descriptionFn === 'function' ? descriptionFn(req, body) : (descriptionFn || `${action} completed`)
        createAuditLog({
          userId: req.user?.id,
          userEmail: req.user?.email,
          userName: req.user?.name,
          userRole: req.user?.role,
          action,
          entityType,
          entityId: req.params?.id || req.params?.userId || req.params?.projectId || req.params?.orgId || '',
          description,
          metadata: { method: req.method, path: req.originalUrl, statusCode: res.statusCode },
          ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent'],
          sessionId: req.user?.sessionSecret?.slice(0, 16),
        }).catch(() => {})
      }
      return originalJson(body)
    }
    next()
  }
}

function parseJSON(str) {
  if (!str || str === '{}') return {}
  try { return JSON.parse(str) } catch { return {} }
}
