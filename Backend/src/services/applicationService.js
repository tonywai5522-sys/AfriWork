import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Application } from '../models/Application.js'
import { logger } from '../utils/logger.js'
import * as jobService from './jobService.js'

const DB_ID = appConfig.appwrite.databaseId
const APPLICATIONS_COLLECTION = process.env.APPWRITE_APPLICATIONS_COLLECTION_ID || 'applications'

// ─── Helpers ───────────────────────────────────────────

function formatDoc(doc) {
  return {
    ...doc,
    id: doc.$id,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  }
}

// ─── Core CRUD ──────────────────────────────────────────

export async function createApplication(applicantId, data) {
  const databases = getDatabases()

  // Check if already applied
  const existing = await databases.listDocuments(DB_ID, APPLICATIONS_COLLECTION, [
    Query.equal('jobId', [data.jobId]),
    Query.equal('applicantId', [applicantId]),
    Query.limit(1),
  ])
  if (existing.documents.length > 0) {
    throw Object.assign(new Error('You have already applied to this job'), { statusCode: 409 })
  }

  // Get job to populate employerId and jobTitle
  const job = await jobService.getJobById(data.jobId)
  if (!job) {
    throw Object.assign(new Error('Job not found'), { statusCode: 404 })
  }
  if (job.status !== 'active') {
    throw Object.assign(new Error('This job is no longer accepting applications'), { statusCode: 400 })
  }

  const applicationData = {
    jobId: data.jobId,
    jobTitle: job.title,
    employerId: job.employerId,
    applicantId,
    applicantName: data.applicantName || '',
    applicantEmail: data.applicantEmail || '',
    applicantPhone: data.applicantPhone || '',
    coverLetter: data.coverLetter || '',
    resumeUrl: data.resumeUrl || '',
    resumeId: data.resumeId || '',
    portfolioUrl: data.portfolioUrl || '',
    proposedRate: data.proposedRate || 0,
    currency: data.currency || 'USD',
    status: 'pending',
    reviewNotes: '',
    reviewedBy: '',
    reviewedAt: '',
  }

  const doc = await databases.createDocument(DB_ID, APPLICATIONS_COLLECTION, ID.unique(), applicationData)
  logger.info(`Application created`, { jobId: data.jobId, applicantId, applicationId: doc.$id })

  // Increment application count on job
  try {
    await jobService.updateJob(data.jobId, { applicationCount: (job.applicationCount || 0) + 1 })
  } catch { /* non-critical */ }

  return new Application(formatDoc(doc))
}

export async function getApplicationById(applicationId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, APPLICATIONS_COLLECTION, applicationId)
    return new Application(formatDoc(doc))
  } catch {
    return null
  }
}

export async function updateApplication(applicationId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowed = ['status', 'reviewNotes', 'coverLetter', 'proposedRate', 'currency', 'resumeUrl', 'resumeId', 'portfolioUrl', 'applicantName', 'applicantEmail', 'applicantPhone']
  for (const f of allowed) {
    if (data[f] !== undefined) updates[f] = data[f]
  }

  const doc = await databases.updateDocument(DB_ID, APPLICATIONS_COLLECTION, applicationId, updates)
  return new Application(formatDoc(doc))
}

export async function deleteApplication(applicationId) {
  const databases = getDatabases()
  await databases.deleteDocument(DB_ID, APPLICATIONS_COLLECTION, applicationId)
}

// ─── Queries ────────────────────────────────────────────

export async function searchApplications({
  jobId,
  applicantId,
  employerId,
  status,
  sortBy,
  sortOrder,
  page = 1,
  limit = 20,
}) {
  const databases = getDatabases()
  const queries = []
  const offset = (page - 1) * limit

  queries.push(Query.limit(limit))
  queries.push(Query.offset(offset))

  if (jobId) queries.push(Query.equal('jobId', [jobId]))
  if (applicantId) queries.push(Query.equal('applicantId', [applicantId]))
  if (employerId) queries.push(Query.equal('employerId', [employerId]))
  if (status) queries.push(Query.equal('status', [status]))

  const sortField = sortBy === 'rate' ? 'proposedRate' : sortBy === 'status' ? 'status' : '$createdAt'
  queries.push(sortOrder === 'asc' ? Query.orderAsc(sortField) : Query.orderDesc(sortField))

  let docs
  try {
    docs = await databases.listDocuments(DB_ID, APPLICATIONS_COLLECTION, queries)
  } catch (err) {
    logger.error('searchApplications failed', { error: err.message, queries })
    docs = { documents: [], total: 0 }
  }

  const applications = docs.documents.map(d => new Application(formatDoc(d)))
  return {
    applications: applications.map(a => a.toJSON()),
    total: docs.total,
    page,
    limit,
  }
}

export async function getApplicationsByJob(jobId, status, page, limit) {
  return searchApplications({ jobId, status, page, limit })
}

export async function getApplicationsByApplicant(applicantId, status, page, limit) {
  return searchApplications({ applicantId, status, page, limit })
}

export async function getApplicationsByEmployer(employerId, status, page, limit) {
  return searchApplications({ employerId, status, page, limit })
}

// ─── Status Updates ────────────────────────────────────

export async function reviewApplication(applicationId, reviewerId, { status, reviewNotes }) {
  const databases = getDatabases()
  const application = await getApplicationById(applicationId)
  if (!application) throw Object.assign(new Error('Application not found'), { statusCode: 404 })

  const updates = {
    status: status || application.status,
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
  }
  if (reviewNotes !== undefined) updates.reviewNotes = reviewNotes

  const doc = await databases.updateDocument(DB_ID, APPLICATIONS_COLLECTION, applicationId, updates)
  logger.info(`Application reviewed`, { applicationId, status: updates.status, reviewerId })
  return new Application(formatDoc(doc))
}

export async function bulkUpdateStatus(applicationIds, status) {
  const databases = getDatabases()
  const results = []
  for (const id of applicationIds) {
    try {
      const doc = await databases.updateDocument(DB_ID, APPLICATIONS_COLLECTION, id, {
        status,
        updatedAt: new Date().toISOString(),
      })
      results.push(new Application(formatDoc(doc)))
    } catch (err) {
      logger.error(`Bulk update failed for ${id}`, { error: err.message })
    }
  }
  return results.map(a => a.toJSON())
}

// ─── Stats ──────────────────────────────────────────────

export async function getApplicationStats(employerId) {
  const { applications, total } = await searchApplications({ employerId, limit: 1 })
  const statusCounts = { pending: 0, reviewed: 0, accepted: 0, rejected: 0, withdrawn: 0 }

  // Get all applications for stats by paginating
  let allApps = applications
  if (total > 0) {
    const result = await searchApplications({ employerId, limit: Math.min(total, 100) })
    allApps = result.applications
  }

  for (const app of allApps) {
    if (statusCounts[app.status] !== undefined) statusCounts[app.status]++
  }

  return {
    total,
    ...statusCounts,
  }
}
