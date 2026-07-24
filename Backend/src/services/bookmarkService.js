import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const BOOKMARKS_COLL = process.env.APPWRITE_BOOKMARKS_COLLECTION_ID || 'bookmarks'

const VALID_TYPES = ['job', 'talent', 'project', 'organization', 'portfolio', 'course']

export async function addBookmark(userId, targetType, targetId) {
  if (!VALID_TYPES.includes(targetType)) throw new Error(`Invalid bookmark type: ${targetType}`)
  const dbs = getDatabases()
  const existing = await dbs.listDocuments(DB_ID, BOOKMARKS_COLL, [
    Query.equal('userId', [userId]),
    Query.equal('targetType', [targetType]),
    Query.equal('targetId', [targetId]),
    Query.limit(1),
  ])
  if (existing.documents.length > 0) return { bookmarked: true, id: existing.documents[0].$id, existing: true }

  const doc = await dbs.createDocument(DB_ID, BOOKMARKS_COLL, ID.unique(), {
    userId, targetType, targetId, createdAt: new Date().toISOString(),
    metadata: {},
  })
  logger.info(`Bookmark added`, { userId, targetType, targetId, bookmarkId: doc.$id })
  return { bookmarked: true, id: doc.$id, existing: false }
}

export async function removeBookmark(userId, targetType, targetId) {
  const dbs = getDatabases()
  const docs = await dbs.listDocuments(DB_ID, BOOKMARKS_COLL, [
    Query.equal('userId', [userId]),
    Query.equal('targetType', [targetType]),
    Query.equal('targetId', [targetId]),
    Query.limit(1),
  ])
  if (docs.documents.length > 0) {
    await dbs.deleteDocument(DB_ID, BOOKMARKS_COLL, docs.documents[0].$id)
  }
  return { bookmarked: false }
}

export async function removeBookmarkById(bookmarkId) {
  const dbs = getDatabases()
  await dbs.deleteDocument(DB_ID, BOOKMARKS_COLL, bookmarkId)
  return { removed: true }
}

export async function isBookmarked(userId, targetType, targetId) {
  const dbs = getDatabases()
  const docs = await dbs.listDocuments(DB_ID, BOOKMARKS_COLL, [
    Query.equal('userId', [userId]),
    Query.equal('targetType', [targetType]),
    Query.equal('targetId', [targetId]),
    Query.limit(1),
  ])
  return docs.documents.length > 0
}

export async function getBookmarkedIds(userId, targetType) {
  const dbs = getDatabases()
  const queries = [Query.equal('userId', [userId]), Query.limit(200)]
  if (targetType) queries.push(Query.equal('targetType', [targetType]))

  try {
    const docs = await dbs.listDocuments(DB_ID, BOOKMARKS_COLL, queries)
    return docs.documents.map(d => d.targetId)
  } catch { return [] }
}

export async function getUserBookmarks(userId, { targetType, page = 1, limit = 50 } = {}) {
  const dbs = getDatabases()
  const queries = [
    Query.equal('userId', [userId]),
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
    Query.offset((page - 1) * limit),
  ]
  if (targetType) queries.push(Query.equal('targetType', [targetType]))

  try {
    const docs = await dbs.listDocuments(DB_ID, BOOKMARKS_COLL, queries)
    return {
      bookmarks: docs.documents.map(d => ({
        id: d.$id,
        userId: d.userId,
        targetType: d.targetType,
        targetId: d.targetId,
        metadata: d.metadata || {},
        createdAt: d.$createdAt,
      })),
      total: docs.total,
      page, limit, hasMore: docs.total > page * limit,
    }
  } catch {
    return { bookmarks: [], total: 0, page, limit, hasMore: false }
  }
}

export async function getBookmarkIdsByType(userId) {
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, BOOKMARKS_COLL, [
      Query.equal('userId', [userId]),
      Query.limit(500),
    ])
    const result = { job: [], talent: [], project: [], organization: [], portfolio: [], course: [] }
    for (const d of docs.documents) {
      if (result[d.targetType]) result[d.targetType].push(d.targetId)
    }
    return result
  } catch {
    return { job: [], talent: [], project: [], organization: [], portfolio: [], course: [] }
  }
}

export async function toggleBookmark(userId, targetType, targetId) {
  const bookmarked = await isBookmarked(userId, targetType, targetId)
  if (bookmarked) {
    await removeBookmark(userId, targetType, targetId)
    return { bookmarked: false }
  }
  const result = await addBookmark(userId, targetType, targetId)
  return { bookmarked: true, id: result.id }
}

/**
 * Fetch bookmark entries with their target item titles populated.
 * For each targetType, fetches the corresponding Appwrite collection document.
 */
export async function getPopulatedBookmarks(userId, { targetType, page = 1, limit = 50 } = {}) {
  const raw = await getUserBookmarks(userId, { targetType, page, limit })
  const { bookmarks, total, hasMore } = raw

  if (bookmarks.length === 0) return { items: [], total: 0, hasMore: false }

  const dbs = getDatabases()
  const populated = await Promise.all(
    bookmarks.map(async (bm) => {
      try {
        const item = await fetchTargetItem(dbs, bm.targetType, bm.targetId)
        return { ...bm, item }
      } catch {
        return { ...bm, item: null }
      }
    })
  )

  return { items: populated.filter(b => b.item !== null), total, hasMore }
}

async function fetchTargetItem(dbs, targetType, targetId) {
  const COLLECTIONS = {
    job: 'jobs',
    talent: 'profiles',
    project: 'projects',
    organization: 'organizations',
    portfolio: 'projects',
    course: 'courses',
  }

  const collectionId = COLLECTIONS[targetType]
  if (!collectionId) return null

  // For talent, we fetch the profile (which has userId as the identifier)
  if (targetType === 'talent') {
    const doc = await dbs.listDocuments(DB_ID, collectionId, [
      Query.equal('userId', [targetId]),
      Query.limit(1),
    ])
    if (doc.documents.length === 0) return null
    const p = doc.documents[0]
    return {
      id: targetId,
      title: p.headline || p.fullName || targetId,
      subtitle: p.location || p.experienceLevel || '',
      imageUrl: p.avatarUrl || '',
    }
  }

  const doc = await dbs.getDocument(DB_ID, collectionId, targetId).catch(() => null)
  if (!doc) return null

  const titleFieldMap = {
    job: 'title',
    project: 'title',
    organization: 'name',
    portfolio: 'title',
    course: 'title',
  }

  const titleKey = titleFieldMap[targetType] || 'name'
  return {
    id: doc.$id,
    title: doc[titleKey] || doc.name || targetId,
    subtitle: doc.location || doc.industry || doc.level || '',
    imageUrl: doc.logoUrl || doc.thumbnailUrl || '',
  }
}
