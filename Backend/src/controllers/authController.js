import { appConfig } from '../config/appConfig.js'
import { logger } from '../utils/logger.js'
import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import {
  validateRegisterPayload,
  validateLoginPayload,
  validateForgotPasswordPayload,
  validatePasswordResetPayload,
  validateEmailVerificationPayload,
  validateChangePasswordPayload,
  validateProfileUpdatePayload,
} from '../validators/authValidator.js'
import * as authService from '../services/authService.js'

function createUserResponse(user, session) {
  return {
    user: user?.toJSON ? user.toJSON() : user,
    session: {
      id: session?.$id || session?.id || null,
      createdAt: session?.$createdAt || session?.createdAt || null,
      expireAt: session?.$expireAt || session?.expireAt || null,
      current: true,
    },
  }
}

export async function register(req, res) {
  const { email, fullName } = req.body
  try {
    const validation = validateRegisterPayload(req.body)
    if (!validation.isValid) {
      logger.validationFailure('register', email, validation.errors)
      return sendError(res, validation.errors, 400)
    }

    logger.info(`Register attempt`, { email, fullName, role: req.body.role })

    const user = await authService.createUser({ email, password: req.body.password, fullName, username: req.body.username, role: req.body.role })
    const session = await authService.createEmailSession(email, req.body.password)

    logger.authSuccess('register', email, { userId: user.id })
    return sendSuccess(
      res,
      createUserResponse(user, session),
      'Registration successful. Welcome to AfriWork!'
    )
  } catch (error) {
    logger.authFailure('register', email, error)
    const message = parseAppwriteError(error, 'Registration failed')
    return sendError(res, message, 400)
  }
}

export async function login(req, res) {
  const { email } = req.body
  try {
    const validation = validateLoginPayload(req.body)
    if (!validation.isValid) {
      logger.validationFailure('login', email, validation.errors)
      return sendError(res, validation.errors, 400)
    }

    logger.info(`Login attempt`, { email })

    const session = await authService.createEmailSession(email, req.body.password)
    // Use server-side Users API to get user info (no scope restrictions)
    const user = await authService.getUserByEmail(email)

    logger.authSuccess('login', email, { userId: user.id, sessionId: session.$id })
    return sendSuccess(
      res,
      createUserResponse(user, session),
      'Login successful. Welcome back!'
    )
  } catch (error) {
    logger.authFailure('login', email, error)
    const message = parseAppwriteError(error, 'Invalid email or password')
    return sendError(res, message, 401)
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body
  try {
    const validation = validateForgotPasswordPayload(req.body)
    if (!validation.isValid) {
      logger.validationFailure('forgotPassword', email, validation.errors)
      return sendError(res, validation.errors, 400)
    }

    await authService.sendPasswordRecovery(email)
    logger.info(`Password recovery sent`, { email })

    return sendSuccess(
      res,
      null,
      'If an account exists with that email, a password reset link has been sent.'
    )
  } catch (error) {
    logger.warn(`Password recovery result for ${email}: ${error?.message || 'unknown'}`)
    return sendSuccess(
      res,
      null,
      'If an account exists with that email, a password reset link has been sent.'
    )
  }
}

export async function resetPassword(req, res) {
  const { userId, secret } = req.body
  try {
    const validation = validatePasswordResetPayload(req.body)
    if (!validation.isValid) {
      logger.validationFailure('resetPassword', `userId:${userId}`, validation.errors)
      return sendError(res, validation.errors, 400)
    }

    await authService.resetPassword(userId, secret, req.body.password)
    logger.authSuccess('resetPassword', `userId:${userId}`)
    return sendSuccess(res, null, 'Password has been reset successfully. You can now log in with your new password.')
  } catch (error) {
    logger.authFailure('resetPassword', `userId:${userId}`, error)
    const message = parseAppwriteError(error, 'Password reset failed. The link may have expired.')
    return sendError(res, message, 400)
  }
}

export async function sendVerification(req, res) {
  const email = req.user?.email || 'unknown'
  try {
    await authService.sendEmailVerification()
    logger.info(`Verification email sent`, { email })
    return sendSuccess(res, null, 'Verification email sent. Please check your inbox.')
  } catch (error) {
    logger.error(`Failed to send verification email`, { email, error: error.message })
    const message = parseAppwriteError(error, 'Failed to send verification email')
    return sendError(res, message, 400)
  }
}

export async function confirmVerification(req, res) {
  const { userId, secret } = req.body
  try {
    const validation = validateEmailVerificationPayload(req.body)
    if (!validation.isValid) {
      logger.validationFailure('confirmVerification', `userId:${userId}`, validation.errors)
      return sendError(res, validation.errors, 400)
    }

    await authService.confirmEmailVerification(userId, secret)
    logger.authSuccess('emailVerified', `userId:${userId}`)
    return sendSuccess(res, null, 'Email verified successfully!')
  } catch (error) {
    logger.authFailure('emailVerified', `userId:${userId}`, error)
    const message = parseAppwriteError(error, 'Email verification failed. The link may have expired.')
    return sendError(res, message, 400)
  }
}

export async function getSession(req, res) {
  try {
    // Extract session from Authorization header or cookie
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
      return sendError(res, 'No session found', 401)
    }

    const { getAccountWithSession } = await import('../lib/appwriteClient.js')
    const account = getAccountWithSession(sessionSecret)
    const user = await account.get()
    const prefs = await account.getPrefs()
    const sessions = await account.listSessions()

    const sessionData = {
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        role: prefs?.role || appConfig.roles.defaults.register,
        emailVerified: user.emailVerification || false,
        phone: user.phone || '',
        status: prefs?.status || 'active',
        prefs: prefs || {},
      },
      sessions: sessions.sessions || [],
    }

    logger.debug(`Session retrieved`, { userId: user.$id })
    return sendSuccess(res, sessionData, 'Session retrieved successfully')
  } catch (error) {
    logger.warn(`Session retrieval failed`, { error: error.message })
    return sendError(res, 'Session expired or invalid', 401)
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = await authService.getCurrentUser()
    return sendSuccess(res, { user: user.toJSON() }, 'User profile retrieved')
  } catch (error) {
    logger.warn(`Profile retrieval failed`, { error: error.message })
    return sendError(res, 'Failed to retrieve user profile', 401)
  }
}

