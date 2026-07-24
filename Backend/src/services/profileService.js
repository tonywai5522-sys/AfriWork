import { ID } from 'node-appwrite'
import { getDatabases, getClient } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Profile, Experience, Education } from '../models/Profile.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION = appConfig.appwrite.usersCollectionId

function getCollectionId() {
  return process.env.APPWRITE_PROFILES_COLLECTION_ID || 'profiles'
}

export async function getProfileByUserId(userId) {
  const databases = getDatabases()
  const collectionId = getCollectionId()

  try {
    const documents = await databases.listDocuments(DB_ID, collectionId, [
      `userId=${userId}`,
      'limit=1',
    ])
    const doc = documents.documents?.[0]
    return doc ? new Profile(doc) : null
  } catch (error) {
    if (error?.code === 404) return null
    throw error
  }
}

export async function createProfile(userId, data) {
  const databases = getDatabases()
  const collectionId = getCollectionId()

  const profileData = {
    userId,
    headline: data.headline || '',
    bio: data.bio || '',
    location: data.location || '',
    timezone: data.timezone || '',
    experienceLevel: data.experienceLevel || 'mid',
    availability: data.availability || 'available',
    website: data.website || '',
    linkedinUrl: data.linkedinUrl || '',
    githubUrl: data.githubUrl || '',
    portfolioUrl: data.portfolioUrl || '',
    resumeUrl: data.resumeUrl || '',
    avatarUrl: data.avatarUrl || '',
    avatarId: data.avatarId || '',
    preferredWorkType: data.preferredWorkType || 'remote',
    hourlyRate: data.hourlyRate || 0,
    currency: data.currency || 'USD',
    profileCompleteness: 0,
    skills: data.skills || [],
    experience: data.experience || [],
    education: data.education || [],
    socialLinks: data.socialLinks || {},
    languages: data.languages || [],
    certifications: data.certifications || [],
    status: 'active',
  }

  const doc = await databases.createDocument(DB_ID, collectionId, ID.unique(), profileData)
  const profile = new Profile(doc)
  return updateProfileCompleteness(databases, collectionId, doc.$id, profile)
}

export async function updateProfile(userId, data) {
  const databases = getDatabases()
  const collectionId = getCollectionId()

  const profile = await getProfileByUserId(userId)
  if (!profile) {
    return createProfile(userId, data)
  }

  const updates = {}
  const allowedFields = [
    'headline', 'bio', 'location', 'timezone', 'experienceLevel',
    'availability', 'website', 'linkedinUrl', 'githubUrl', 'portfolioUrl',
    'resumeUrl', 'avatarUrl', 'avatarId', 'preferredWorkType',
    'hourlyRate', 'currency',
  ]

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field]
    }
  }

  if (updates.hourlyRate !== undefined && updates.hourlyRate === 0) {
    updates.hourlyRate = 0
  }

  const doc = await databases.updateDocument(DB_ID, collectionId, profile.id, updates)
  const updatedProfile = new Profile(doc)
  return updateProfileCompleteness(databases, collectionId, doc.$id, updatedProfile)
}

export async function updateProfileSkills(userId, skills) {
  const databases = getDatabases()
  const collectionId = getCollectionId()
  const profile = await getProfileByUserId(userId)

  if (!profile) throw new Error('Profile not found. Create a profile first.')

  const validated = skills.map(s => ({
    name: s.name?.trim(),
    category: s.category?.trim() || 'general',
    proficiency: s.proficiency || 'intermediate',
  })).filter(s => s.name)

  const doc = await databases.updateDocument(DB_ID, collectionId, profile.id, { skills: validated })
  const updatedProfile = new Profile(doc)
  return updateProfileCompleteness(databases, collectionId, doc.$id, updatedProfile)
}

export async function updateProfileExperience(userId, experience) {
  const databases = getDatabases()
  const collectionId = getCollectionId()
  const profile = await getProfileByUserId(userId)
  if (!profile) throw new Error('Profile not found')

  const validated = experience.map(e => new Experience(e))

  const doc = await databases.updateDocument(DB_ID, collectionId, profile.id, {
    experience: validated,
  })
  const updatedProfile = new Profile(doc)
  return updateProfileCompleteness(databases, collectionId, doc.$id, updatedProfile)
}

export async function updateProfileEducation(userId, education) {
  const databases = getDatabases()
  const collectionId = getCollectionId()
  const profile = await getProfileByUserId(userId)
  if (!profile) throw new Error('Profile not found')

  const validated = education.map(e => new Education(e))

  const doc = await databases.updateDocument(DB_ID, collectionId, profile.id, {
    education: validated,
  })
  const updatedProfile = new Profile(doc)
  return updateProfileCompleteness(databases, collectionId, doc.$id, updatedProfile)
}

export async function uploadAvatar(userId, file) {
  const { Storage } = await import('node-appwrite')
  const client = getClient()
  const storage = new Storage(client)
  const bucketId = process.env.APPWRITE_AVATAR_BUCKET_ID || 'avatars'

  const uploaded = await storage.createFile(bucketId, ID.unique(), file)

  const fileUrl = `${appConfig.appwrite.endpoint}/storage/buckets/${bucketId}/files/${uploaded.$id}/view?project=${appConfig.appwrite.projectId}`

  const databases = getDatabases()
  const collectionId = getCollectionId()
  const profile = await getProfileByUserId(userId)

  if (profile) {
    // Delete old avatar if exists
    if (profile.avatarId) {
      try {
        await storage.deleteFile(bucketId, profile.avatarId)
      } catch { /* ignore if old file doesn't exist */ }
    }

    await databases.updateDocument(DB_ID, collectionId, profile.id, {
      avatarUrl: fileUrl,
      avatarId: uploaded.$id,
    })
  }

  return { url: fileUrl, id: uploaded.$id }
}

export async function deleteAvatar(userId) {
  const { Storage } = await import('node-appwrite')
  const client = getClient()
  const storage = new Storage(client)
  const bucketId = process.env.APPWRITE_AVATAR_BUCKET_ID || 'avatars'

  const profile = await getProfileByUserId(userId)
  if (profile?.avatarId) {
    try {
      await storage.deleteFile(bucketId, profile.avatarId)
    } catch { /* ignore */ }
  }

  if (profile) {
    const databases = getDatabases()
    const collectionId = getCollectionId()
    await databases.updateDocument(DB_ID, collectionId, profile.id, {
      avatarUrl: '',
      avatarId: '',
    })
  }
}

export async function getPublicProfile(userId) {
  const profile = await getProfileByUserId(userId)
  if (!profile) return null

  const safe = profile.toJSON()
  delete safe.email
  return safe
}

async function updateProfileCompleteness(databases, collectionId, docId, profile) {
  const completeness = profile.getCompletionPercentage()
  await databases.updateDocument(DB_ID, collectionId, docId, {
    profileCompleteness: completeness,
  })
  profile.profileCompleteness = completeness
  return profile
}
