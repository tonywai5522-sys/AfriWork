import { Query } from 'node-appwrite'
import { getUsers, getDatabases, getAccountWithSession } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Profile } from '../models/Profile.js'

const DB_ID = appConfig.appwrite.databaseId
const PROFILES_COLLECTION = process.env.APPWRITE_PROFILES_COLLECTION_ID || 'profiles'

const SAVED_TALENTS_COLLECTION = process.env.APPWRITE_SAVED_TALENTS_COLLECTION_ID || 'savedTalents'

export async function searchTalents({
  query: searchQuery = '',
  skills = [],
  experienceLevel,
  availability,
  location,
  hourlyRateMin,
  hourlyRateMax,
  sortBy = 'relevance',
  sortOrder = 'desc',
  page = 1,
  limit = 12,
}) {
  const { Users } = await import('node-appwrite')
  const users = getUsers()

  const queries = []

  // Filter by role = talent via prefs
  queries.push(Query.equal('prefs.role', ['talent']))

  // Search by name or email
  if (searchQuery) {
    queries.push(Query.search('name', searchQuery))
  }

  const offset = (page - 1) * limit
  queries.push(Query.limit(limit))
  queries.push(Query.offset(offset))

  let sortAttr = 'registration'
  if (sortBy === 'name') sortAttr = 'name'
  queries.push(sortOrder === 'asc' ? Query.orderAsc(sortAttr) : Query.orderDesc(sortAttr))

  let usersResult
  try {
    usersResult = await users.list(queries)
  } catch (error) {
    // If prefs filter fails (Appwrite free tier may not support it), fall back
    usersResult = await users.list([Query.limit(limit), Query.offset(offset)])
  }

  const talentIds = usersResult.users.map(u => u.$id)
  const talents = []

  // Fetch profiles for all returned users
  const profileMap = await getProfilesByUserIds(talentIds)

  for (const appwriteUser of usersResult.users) {
    const role = appwriteUser.prefs?.role || 'talent'
    if (role !== 'talent') continue

    const profile = profileMap[appwriteUser.$id]
    const profileData = profile ? profile.toJSON() : null

    // Apply profile-level filters
    if (skills.length > 0 && profileData) {
      const profileSkillNames = (profileData.skills || []).map(s => s.name.toLowerCase())
      const hasSkill = skills.some(s => profileSkillNames.includes(s.toLowerCase()))
      if (!hasSkill) continue
    }

    if (experienceLevel && profileData && profileData.experienceLevel !== experienceLevel) continue
    if (availability && profileData && profileData.availability !== availability) continue
    if (location && profileData) {
      const profileLoc = (profileData.location || '').toLowerCase()
      if (!profileLoc.includes(location.toLowerCase())) continue
    }
    if (hourlyRateMin !== undefined && profileData && (profileData.hourlyRate || 0) < hourlyRateMin) continue
    if (hourlyRateMax !== undefined && profileData && (profileData.hourlyRate || 0) > hourlyRateMax) continue

    talents.push({
      id: appwriteUser.$id,
      name: appwriteUser.name,
      email: appwriteUser.email,
      phone: appwriteUser.phone || '',
      emailVerified: appwriteUser.emailVerification || false,
      registration: appwriteUser.registration,
      profile: profileData,
    })
  }

  return {
    talents,
    total: talents.length,
    page,
    limit,
    hasMore: talents.length >= limit,
  }
}

export async function getTalentById(talentId) {
  const { Users } = await import('node-appwrite')
  const users = getUsers()
  const appwriteUser = await users.get(talentId)

  const profileMap = await getProfilesByUserIds([talentId])
  const profile = profileMap[talentId]

  return {
    id: appwriteUser.$id,
    name: appwriteUser.name,
    email: appwriteUser.email,
    phone: appwriteUser.phone || '',
    emailVerified: appwriteUser.emailVerification || false,
    registration: appwriteUser.registration,
    profile: profile ? profile.toJSON() : null,
  }
}

export async function getTalentStats() {
  const { Users } = await import('node-appwrite')
  const users = getUsers()

  // Get total talent count
  let totalTalent = 0
  try {
    const result = await users.list([Query.equal('prefs.role', ['talent']), Query.limit(1)])
    totalTalent = result.total
  } catch {
    totalTalent = 0
  }

  // Get recently active talents (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  let recentActive = 0
  try {
    const result = await users.list([
      Query.greaterThan('registration', thirtyDaysAgo),
      Query.limit(1),
    ])
    recentActive = result.total
  } catch {
    recentActive = 0
  }

  return { totalTalent, recentActive }
}

export async function saveTalent(userId, talentId) {
  const { ID } = await import('node-appwrite')
  const databases = getDatabases()

  try {
    await databases.createDocument(DB_ID, SAVED_TALENTS_COLLECTION, ID.unique(), {
      userId,
      talentId,
      createdAt: new Date().toISOString(),
    })
    return { saved: true }
  } catch (error) {
    if (error?.code === 409) {
      return { saved: false, message: 'Already saved' }
    }
    throw error
  }
}

export async function unsaveTalent(userId, talentId) {
  const databases = getDatabases()

  try {
    const documents = await databases.listDocuments(DB_ID, SAVED_TALENTS_COLLECTION, [
      Query.equal('userId', [userId]),
      Query.equal('talentId', [talentId]),
      Query.limit(1),
    ])
    if (documents.documents.length > 0) {
      await databases.deleteDocument(DB_ID, SAVED_TALENTS_COLLECTION, documents.documents[0].$id)
    }
    return { saved: false }
  } catch {
    return { saved: false }
  }
}

export async function getSavedTalentIds(userId) {
  const databases = getDatabases()
  try {
    const documents = await databases.listDocuments(DB_ID, SAVED_TALENTS_COLLECTION, [
      Query.equal('userId', [userId]),
      Query.limit(100),
    ])
    return documents.documents.map(d => d.talentId)
  } catch {
    return []
  }
}

export async function getSavedTalents(userId) {
  const talentIds = await getSavedTalentIds(userId)
  if (talentIds.length === 0) return []

  const talents = []
  for (const id of talentIds) {
    try {
      const talent = await getTalentById(id)
      talents.push(talent)
    } catch {
      // Skip if user no longer exists
    }
  }
  return talents
}

async function getProfilesByUserIds(userIds) {
  if (userIds.length === 0) return {}

  const databases = getDatabases()
  try {
    const documents = await databases.listDocuments(DB_ID, PROFILES_COLLECTION, [
      Query.equal('userId', userIds),
      Query.limit(userIds.length),
    ])

    const profileMap = {}
    for (const doc of documents.documents) {
      profileMap[doc.userId] = new Profile(doc)
    }
    return profileMap
  } catch {
    return {}
  }
}
