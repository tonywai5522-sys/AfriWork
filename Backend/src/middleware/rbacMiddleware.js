import { appConfig } from '../config/appConfig.js'
import { sendError } from '../utils/responseFormatter.js'
import { logger } from '../utils/logger.js'

/**
 * Resource-based access control
 */
const PERMISSIONS = {
  talent: {
    profile: ['read', 'update', 'delete'],
    jobs: ['read', 'apply'],
    projects: ['read', 'create', 'update'],
    applications: ['read', 'create', 'withdraw'],
    chat: ['read', 'create'],
    reviews: ['read', 'create'],
    portfolio: ['read', 'create', 'update', 'delete'],
    bookmarks: ['read', 'create', 'delete'],
  },
  employer: {
    profile: ['read', 'update'],
    jobs: ['read', 'create', 'update', 'delete', 'close'],
    projects: ['read', 'create', 'update'],
    applications: ['read', 'review', 'accept', 'reject'],
    organizations: ['read', 'create', 'update', 'delete'],
    teams: ['read', 'create', 'update'],
    chat: ['read', 'create'],
    reviews: ['read'],
    bookmarks: ['read', 'create', 'delete'],
  },
  moderator: {
    profile: ['read', 'update'],
    users: ['read', 'suspend', 'activate'],
    jobs: ['read', 'approve', 'flag', 'remove'],
    projects: ['read', 'moderate'],
    content: ['read', 'approve', 'flag', 'reject', 'remove'],
    reviews: ['read', 'approve', 'flag', 'remove'],
    analytics: ['read'],
    activity: ['read'],
  },
  admin: {
    all: ['*'],  // Super admin - full access
  },
  partner: {
    profile: ['read', 'update'],
    jobs: ['read'],
    projects: ['read'],
    courses: ['read', 'create', 'update'],
    analytics: ['read'],
  },
}

const ROLE_HIERARCHY = appConfig.roles.hierarchy

export function requirePermission(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401)
    }

    const role = req.user.role
    const permissions = PERMISSIONS[role]

    // Admin has access to everything
    if (permissions?.all?.includes('*')) {
      return next()
    }

    // Check if resource exists for this role
    if (!permissions || !permissions[resource]) {
      logger.warn(`Permission denied`, {
        userId: req.user.id,
        role,
        resource,
        action,
        path: req.originalUrl,
      })
      return sendError(res, `Access denied. You do not have permission to ${action} ${resource}.`, 403)
    }

    // Check if action is allowed
    if (!permissions[resource].includes(action) && !permissions[resource].includes('*')) {
      logger.warn(`Permission denied for action`, {
        userId: req.user.id,
        role,
        resource,
        action,
        path: req.originalUrl,
      })
      return sendError(res, `Access denied. You do not have permission to ${action} ${resource}.`, 403)
    }

    next()
  }
}

/**
 * Ownership check: ensures user can only access their own resources
 * @param {function} ownerIdFn - function that extracts ownerId from req
 */
export function requireOwnership(ownerIdFn) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401)
    }

    // Admin bypass ownership check
    if (req.user.role === 'admin') {
      return next()
    }

    const ownerId = typeof ownerIdFn === 'function' ? ownerIdFn(req) : req.params?.userId || req.body?.userId

    if (!ownerId) {
      return sendError(res, 'Resource owner not determinable', 400)
    }

    if (ownerId !== req.user.id) {
      logger.warn(`Ownership check failed`, {
        userId: req.user.id,
        resourceOwner: ownerId,
        path: req.originalUrl,
      })
      return sendError(res, 'Access denied. You do not own this resource.', 403)
    }

    next()
  }
}

/**
 * Role-based rate limit multipliers
 * Higher role = higher limits
 */
export function getRoleBasedLimit(baseLimit = 100) {
  return (req) => {
    if (!req.user) return baseLimit
    const level = ROLE_HIERARCHY[req.user.role] || 1
    return baseLimit * level
  }
}

/**
 * Check if user can access a resource based on visibility
 */
export function requireVisibility(visibilityField = 'visibility') {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401)
    }

    const resource = req.resource || {}
    const visibility = resource[visibilityField]

    if (visibility === 'public') return next()
    if (visibility === 'team' && resource.ownerId === req.user.id) return next()
    if (visibility === 'private' && resource.ownerId === req.user.id) return next()

    if (req.user.role === 'admin') return next()

    return sendError(res, 'Access denied. This resource is not publicly accessible.', 403)
  }
}

/**
 * Scope-based filtering middleware
 * Automatically adds query filters to restrict data access by role
 */
export function scopeData(req, res, next) {
  if (!req.user) return next()

  const role = req.user.role
  req.scopeFilters = {}

  switch (role) {
    case 'talent':
      // Talents can only see their own applications, portfolio, etc.
      req.scopeFilters = { userId: req.user.id }
      break
    case 'employer':
      // Employers see their own org's data
      req.scopeFilters = { employerId: req.user.id }
      break
    case 'moderator':
      // Moderators see all public and flagged content
      req.scopeFilters = {}
      break
    case 'admin':
      // Admins see everything
      req.scopeFilters = {}
      break
  }

  next()
}

export { PERMISSIONS }