export async function logout(req, res) {
  const email = req.user?.email || 'unknown'
  try {
    await authService.deleteCurrentSession()
    logger.authSuccess('logout', email)
    return sendSuccess(res, null, 'Logged out successfully')
  } catch (error) {
    logger.error(`Logout failed`, { email, error: error.message })
    return sendError(res, 'Logout failed', 400)
  }
}

export async function logoutAll(req, res) {
  const email = req.user?.email || 'unknown'
  try {
    await authService.deleteAllSessions()
    logger.info(`Logged out from all sessions`, { email })
    return sendSuccess(res, null, 'Logged out from all sessions')
  } catch (error) {
    logger.error(`Logout all failed`, { email, error: error.message })
    return sendError(res, 'Failed to logout from all sessions', 400)
  }
}

export async function listSessions(req, res) {
  try {
    const sessionData = await authService.getCurrentSession()
    return sendSuccess(res, { sessions: sessionData.sessions }, 'Sessions retrieved')
  } catch (error) {
    logger.warn(`List sessions failed`, { error: error.message })
    return sendError(res, 'Failed to list sessions', 401)
  }
}

export async function revokeSession(req, res) {
  const { sessionId } = req.params
  try {
    if (!sessionId) return sendError(res, 'Session ID is required', 400)

    await authService.deleteSessionById(sessionId)
    logger.info(`Session revoked`, { sessionId })
    return sendSuccess(res, null, 'Session revoked successfully')
  } catch (error) {
    logger.error(`Revoke session failed`, { sessionId, error: error.message })
    return sendError(res, 'Failed to revoke session', 400)
  }
}

export async function updateProfile(req, res) {
  const email = req.user?.email || 'unknown'
  try {
    const validation = validateProfileUpdatePayload(req.body)
    if (!validation.isValid) {
      logger.validationFailure('updateProfile', email, validation.errors)
      return sendError(res, validation.errors, 400)
    }

    const user = await authService.getCurrentUser()
    const updatedUser = { ...user.toJSON(), ...req.body }

    logger.info(`Profile updated`, { email })
    return sendSuccess(res, { user: updatedUser }, 'Profile updated successfully')
  } catch (error) {
    logger.error(`Profile update failed`, { email, error: error.message })
    return sendError(res, 'Failed to update profile', 400)
  }
}

export async function changePassword(req, res) {
  const email = req.user?.email || 'unknown'
  try {
    const validation = validateChangePasswordPayload(req.body)
    if (!validation.isValid) {
      logger.validationFailure('changePassword', email, validation.errors)
      return sendError(res, validation.errors, 400)
    }

    const user = await authService.getCurrentUser()
    await authService.createEmailSession(user.email, req.body.currentPassword)
    await authService.sendPasswordRecovery(user.email)

    logger.authSuccess('changePassword', email)
    return sendSuccess(res, null, 'A password reset link has been sent to your email to complete the change.')
  } catch (error) {
    logger.authFailure('changePassword', email, error)
    const message = parseAppwriteError(error, 'Current password is incorrect')
    return sendError(res, message, 400)
  }
}

