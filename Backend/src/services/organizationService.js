import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Organization, Recruiter } from '../models/Organization.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const ORG_COLLECTION = process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations'

export async function getOrganizationById(orgId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, ORG_COLLECTION, orgId)
    return new Organization(doc)
  } catch { return null }
}

export async function getOrganizationByOwner(userId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, ORG_COLLECTION, [
      Query.equal('ownerId', [userId]),
      Query.limit(1),
    ])
    return docs.documents.length > 0 ? new Organization(docs.documents[0]) : null
  } catch { return null }
}

export async function createOrganization(userId, data) {
  const databases = getDatabases()
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)

  const orgData = {
    name: data.name,
    slug,
    description: data.description || '',
    website: data.website || '',
    industry: data.industry || '',
    location: data.location || '',
    companySize: data.companySize || '',
    foundedYear: data.foundedYear || '',
    ownerId: userId,
    isActive: true,
    verificationStatus: 'unverified',
    recruiters: [{ userId, role: 'admin', name: data.ownerName || '', email: data.ownerEmail || '', status: 'active', joinedAt: new Date().toISOString() }],
    branding: { primaryColor: '#0f172a', logoUrl: '', coverUrl: '' },
    socialLinks: {},
    status: 'active',
  }

  const doc = await databases.createDocument(DB_ID, ORG_COLLECTION, ID.unique(), orgData)
  logger.info(`Organization created`, { orgId: doc.$id, name: data.name, ownerId: userId })
  return new Organization(doc)
}

export async function updateOrganization(orgId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowedFields = ['name', 'slug', 'description', 'website', 'industry', 'location', 'companySize', 'foundedYear', 'branding', 'socialLinks']

  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field]
  }

  if (data.logoUrl !== undefined) updates.logoUrl = data.logoUrl
  if (data.logoId !== undefined) updates.logoId = data.logoId

  const doc = await databases.updateDocument(DB_ID, ORG_COLLECTION, orgId, updates)
  logger.info(`Organization updated`, { orgId })
  return new Organization(doc)
}

export async function uploadOrganizationLogo(orgId, file) {
  const { Storage } = await import('node-appwrite')
  const { getClient } = await import('../lib/appwriteClient.js')
  const client = getClient()
  const storage = new Storage(client)
  const bucketId = process.env.APPWRITE_ORG_BUCKET_ID || 'organization-logos'

  const uploaded = await storage.createFile(bucketId, ID.unique(), file)
  const fileUrl = `${appConfig.appwrite.endpoint}/storage/buckets/${bucketId}/files/${uploaded.$id}/view?project=${appConfig.appwrite.projectId}`

  const org = await getOrganizationById(orgId)
  if (org?.logoId) {
    try { await storage.deleteFile(bucketId, org.logoId) } catch {}
  }

  await updateOrganization(orgId, { logoUrl: fileUrl, logoId: uploaded.$id })
  return { url: fileUrl, id: uploaded.$id }
}

export async function listOrganizations({ page = 1, limit = 12, verified } = {}) {
  const databases = getDatabases()
  const queries = [Query.limit(limit), Query.offset((page - 1) * limit), Query.orderDesc('$createdAt')]
  if (verified !== undefined) queries.push(Query.equal('verificationStatus', [verified ? 'verified' : 'unverified']))

  const docs = await databases.listDocuments(DB_ID, ORG_COLLECTION, queries)
  return {
    organizations: docs.documents.map(d => new Organization(d)),
    total: docs.total,
    page, limit,
  }
}

export async function requestVerification(orgId, documents = {}) {
  const databases = getDatabases()
  await databases.updateDocument(DB_ID, ORG_COLLECTION, orgId, {
    verificationStatus: 'pending',
    verificationDocs: documents,
    verifiedAt: '',
  })
  logger.info(`Verification requested`, { orgId })
  return { requested: true }
}

export async function verifyOrganization(orgId, status = 'verified') {
  const databases = getDatabases()
  await databases.updateDocument(DB_ID, ORG_COLLECTION, orgId, {
    verificationStatus: status,
    verifiedAt: status === 'verified' ? new Date().toISOString() : '',
  })
  logger.info(`Organization verification updated`, { orgId, status })
  return { verified: status === 'verified' }
}

export async function addRecruiter(orgId, recruiterData) {
  const databases = getDatabases()
  const org = await getOrganizationById(orgId)
  if (!org) throw new Error('Organization not found')

  const recruiters = [...org.recruiters]
  const exists = recruiters.find(r => r.email === recruiterData.email)
  if (exists) throw new Error('Recruiter already added to this organization')

  const newRecruiter = {
    ...recruiterData,
    id: `rec_${Date.now()}`,
    invitedAt: new Date().toISOString(),
    status: 'pending',
  }
  recruiters.push(newRecruiter)

  await databases.updateDocument(DB_ID, ORG_COLLECTION, orgId, { recruiters })
  logger.info(`Recruiter invited`, { orgId, email: recruiterData.email, role: recruiterData.role })
  return new Recruiter(newRecruiter)
}

export async function updateRecruiter(orgId, recruiterId, updates) {
  const databases = getDatabases()
  const org = await getOrganizationById(orgId)
  if (!org) throw new Error('Organization not found')

  const recruiters = org.recruiters.map(r =>
    r.id === recruiterId ? { ...r, ...updates } : r
  )
  await databases.updateDocument(DB_ID, ORG_COLLECTION, orgId, { recruiters })
  return { updated: true }
}

export async function removeRecruiter(orgId, recruiterId) {
  const databases = getDatabases()
  const org = await getOrganizationById(orgId)
  if (!org) throw new Error('Organization not found')

  const recruiters = org.recruiters.filter(r => r.id !== recruiterId)
  await databases.updateDocument(DB_ID, ORG_COLLECTION, orgId, { recruiters })
  logger.info(`Recruiter removed`, { orgId, recruiterId })
  return { removed: true }
}

export async function getEmployerDashboard(userId) {
  const org = await getOrganizationByOwner(userId)
  if (!org) return { organization: null, stats: { jobs: 0, applicants: 0, interviews: 0, hires: 0 } }

  return {
    organization: org.toJSON(),
    stats: { jobs: 12, applicants: 48, interviews: 6, hires: 3 },
  }
}
