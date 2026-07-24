import { ID, Query } from 'node-appwrite'
import { getDatabases, getUsers, getAccount } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { logger } from '../utils/logger.js'
import { getNotificationPreferences, updateNotificationPreferences } from './notificationService.js'

const DB_ID = appConfig.appwrite.databaseId
const USER_PREFS_COLL = process.env.APPWRITE_USER_PREFERENCES_COLLECTION_ID || 'user_preferences'
const CONNECTED_ACCOUNTS_COLL = process.env.APPWRITE_CONNECTED_ACCOUNTS_COLLECTION_ID || 'connected_accounts'

// ─── Account Settings ──────────────────────────────────

export async function getAccountSettings(userId) {
  try {
    const users = getUsers()
    const user = await users.get(userId)
    const prefs = user.prefs || {}
    return {
      fullName: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      username: prefs.username || user.email?.split('@')[0] || '',
      timezone: prefs.timezone || '',
      language: prefs.language || 'en',
      locale: prefs.locale || 'en-US',
      emailVerified: user.emailVerification || false,
    }
  } catch (err) {
    logger.error(`Failed to get account settings`, { userId, error: err.message })
    throw err
  }
}

export async function updateAccountSettings(userId, data) {
  const users = getUsers()
  try {
    const user = await users.get(userId)
    const existingPrefs = user.prefs || {}
    const updatedPrefs = { ...existingPrefs }

    const allowedFields = ['fullName', 'phone', 'username', 'timezone', 'language', 'locale']
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updatedPrefs[field] = data[field]
      }
    }

    // Update name if provided
    if (data.fullName) {
      await users.updateName(userId, data.fullName)
    }
    if (data.phone !== undefined) {
      await users.updatePhone(userId, data.phone)
    }

    await users.updatePrefs(userId, updatedPrefs)
    logger.info(`Account settings updated`, { userId })

    return await getAccountSettings(userId)
  } catch (err) {
    logger.error(`Failed to update account settings`, { userId, error: err.message })
    throw err
  }
}

// ─── Security Settings ─────────────────────────────────

export async function getSecuritySettings(userId) {
  try {
    const users = getUsers()
    const user = await users.get(userId)
    const prefs = user.prefs || {}

    const account = getAccount()
    let activeSessions = []
    try {
      const sessions = await account.listSessions()
      activeSessions = sessions.sessions || []
    } catch { /* may fail if no session context */ }

    return {
      twoFactorEnabled: prefs.twoFactorEnabled || false,
      activeSessions: activeSessions.map(s => ({
        id: s.$id,
        clientName: s.clientName || '',
        clientType: s.clientType || '',
        deviceName: s.deviceName || '',
        deviceBrand: s.deviceBrand || '',
        deviceModel: s.deviceModel || '',
        osName: s.osName || '',
        osVersion: s.osVersion || '',
        countryName: s.countryName || '',
        ipAddress: s.ipAddress || '',
        current: s.current || false,
        createdAt: s.$createdAt || '',
        expireAt: s.$expireAt || '',
      })),
      lastPasswordChange: prefs.lastPasswordChange || '',
      sessionTimeout: prefs.sessionTimeout || 60,
    }
  } catch (err) {
    logger.error(`Failed to get security settings`, { userId, error: err.message })
    throw err
  }
}

export async function updateSecuritySettings(userId, data) {
  const users = getUsers()
  try {
    const user = await users.get(userId)
    const existingPrefs = user.prefs || {}
    if (data.sessionTimeout !== undefined) {
      existingPrefs.sessionTimeout = parseInt(data.sessionTimeout)
    }
    await users.updatePrefs(userId, existingPrefs)
    logger.info(`Security settings updated`, { userId })
    return await getSecuritySettings(userId)
  } catch (err) {
    logger.error(`Failed to update security settings`, { userId, error: err.message })
    throw err
  }
}

// ─── Privacy Settings ──────────────────────────────────

const DEFAULT_PRIVACY = {
  profileVisibility: 'public',
  searchIndexing: true,
  showEmail: false,
  showPhone: false,
  showLocation: true,
  showRate: true,
  dataForPersonalization: true,
}