export async function updateUserRole(req, res) {
  const { userId } = req.params
  const { role } = req.body
  const adminEmail = req.user?.email || 'unknown'
  try {
    if (!role || !['talent', 'employer', 'moderator', 'admin', 'partner'].includes(role)) {
      return sendError(res, 'Invalid role specified', 400)
    }

    const updatedRole = await authService.updateUserRole(userId, role)
    logger.info(`User role updated`, { userId, newRole: updatedRole, by: adminEmail })
    return sendSuccess(res, { role: updatedRole }, 'User role updated')
  } catch (error) {
    logger.error(`Role update failed`, { userId, newRole: role, by: adminEmail, error: error.message })
    return sendError(res, 'Failed to update user role', 400)
  }
}

export async function getUserById(req, res) {
  const { userId } = req.params
  try {
    const user = await authService.getUserById(userId)
    return sendSuccess(res, { user: user.toJSON() }, 'User retrieved')
  } catch (error) {
    logger.warn(`User lookup failed`, { userId, error: error.message })
    return sendError(res, 'User not found', 404)
  }
}

export async function adminLogin(req, res) {
  const { email } = req.body
  try {
    logger.info(`Admin login attempt`, { email })

    // Use Users API (server-side) to create a session — this bypasses
    // Account API scope restrictions (guests missing "account" scope).
    // First find the user by email, then create a session for them.
    const users = (await import('../lib/appwriteClient.js')).getUsers()
    const userList = await users.list([], undefined, undefined, undefined, undefined, `email:${email}`)
    if (!userList.users || userList.users.length === 0) {
      return sendError(res, 'Invalid email or password', 401)
    }
    const appwriteUser = userList.users[0]

    const session = await authService.createServerSession(appwriteUser.$id, req.body.password)

    // Check role from prefs
    const role = appwriteUser.prefs?.role || appConfig.roles.defaults.register

    if (role !== 'admin') {
      try { await authService.deleteSessionById(session.$id) } catch (_) {}
      logger.authFailure('admin-login', email, { reason: 'not_admin', role })
      return sendError(res, 'Access denied. Admin privileges required.', 403)
    }

    // Store session in-memory so the authenticate middleware can verify it
    // without calling the Account API (which lacks the "account" scope).
    const { storeAdminSession } = await import('../middleware/authMiddleware.js')
    storeAdminSession(session.$id, {
      id: appwriteUser.$id,
      email: appwriteUser.email,
      name: appwriteUser.name,
      role,
      emailVerified: appwriteUser.emailVerification || false,
      status: 'active',
    })

    logger.authSuccess('admin-login', email, { userId: appwriteUser.$id })
    return sendSuccess(res, {
      user: {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: appwriteUser.name,
        role,
        emailVerified: appwriteUser.emailVerification || false,
      },
      token: session.$id,
    }, 'Admin login successful')
  } catch (error) {
    logger.authFailure('admin-login', email, error)
    const message = error?.message?.includes('Invalid credentials') || error?.message?.includes('Invalid password')
      ? 'Invalid email or password'
      : 'Login failed. Please check your credentials.'
    return sendError(res, message, 401)
  }
}

export async function me(req, res) {
  try {
    return sendSuccess(res, { user: req.user }, 'Authenticated user retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve user', 401)
  }
}

function parseAppwriteError(error, fallback) {
  if (!error) return fallback

  const code = error.code || error.statusCode
  const type = error.type || ''
  const message = error.message || ''

  logger.debug(`Appwrite error parsing`, { code, type, message: message.slice(0, 120) })

  const errorMap = {
    401: 'Invalid email or password',
    409: type === 'user_already_exists'
      ? 'An account with this email already exists'
      : 'A conflict occurred. Please try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    400: type === 'user_missing_user_id'
      ? 'Invalid reset link. Please request a new one.'
      : type === 'general_argument_invalid'
        ? 'Invalid input provided. Please check your details.'
        : fallback,
  }

  if (message.includes('Invalid password') || message.includes('Invalid credentials')) {
    return 'Invalid email or password'
  }
  if (message.includes('already exists')) {
    return 'An account with this email already exists'
  }
  if (message.includes('rate') || message.includes('Rate')) {
    return 'Too many requests. Please try again later.'
  }

  return errorMap[code] || fallback
}
