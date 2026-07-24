import { ID } from 'node-appwrite'
import { getAccount, getPublicAccount, getDatabases, getUsers } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { User } from '../models/User.js'
import { logger } from '../utils/logger.js'

const ROLE_HIERARCHY = appConfig.roles.hierarchy

function normalizeRole(role) {
  if (!role || !appConfig.roles.all.includes(role)) {
    return appConfig.roles.defaults.register
  }
  return role
}

export async function createUser({ email, password, fullName, username, role }) {
  const users = getUsers()
  const databases = getDatabases()

  const normalizedRole = normalizeRole(role)

  logger.info(`Creating Appwrite user`, { email, fullName, role: normalizedRole })

  // Use Users API (server-side) instead of Account API to avoid scope issues
  const appwriteUser = await users.create(ID.unique(), email, undefined, password, fullName)

  try {
    await users.updatePrefs(appwriteUser.$id, {
      role: normalizedRole,
      username: username || email.split('@')[0],
    })
    logger.debug(`User prefs updated`, { userId: appwriteUser.$id, role: normalizedRole })
  } catch (err) {
    logger.warn(`Failed to update user prefs (non-critical)`, { userId: appwriteUser.$id, error: err.message })
  }

  // Persist user to the Users collection — field names MUST match the collection schema
  try {
    await databases.createDocument(
      appConfig.appwrite.databaseId,
      appConfig.appwrite.usersCollectionId,
      appwriteUser.$id,
      {
        email: appwriteUser.email,
        fullName: appwriteUser.name || fullName,
        username: username || email.split('@')[0],
        role: normalizedRole,
        emailVerified: appwriteUser.emailVerification || false,
        status: 'active',
        createdBy: appwriteUser.$id,
      }
    )
    logger.debug(`User document created in Users collection`, { userId: appwriteUser.$id })
  } catch (err) {
    logger.warn(`Failed to create user document in Users collection`, { userId: appwriteUser.$id, error: err.message })
    // Re-throw so the caller knows the user creation is incomplete
    throw err
  }

  return new User({
    id: appwriteUser.$id,
    email: appwriteUser.email,
    name: appwriteUser.name || fullName,
    role: normalizedRole,
    emailVerified: appwriteUser.emailVerification || false,
    status: 'active',
  })
}

export async function createEmailSession(email, password) {
  // Use public client (no API key) for email/password login sessions.
  // The server-side Account API (with API key) lacks the "account" scope,
  // causing a "general_unauthorized_scope" error.
  const account = getPublicAccount()
  const session = await account.createEmailPasswordSession(email, password)
  return session
}

export async function getCurrentUser() {
  // This function should only be called when there's an active session
  // in the request context (browser cookie). For server-side use without
  // a session context, use getUserByEmail instead.
  //
  // The public client relies on the session cookie set by createEmailPasswordSession
  // on the response. If called without a session context (e.g., by the login controller
  // server-side where no cookie is preserved), this will fail.
  //
  // Use the Users API (server-side with API key) to find the user when
  // we have the email from the login request.
  const account = getPublicAccount()
  const user = await account.get()
  const prefs = await account.getPrefs()

  return new User({
    id: user.$id,
    email: user.email,
    name: user.name,
    role: prefs?.role || appConfig.roles.defaults.register,
    emailVerified: user.emailVerification || false,
    phone: user.phone || '',
    status: prefs?.status || 'active',
    prefs: prefs || {},
  })
}

/**
 * Get user by email using server-side Users API (no scope restrictions).
 * Used after login when we have the email but no session context.
 */
export async function getUserByEmail(email) {
  const users = getUsers()
  const userList = await users.list([], undefined, undefined, undefined, undefined, `email:${email}`)
  if (!userList.users || userList.users.length === 0) {
    throw new Error('User not found')
  }
  const appwriteUser = userList.users[0]
  return new User({
    id: appwriteUser.$id,
    email: appwriteUser.email,
    name: appwriteUser.name,
    role: appwriteUser.prefs?.role || appConfig.roles.defaults.register,
    emailVerified: appwriteUser.emailVerification || false,
    phone: appwriteUser.phone || '',
    status: appwriteUser.prefs?.status || 'active',
    prefs: appwriteUser.prefs || {},
  })
}

/**
 * Creates a session using the server-side Users API (bypasses Account API scope restrictions).
 * This is used by the admin login endpoint where the Appwrite project restricts
 * unauthenticated Account API access for guest users.
 */
export async function createServerSession(userId, password) {
  const users = getUsers()
  const session = await users.createSession(userId, password)
  return session
}

export async function getCurrentSession() {
  // Use public client (no API key) — relies on the session cookie sent by the browser.
  // The server-side Account API (with API key) lacks the "account" scope.
  const account = getPublicAccount()
  const user = await account.get()
  const prefs = await account.getPrefs()
  const sessions = await account.listSessions()

  return {
    user: new User({
      id: user.$id,
      email: user.email,
      name: user.name,
      role: prefs?.role || appConfig.roles.defaults.register,
      emailVerified: user.emailVerification || false,
      phone: user.phone || '',
      status: prefs?.status || 'active',
      prefs: prefs || {},
    }),
    sessions: sessions.sessions || [],
  }
}

export async function deleteCurrentSession() {
  const account = getAccount()
  await account.deleteSession('current')
}

export async function deleteSessionById(sessionId) {
  const account = getAccount()
  await account.deleteSession(sessionId)
}

export async function deleteAllSessions() {
  const account = getAccount()
  await account.deleteSessions()
}

export async function sendPasswordRecovery(email) {
  const account = getAccount()
  await account.createRecovery(email, appConfig.appwrite.recoveryRedirectUrl)
}

export async function resetPassword(userId, secret, newPassword) {
  const account = getAccount()
  await account.updateRecovery(userId, secret, newPassword)
}

export async function sendEmailVerification() {
  const userAccount = getAccount()
  await userAccount.createVerification(appConfig.appwrite.verificationRedirectUrl)
}

export async function confirmEmailVerification(userId, secret) {
  const userAccount = getAccount()
  await userAccount.updateVerification(userId, secret)
}

export async function getUserById(userId) {
  const users = getUsers()
  const appwriteUser = await users.get(userId)

  return new User({
    id: appwriteUser.$id,
    email: appwriteUser.email,
    name: appwriteUser.name,
    role: appwriteUser.prefs?.role || appConfig.roles.defaults.register,
    emailVerified: appwriteUser.emailVerification || false,
    phone: appwriteUser.phone || '',
    status: appwriteUser.prefs?.status || 'active',
    prefs: appwriteUser.prefs || {},
  })
}

export async function updateUserRole(userId, newRole) {
  const normalizedRole = normalizeRole(newRole)
  const users = getUsers()
  await users.updatePrefs(userId, { role: normalizedRole })
  return normalizedRole
}

export function hasPermission(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

export function canAccessResource(userRole, resourceOwnerRole) {
  return hasPermission(userRole, resourceOwnerRole)
}

export { normalizeRole }
