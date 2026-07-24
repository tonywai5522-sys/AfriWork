import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Job } from '../models/Job.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const JOBS_COLLECTION = process.env.APPWRITE_JOBS_COLLECTION_ID || 'jobs'
const BOOKMARKS_COLLECTION = process.env.APPWRITE_BOOKMARKS_COLLECTION_ID || 'bookmarks'

export async function createJob(employerId, data) {
  const databases = getDatabases()
  const jobData = {
    title: data.title, description: data.description,
    responsibilities: data.responsibilities || '', requirements: data.requirements || '',
    employerId, companyId: data.companyId || '', companyName: data.companyName || '',
    companyLogo: data.companyLogo || '', location: data.location || '',
    remote: data.remote || false, jobType: data.jobType || 'full_time',
    category: data.category || '', experienceLevel: data.experienceLevel || 'mid',
    skills: data.skills || [], salaryMin: data.salaryMin || 0, salaryMax: data.salaryMax || 0,
    currency: data.currency || 'USD', applicationUrl: data.applicationUrl || '',
    applicationEmail: data.applicationEmail || '', deadline: data.deadline || '',
    status: data.status || 'draft', isFeatured: false, viewCount: 0, applicationCount: 0,
  }
  const doc = await databases.createDocument(DB_ID, JOBS_COLLECTION, ID.unique(), jobData)
  logger.info(`Job created`, { jobId: doc.$id, title: data.title, employerId })
  return new Job(doc)
}

export async function updateJob(jobId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowed = ['title', 'description', 'responsibilities', 'requirements', 'location', 'remote', 'jobType', 'category', 'experienceLevel', 'skills', 'salaryMin', 'salaryMax', 'currency', 'applicationUrl', 'applicationEmail', 'deadline', 'status', 'isFeatured', 'companyName', 'companyLogo']
  for (const f of allowed) { if (data[f] !== undefined) updates[f] = data[f] }
  const doc = await databases.updateDocument(DB_ID, JOBS_COLLECTION, jobId, updates)
  return new Job(doc)
}

export async function getJobById(jobId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, JOBS_COLLECTION, jobId)
    return new Job(doc)
  } catch { return null }
}

export async function searchJobs({ query, location, remote, jobType, category, experienceLevel, skills, salaryMin, salaryMax, status, featured, employerId, sortBy, sortOrder, page = 1, limit = 12 }) {
  const databases = getDatabases()
  const queries = []
  const offset = (page - 1) * limit

  queries.push(Query.limit(limit))
  queries.push(Query.offset(offset))

  if (query) queries.push(Query.search('title', query))
  if (location) queries.push(Query.search('location', location))
  if (remote !== undefined) queries.push(Query.equal('remote', [remote]))
  if (jobType) queries.push(Query.equal('jobType', [jobType]))
  if (category) queries.push(Query.equal('category', [category]))
  if (experienceLevel) queries.push(Query.equal('experienceLevel', [experienceLevel]))
  if (status) queries.push(Query.equal('status', [status]))
  else queries.push(Query.equal('status', ['active'])) // default: only active
  if (employerId) queries.push(Query.equal('employerId', [employerId]))
  if (featured) queries.push(Query.equal('isFeatured', [true]))

  const sortField = sortBy === 'salary' ? 'salaryMax' : sortBy === 'deadline' ? 'deadline' : '$createdAt'
  queries.push(sortOrder === 'asc' ? Query.orderAsc(sortField) : Query.orderDesc(sortField))

  let docs
  try {
    docs = await databases.listDocuments(DB_ID, JOBS_COLLECTION, queries)
  } catch {
    docs = { documents: [], total: 0 }
  }

  let jobs = docs.documents.map(d => new Job(d))

  // Filter by skills client-side if needed
  if (skills?.length) {
    const skillFilter = skills.map(s => s.toLowerCase())
    jobs = jobs.filter(j => (j.skills || []).some(s => skillFilter.includes(s.toLowerCase())))
  }

  // Filter by salary range client-side
  if (salaryMin || salaryMax) {
    jobs = jobs.filter(j => {
      if (salaryMin && (j.salaryMax || j.salaryMin) < salaryMin) return false
      if (salaryMax && (j.salaryMin || j.salaryMax) > salaryMax) return false
      return true
    })
  }

  return { jobs: jobs.map(j => j.toJSON()), total: docs.total, page, limit }
}

export async function incrementViewCount(jobId) {
  const databases = getDatabases()
  const job = await getJobById(jobId)
  if (!job) return null
  const updated = await databases.updateDocument(DB_ID, JOBS_COLLECTION, jobId, { viewCount: (job.viewCount || 0) + 1 })
  return new Job(updated)
}

export async function getEmployerJobs(employerId) {
  return searchJobs({ employerId, status: undefined, limit: 50 })
}

export async function bookmarkJob(userId, jobId) {
  const databases = getDatabases()
  try {
    const existing = await databases.listDocuments(DB_ID, BOOKMARKS_COLLECTION, [Query.equal('userId', [userId]), Query.equal('jobId', [jobId]), Query.limit(1)])
    if (existing.documents.length > 0) return { bookmarked: true, message: 'Already bookmarked' }
    await databases.createDocument(DB_ID, BOOKMARKS_COLLECTION, ID.unique(), { userId, jobId, createdAt: new Date().toISOString() })
    return { bookmarked: true }
  } catch { return { bookmarked: false } }
}

export async function unbookmarkJob(userId, jobId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, BOOKMARKS_COLLECTION, [Query.equal('userId', [userId]), Query.equal('jobId', [jobId]), Query.limit(1)])
    if (docs.documents.length > 0) await databases.deleteDocument(DB_ID, BOOKMARKS_COLLECTION, docs.documents[0].$id)
    return { bookmarked: false }
  } catch { return { bookmarked: false } }
}

export async function getBookmarkedJobIds(userId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, BOOKMARKS_COLLECTION, [Query.equal('userId', [userId]), Query.limit(100)])
    return docs.documents.map(d => d.jobId)
  } catch { return [] }
}

export async function getFeaturedJobs(limit = 6) {
  return searchJobs({ featured: true, limit })
}
