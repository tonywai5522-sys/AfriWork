import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Certification } from '../models/Certification.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION = appConfig.appwrite.usersCollectionId

function getCollectionId() {
  return process.env.APPWRITE_PROFILES_COLLECTION_ID || 'profiles'
}

export async function updateProfileCertifications(userId, certifications) {
  const databases = getDatabases()
  const collectionId = getCollectionId()

  const profile = await getProfileByUserId(userId)
  if (!profile) throw new Error('Profile not found. Create a profile first.')

  const validated = certifications.map(c => new Certification(c).toJSON())

  const doc = await databases.updateDocument(DB_ID, collectionId, profile.id, {
    certifications: validated,
  })

  return doc.certifications || []
}

export async function addCertification(userId, certData) {
  const databases = getDatabases()
  const collectionId = getCollectionId()

  const profile = await getProfileByUserId(userId)
  if (!profile) throw new Error('Profile not found. Create a profile first.')

  const existing = profile.certifications || []
  const newCert = new Certification(certData)
  const updated = [...existing.map(c => c.id ? c : new Certification(c).toJSON()), newCert.toJSON()]

  await databases.updateDocument(DB_ID, collectionId, profile.id, {
    certifications: updated,
  })

  return newCert.toJSON()
}

export async function updateCertification(userId, certId, certData) {
  const databases = getDatabases()
  const collectionId = getCollectionId()

  const profile = await getProfileByUserId(userId)
  if (!profile) throw new Error('Profile not found')

  const existing = profile.certifications || []
  const idx = existing.findIndex(c => c.id === certId)
  if (idx === -1) throw new Error('Certification not found')

  const updated = [...existing]
  updated[idx] = { ...updated[idx], ...certData, id: certId }

  await databases.updateDocument(DB_ID, collectionId, profile.id, {
    certifications: updated,
  })

  return updated[idx]
}

export async function deleteCertification(userId, certId) {
  const databases = getDatabases()
  const collectionId = getCollectionId()

  const profile = await getProfileByUserId(userId)
  if (!profile) throw new Error('Profile not found')

  const existing = profile.certifications || []
  const updated = existing.filter(c => c.id !== certId)

  await databases.updateDocument(DB_ID, collectionId, profile.id, {
    certifications: updated,
  })

  return { deleted: true }
}

export async function getCertifications(userId) {
  const profile = await getProfileByUserId(userId)
  if (!profile) return []
  return (profile.certifications || []).map(c => new Certification(c).toJSON())
}

async function getProfileByUserId(userId) {
  const databases = getDatabases()
  const collectionId = getCollectionId()

  try {
    const documents = await databases.listDocuments(DB_ID, collectionId, [
      `userId=${userId}`,
      'limit=1',
    ])
    const doc = documents.documents?.[0]
    return doc || null
  } catch (error) {
    if (error?.code === 404) return null
    throw error
  }
}
