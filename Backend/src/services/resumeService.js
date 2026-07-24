import { ID } from 'node-appwrite'
import { getClient, getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'

const DB_ID = appConfig.appwrite.databaseId

function getResumeBucketId() {
  return process.env.APPWRITE_RESUME_BUCKET_ID || 'resumes'
}

function getCollectionId() {
  return process.env.APPWRITE_PROFILES_COLLECTION_ID || 'profiles'
}

export async function uploadResume(userId, file) {
  const { Storage } = await import('node-appwrite')
  const client = getClient()
  const storage = new Storage(client)
  const bucketId = getResumeBucketId()

  const uploaded = await storage.createFile(bucketId, ID.unique(), file)

  const fileUrl = `${appConfig.appwrite.endpoint}/storage/buckets/${bucketId}/files/${uploaded.$id}/view?project=${appConfig.appwrite.projectId}`

  const databases = getDatabases()
  const collectionId = getCollectionId()

  const profile = await getProfileByUserId(userId, databases)
  if (profile) {
    // Delete old resume if exists
    if (profile.resumeId) {
      try {
        await storage.deleteFile(bucketId, profile.resumeId)
      } catch { /* ignore */ }
    }

    await databases.updateDocument(DB_ID, collectionId, profile.id, {
      resumeUrl: fileUrl,
      resumeId: uploaded.$id,
      resumeName: file.originalFilename || file.name || 'resume',
    })
  }

  return {
    url: fileUrl,
    id: uploaded.$id,
    name: file.originalFilename || file.name || 'resume',
    mimeType: uploaded.mimeType,
    sizeOriginal: uploaded.sizeOriginal,
  }
}

export async function downloadResume(userId) {
  const { Storage } = await import('node-appwrite')
  const client = getClient()
  const storage = new Storage(client)
  const bucketId = getResumeBucketId()

  const profile = await getProfileByUserId(userId, getDatabases())
  if (!profile || !profile.resumeId) {
    throw new Error('No resume found for this user')
  }

  const file = await storage.getFile(bucketId, profile.resumeId)
  const fileBuffer = await storage.getFileDownload(bucketId, profile.resumeId)

  return {
    buffer: fileBuffer,
    mimeType: file.mimeType,
    name: profile.resumeName || 'resume',
  }
}

export async function getResumeInfo(userId) {
  const profile = await getProfileByUserId(userId, getDatabases())
  if (!profile || !profile.resumeUrl) {
    return null
  }

  return {
    url: profile.resumeUrl,
    id: profile.resumeId || '',
    name: profile.resumeName || 'Resume',
  }
}

export async function deleteResume(userId) {
  const { Storage } = await import('node-appwrite')
  const client = getClient()
  const storage = new Storage(client)
  const bucketId = getResumeBucketId()

  const profile = await getProfileByUserId(userId, getDatabases())
  if (profile?.resumeId) {
    try {
      await storage.deleteFile(bucketId, profile.resumeId)
    } catch { /* ignore */ }
  }

  if (profile) {
    const databases = getDatabases()
    const collectionId = getCollectionId()
    await databases.updateDocument(DB_ID, collectionId, profile.id, {
      resumeUrl: '',
      resumeId: '',
      resumeName: '',
    })
  }

  return { deleted: true }
}

export async function getPublicResumeUrl(userId) {
  const profile = await getProfileByUserId(userId, getDatabases())
  if (!profile || !profile.resumeUrl) return null
  return { url: profile.resumeUrl, name: profile.resumeName || 'Resume' }
}

async function getProfileByUserId(userId, databases) {
  const collectionId = getCollectionId()
  try {
    const documents = await databases.listDocuments(DB_ID, collectionId, [
      `userId=${userId}`,
      'limit=1',
    ])
    return documents.documents?.[0] || null
  } catch (error) {
    if (error?.code === 404) return null
    throw error
  }
}
