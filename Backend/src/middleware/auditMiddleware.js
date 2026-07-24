import { createAuditLog } from '../services/auditLogService.js'

/**
 * Middleware to automatically audit log all admin actions.
 * Attach after route handlers to log successful responses.
 */
export function auditAdminAction(action, entityTypeFn, descriptionFn) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res)
    res.json = function (body) {
      if (res.statusCode < 400 && body?.success !== false) {
        const entityType = typeof entityTypeFn === 'function' ? entityTypeFn(req) : entityTypeFn
        const description = typeof descriptionFn === 'function' ? descriptionFn(req, body) : (descriptionFn || `${action} completed`)
        const entityId = req.params?.userId || req.params?.projectId || req.params?.orgId ||
          req.params?.entityId || req.params?.id || body?.data?.id || ''
        createAuditLog({
          userId: req.user?.id,
          userEmail: req.user?.email,
          userName: req.user?.name,
          userRole: req.user?.role,
          action,
          entityType,
          entityId,
          description,
          metadata: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            requestBody: sanitizeBody(req.body),
          },
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown',
          userAgent: req.headers['user-agent'] || '',
          sessionId: req.user?.sessionSecret?.slice(0, 16),
        }).catch(() => {})
      }
      return originalJson(body)
    }
    next()
  }
}

/**
 * Express middleware that logs all incoming requests to audit log
 * (non-sensitive info only - no passwords or tokens)
 */
export function requestAuditLogger(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    if (res.statusCode >= 400 || req.method !== 'GET') {
      const sensitivePaths = ['/auth/login', '/auth/register', '/auth/reset-password']
      const isSensitive = sensitivePaths.some(p => req.path.includes(p))

      createAuditLog({
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        action: isSensitive ? 'auth.request' : 'api.request',
        entityType: 'api',
        entityId: '',
        description: `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`,
        metadata: {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          query: sanitizeQuery(req.query),
        },
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
        severity: res.statusCode >= 500 ? 'high' : res.statusCode >= 400 ? 'medium' : 'low',
      }).catch(() => {})
    }
  })
  next()
}

/**
 * Create audit log entry manually within a route handler
 */
export function logAuditEvent(req, { action, entityType, entityId, description, metadata, severity }) {
  return createAuditLog({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userName: req.user?.name,
    userRole: req.user?.role,
    action,
    entityType,
    entityId,
    description,
    metadata: { ...metadata, method: req.method, path: req.originalUrl },
    ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
    sessionId: req.user?.sessionSecret?.slice(0, 16),
    severity,
  })
}

function sanitizeBody(body) {
  if (!body) return {}
  const sanitized = { ...body }
  delete sanitized.password
  delete sanitized.currentPassword
  delete sanitized.newPassword
  delete sanitized.confirmPassword
  delete sanitized.token
  delete sanitized.secret
  delete sanitized.apiKey
  return sanitized
}

function sanitizeQuery(query) {
  if (!query) return {}
  const sanitized = { ...query }
  delete sanitized.token
  delete sanitized.secret
  delete sanitized.apiKey
  return sanitized
}
