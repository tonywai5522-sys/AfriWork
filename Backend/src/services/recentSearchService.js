import { Query, ID } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { RecentSearch } from '../models/RecentSearch.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION_ID = process.env.APPWRITE_RECENT_SEARCHES_COLLECTION_ID || 'recentSearches'

export async function getRecentSearches(userId, limit = 10) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('userId', [userId]),
      Query.orderDesc('createdAt'),
      Query.limit(limit),
    ])
    return docs.documents.map(d => new RecentSearch(d))
  } catch {
    return []
  }
}

export async function saveRecentSearch(userId, query, type, results = 0) {
  const databases = getDatabases()
  try {
    await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
      userId,
      query,
      type,
      results,
      createdAt: new Date().toISOString(),
    })
    // Trim to max 20 per user
    await trimRecentSearches(userId)
  } catch { /* best effort */ }
}

async function trimRecentSearches(userId) {
  const databases = getDatabases()
  try {
    const existing = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('userId', [userId]),
      Query.orderDesc('createdAt'),
      Query.limit(100),
    ])
    if (existing.documents.length > 20) {
      const toDelete = existing.documents.slice(20)
      for (const doc of toDelete) {
        try { await databases.deleteDocument(DB_ID, COLLECTION_ID, doc.$id) } catch { /* skip */ }
      }
    }
  } catch { /* best effort */ }
}

export async function clearRecentSearches(userId) {
  const databases = getDatabases()
  try {
    const existing = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('userId', [userId]),
      Query.limit(100),
    ])
    for (const doc of existing.documents) {
      try { await databases.deleteDocument(DB_ID, COLLECTION_ID, doc.$id) } catch { /* skip */ }
    }
  } catch { /* best effort */ }
}

export async function deleteRecentSearch(searchId) {
  const databases = getDatabases()
  try {
    await databases.deleteDocument(DB_ID, COLLECTION_ID, searchId)
  } catch { /* already deleted */ }
}
