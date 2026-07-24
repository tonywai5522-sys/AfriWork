import { appConfig } from '../config/appConfig.js'
import { sendError } from '../utils/responseFormatter.js'
import { logger } from '../utils/logger.js'

const RATE_LIMIT_STORE = new Map()

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
}

export async function authenticate(req, res, next) {
  const ip = getClientIp(req)
  try {
    const { getUsers, getAccountWithSession } = await import('../lib/appwriteClient.js')

    const sessionCookie = req.headers.cookie
      ?.split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('a_session_'))
      ?.split('=')[1]

    const authHeader = req.headers.authorization
    const sessionSecret = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : sessionCookie

    if (!sessionSecret) {
      logger.warn(`Auth middleware: no session token`, { ip, path: req.originalUrl })
      return sendError(res, 'Authentication required. Please log in.', 401)
    }

    // 1) Try in-memory admin session store (fast path, no Appwrite call)
    const userFromStore = adminSessionStore.get(sessionSecret)
    if (userFromStore) {
      req.user = { ...userFromStore, sessionSecret }
      logger.debug(`Auth OK (session store)`, { userId: req.user.id, role: req.user.role, path: req.originalUrl })
      return next()
    }

    // 2) Try Account API — works when session has "account" scope (e.g. created via createEmailPasswordSession)
    try {
      const userAccount = getAccountWithSession(sessionSecret)
      const user = await userAccount.get()
      const prefs = await userAccount.getPrefs()

      req.user = {
        id: user.$id,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        emailVerified: user.emailVerification || false,
        status: user.prefs?.status || 'active',
        role: prefs?.role || appConfig.roles.defaults.register,
        prefs: prefs || {},
        sessionSecret,
      }

      logger.debug(`Auth OK (Account API)`, { userId: user.$id, email: user.email, role: req.user.role, path: req.originalUrl })
      return next()
    } catch (accountError) {
      if (accountError?.type !== 'general_unauthorized_scope') {
        logger.warn(`Auth: Account API error`, { ip, path: req.originalUrl, error: accountError.message, type: accountError.type })
        return sendError(res, 'Session expired or invalid. Please log in again.', 401)
      }
      // Scope error — session lacks "account" scope. Fall through to Users API path.
      logger.debug(`Auth: Account API scope denied, using Users API`, { ip, path: req.originalUrl })
    }

    // 3) Users API fallback — verify session server-side (no scope restrictions).
    //    Works for sessions created via Users.createSession() (admin login).
    try {
      const users = getUsers()

      // Try in-memory userId hint first (populated by adminLogin or previous lookups)
      const hintedUserId = userIdBySecret.get(sessionSecret)

      // Check if hintedUserId matches, or search admin users
      let foundUser = null

      if (hintedUserId) {
        // Verify the hint
        try {
          const userSessions = await users.listSessions(hintedUserId)
          const match = userSessions.sessions.find(
            s => s.$id === sessionSecret || s.secret === sessionSecret
          )
          if (match) {
            foundUser = await users.get(hintedUserId)
            // Store both the $id and secret for future lookups
            storeAdminSession(sessionSecret, {
              id: foundUser.$id, email: foundUser.email, name: foundUser.name,
              role: foundUser.prefs?.role || appConfig.roles.defaults.register,
              emailVerified: foundUser.emailVerification || false, status: 'active',
            })
            if (match.secret) {
              storeAdminSession(match.secret, {
                id: foundUser.$id, email: foundUser.email, name: foundUser.name,
                role: foundUser.prefs?.role || appConfig.roles.defaults.register,
                emailVerified: foundUser.emailVerification || false, status: 'active',
              })
            }
          }
        } catch (_) { /* hint failed, fall through to full search */ }
      }

      if (!foundUser) {
        // Full search — iterate admin users and check their active sessions
        // Admin count is typically 1-5, so this is fast.
        const allUsers = await users.list()
        const adminUsers = allUsers.users.filter(u => u.prefs?.role === 'admin')

        for (const u of adminUsers) {
          try {
            const sessions = await users.listSessions(u.$id)
            const match = sessions.sessions.find(
              s => s.$id === sessionSecret || s.secret === sessionSecret
            )
            if (match) {
              foundUser = u
              // Store for future requests
              storeAdminSession(sessionSecret, {
                id: foundUser.$id, email: foundUser.email, name: foundUser.name,
                role: foundUser.prefs?.role || appConfig.roles.defaults.register,
                emailVerified: foundUser.emailVerification || false, status: 'active',
              })
              if (match.secret) {
                storeAdminSession(match.secret, {
                  id: foundUser.$id, email: foundUser.email, name: foundUser.name,
                  role: foundUser.prefs?.role || appConfig.roles.defaults.register,
                  emailVerified: foundUser.emailVerification || false, status: 'active',
                })
              }
              break
            }
          } catch (_) { continue }
        }
      }

      if (!foundUser) {
        logger.warn(`Auth: session not found via Users API`, { ip, path: req.originalUrl })
        return sendError(res, 'Session expired or invalid. Please log in again.', 401)
      }

      const role = foundUser.prefs?.role || appConfig.roles.defaults.register

      req.user = {
        id: foundUser.$id,
        email: foundUser.email,
        name: foundUser.name,
        phone: foundUser.phone || '',
        emailVerified: foundUser.emailVerification || false,
        status: foundUser.prefs?.status || 'active',
        role,
        prefs: foundUser.prefs || {},
        sessionSecret,
      }

      logger.debug(`Auth OK (Users API)`, { userId: foundUser.$id, role, path: req.originalUrl })
      return next()
    } catch (usersError) {
      logger.error(`Auth: Users API fallback failed`, { ip, path: req.originalUrl, error: usersError.message })
      return sendError(res, 'Authentication failed. Please try again.', 401)
    }
  } catch (error) {
    logger.error(`Auth: unexpected failure`, { ip, path: req.originalUrl, error: error.message })
    return sendError(res, 'Authentication failed. Please try again.', 401)
  }
}