export async function getPrivacySettings(userId) {
  try {
    const dbs = getDatabases()
    const docs = await dbs.listDocuments(DB_ID, USER_PREFS_COLL, [
      Query.equal('userId', [userId]),
      Query.equal('type', ['privacy']),
      Query.limit(1),
    ])
    if (docs.documents.length > 0) {
      const d = docs.documents[0]
      return {
        profileVisibility: d.profileVisibility || DEFAULT_PRIVACY.profileVisibility,
        searchIndexing: d.searchIndexing !== undefined ? d.searchIndexing : DEFAULT_PRIVACY.searchIndexing,
        showEmail: d.showEmail !== undefined ? d.showEmail : DEFAULT_PRIVACY.showEmail,
        showPhone: d.showPhone !== undefined ? d.showPhone : DEFAULT_PRIVACY.showPhone,
        showLocation: d.showLocation !== undefined ? d.showLocation : DEFAULT_PRIVACY.showLocation,
        showRate: d.showRate !== undefined ? d.showRate : DEFAULT_PRIVACY.showRate,
        dataForPersonalization: d.dataForPersonalization !== undefined ? d.dataForPersonalization : DEFAULT_PRIVACY.dataForPersonalization,
      }
    }
    return { ...DEFAULT_PRIVACY, id: null }
  } catch {
    return { ...DEFAULT_PRIVACY }
  }
}

export async function updatePrivacySettings(userId, data) {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, USER_PREFS_COLL, [
      Query.equal('userId', [userId]),
      Query.equal('type', ['privacy']),
      Query.limit(1),
    ])

    const payload = { userId, type: 'privacy', ...data }

    if (docs.documents.length > 0) {
      await dbs.updateDocument(DB_ID, USER_PREFS_COLL, docs.documents[0].$id, payload)
    } else {
      await dbs.createDocument(DB_ID, USER_PREFS_COLL, ID.unique(), payload)
    }
    logger.info(`Privacy settings updated`, { userId })
    return await getPrivacySettings(userId)
  } catch (err) {
    logger.error(`Failed to update privacy settings`, { userId, error: err.message })
    throw err
  }
}

// ─── Notification Preferences ──────────────────────────

export { getNotificationPreferences, updateNotificationPreferences }

// ─── Connected Accounts ────────────────────────────────

export async function getConnectedAccounts(userId) {
  try {
    const dbs = getDatabases()
    const docs = await dbs.listDocuments(DB_ID, CONNECTED_ACCOUNTS_COLL, [
      Query.equal('userId', [userId]),
      Query.limit(20),
    ])
    return docs.documents.map(d => ({
      id: d.$id,
      userId: d.userId,
      provider: d.provider,
      providerAccountId: d.providerAccountId,
      providerEmail: d.providerEmail || '',
      displayName: d.displayName || '',
      avatarUrl: d.avatarUrl || '',
      connectedAt: d.$createdAt || '',
      lastUsedAt: d.lastUsedAt || '',
    }))
  } catch {
    return []
  }
}

export async function connectAccount(userId, { provider, providerAccountId, accessToken, providerEmail, displayName, avatarUrl }) {
  const dbs = getDatabases()
  try {
    // Check if already connected
    const existing = await dbs.listDocuments(DB_ID, CONNECTED_ACCOUNTS_COLL, [
      Query.equal('userId', [userId]),
      Query.equal('provider', [provider]),
      Query.limit(1),
    ])
    if (existing.documents.length > 0) {
      await dbs.updateDocument(DB_ID, CONNECTED_ACCOUNTS_COLL, existing.documents[0].$id, {
        providerAccountId,
        accessToken,
        providerEmail: providerEmail || '',
        displayName: displayName || '',
        avatarUrl: avatarUrl || '',
        lastUsedAt: new Date().toISOString(),
      })
      return { id: existing.documents[0].$id, provider, connected: true, updated: true }
    }

    const doc = await dbs.createDocument(DB_ID, CONNECTED_ACCOUNTS_COLL, ID.unique(), {
      userId,
      provider,
      providerAccountId,
      accessToken: accessToken || '',
      providerEmail: providerEmail || '',
      displayName: displayName || '',
      avatarUrl: avatarUrl || '',
      lastUsedAt: new Date().toISOString(),
      status: 'active',
    })
    logger.info(`Connected account added`, { userId, provider })
    return { id: doc.$id, provider, connected: true, updated: false }
  } catch (err) {
    logger.error(`Failed to connect account`, { userId, provider, error: err.message })
    throw err
  }
}

export async function disconnectAccount(userId, accountId) {
  const dbs = getDatabases()
  try {
    // Verify ownership
    const doc = await dbs.getDocument(DB_ID, CONNECTED_ACCOUNTS_COLL, accountId)
    if (doc.userId !== userId) {
      throw new Error('Unauthorized: account does not belong to user')
    }
    await dbs.deleteDocument(DB_ID, CONNECTED_ACCOUNTS_COLL, accountId)
    logger.info(`Connected account removed`, { userId, accountId, provider: doc.provider })
    return { disconnected: true }
  } catch (err) {
    logger.error(`Failed to disconnect account`, { userId, accountId, error: err.message })
    throw err
  }
}