/**
 * In-memory store for admin session tokens.
 * When adminLogin creates a session via Users API, it stores the user info here
 * keyed by session ID, so subsequent requests can be verified without calling
 * the Account API (which requires the "account" scope).
 */
const adminSessionStore = new Map()

/** Maps session secret → userId for quick reverse lookup in fallback path. */
const userIdBySecret = new Map()

/**
 * Store an admin session for later verification by the authenticate middleware.
 */
export function storeAdminSession(sessionId, userInfo) {
  adminSessionStore.set(sessionId, userInfo)
  userIdBySecret.set(sessionId, userInfo.id)
  // Auto-expire after 1 hour
  setTimeout(() => {
    adminSessionStore.delete(sessionId)
    userIdBySecret.delete(sessionId)
  }, 60 * 60 * 1000)
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  const sessionCookie = req.headers.cookie
    ?.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('a_session_'))
    ?.split('=')[1]

  const sessionSecret = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : sessionCookie

  if (!sessionSecret) {
    req.user = null
    return next()
  }

  authenticate(req, res, (err) => {
    if (err) {
      logger.debug(`Optional auth: no session`, { path: req.originalUrl })
      req.user = null
    }
    next()
  })
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn(`Role check: unauthenticated`, { path: req.originalUrl, requiredRoles: allowedRoles })
      return sendError(res, 'Authentication required.', 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Role check: denied`, {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.originalUrl,
      })
      return sendError(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        403
      )
    }

    next()
  }
}

export function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next)
}

export function requireEmployer(req, res, next) {
  return requireRole('employer', 'admin')(req, res, next)
}

export function requireModerator(req, res, next) {
  return requireRole('moderator', 'admin')(req, res, next)
}

export function rateLimiter({ windowMs, maxRequests, message } = {}) {
  const winMs = windowMs || appConfig.rateLimit.windowMs
  const max = maxRequests || appConfig.rateLimit.maxRequests
  const msg = message || `Too many requests. Please try again in ${Math.ceil(winMs / 60000)} minutes.`

  return (req, res, next) => {
    const ip = getClientIp(req)
    const route = req.originalUrl || req.url
    const key = `${ip}:${route}`
    const now = Date.now()

    const record = RATE_LIMIT_STORE.get(key) || { count: 0, resetAt: now + winMs }

    if (now > record.resetAt) {
      record.count = 0
      record.resetAt = now + winMs
    }

    record.count += 1
    RATE_LIMIT_STORE.set(key, record)

    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000))

    if (record.count > max) {
      logger.warn(`Rate limit exceeded`, { ip, route, count: record.count, max })
      return sendError(res, msg, 429)
    }

    next()
  }
}

// Periodically clean up stale rate limit entries
setInterval(() => {
  const now = Date.now()
  let cleaned = 0
  for (const [key, record] of RATE_LIMIT_STORE.entries()) {
    if (now > record.resetAt) {
      RATE_LIMIT_STORE.delete(key)
      cleaned++
    }
  }
  if (cleaned > 0) logger.debug(`Rate limit store cleaned`, { entriesRemoved: cleaned })
}, 60 * 1000)

export const authRateLimiter = rateLimiter()
export const authStrictRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
})
