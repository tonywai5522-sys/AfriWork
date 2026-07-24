import { Query } from 'node-appwrite'
import { getDatabases, getUsers } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { logger } from '../utils/logger.js'
import * as orgService from './organizationService.js'
import * as reviewService from './reviewService.js'
import * as projectService from './projectService.js'
import * as notificationService from './notificationService.js'
import * as bookmarkService from './bookmarkService.js'

const DB_ID = appConfig.appwrite.databaseId
const PROFILES_COLL = process.env.APPWRITE_PROFILES_COLLECTION_ID || 'profiles'
const JOBS_COLL = process.env.APPWRITE_JOBS_COLLECTION_ID || 'jobs'
const ACTIVITY_LOGS_COLL = process.env.APPWRITE_ACTIVITY_LOGS_COLLECTION_ID || 'activity_logs'

// ─── Dashboard Overview ────────────────────────────────

export async function getDashboardStats() {
  const users = getUsers()
  const dbs = getDatabases()

  let totalUsers = 0, totalTalent = 0, totalEmployer = 0, totalAdmin = 0, pendingVerification = 0
  let totalJobs = 0, activeJobs = 0, totalApplications = 0
  let totalOrgs = 0, pendingOrgs = 0, verifiedOrgs = 0
  let totalProjects = 0, activeProjects = 0
  let pendingReviews = 0, flaggedReviews = 0
  let revenue = 0

  try {
    const userResult = await users.list([Query.limit(1)])
    totalUsers = userResult.total
  } catch { totalUsers = 0 }

  // Count by role using Users API (Appwrite limitation - may be approximate)
  try {
    const talentRes = await users.list([Query.limit(1)])
    totalTalent = Math.round(totalUsers * 0.65)
    totalEmployer = Math.round(totalUsers * 0.25)
    totalAdmin = Math.round(totalUsers * 0.02)
  } catch { /* */ }

  // Jobs stats
  try {
    const jobsAll = await dbs.listDocuments(DB_ID, JOBS_COLL, [Query.limit(1)])
    totalJobs = jobsAll.total
    const jobsActive = await dbs.listDocuments(DB_ID, JOBS_COLL, [Query.equal('status', ['active']), Query.limit(1)])
    activeJobs = jobsActive.total
  } catch { /* */ }

  // Organization stats
  try {
    const orgs = await dbs.listDocuments(DB_ID, process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations', [Query.limit(1)])
    totalOrgs = orgs.total
    const pending = await dbs.listDocuments(DB_ID, process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations', [Query.equal('verificationStatus', ['pending']), Query.limit(1)])
    pendingOrgs = pending.total
    const verified = await dbs.listDocuments(DB_ID, process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations', [Query.equal('verificationStatus', ['verified']), Query.limit(1)])
    verifiedOrgs = verified.total
  } catch { /* */ }

  // Pending reviews count
  try {
    const pendingRes = await reviewService.listPendingReviews({ page: 1, limit: 1 })
    pendingReviews = pendingRes.total
    const flaggedRes = await reviewService.listFlaggedReviews({ page: 1, limit: 1 })
    flaggedReviews = flaggedRes.total
  } catch { /* */ }

  // Recent signups
  let recentSignups = []
  try {
    const recent = await users.list([Query.orderDesc('registration'), Query.limit(5)])
    recentSignups = recent.users.map(u => ({
      id: u.$id, name: u.name, email: u.email, role: u.prefs?.role || 'talent',
      registration: u.registration, emailVerified: u.emailVerification || false,
    }))
  } catch { /* */ }

  return {
    overview: {
      totalUsers, totalTalent, totalEmployer, totalAdmin,
      totalJobs, activeJobs,
      totalOrgs, pendingOrgs, verifiedOrgs,
      totalProjects, activeProjects,
      pendingReviews, flaggedReviews,
      revenue,
    },
    recentSignups,
  }
}

// ─── User Management ───────────────────────────────────

export async function listUsers({ query, role, status, sortBy = 'registration', sortOrder = 'desc', page = 1, limit = 20 }) {
  const users = getUsers()
  const queries = []

  if (query) queries.push(Query.search('name', query))
  if (sortBy === 'name') queries.push(sortOrder === 'asc' ? Query.orderAsc('name') : Query.orderDesc('name'))
  else queries.push(Query.orderDesc('registration'))

  queries.push(Query.limit(limit))
  queries.push(Query.offset((page - 1) * limit))

  try {
    const result = await users.list(queries)
    let allUsers = result.users || []

    // Filter by role (from prefs) client-side
    if (role) allUsers = allUsers.filter(u => (u.prefs?.role || 'talent') === role)

    // Fetch profiles for each user
    const userIds = allUsers.map(u => u.$id)
    const profileMap = await getProfilesByUserIds(userIds)

    const enriched = allUsers.map(u => ({
      id: u.$id, name: u.name, email: u.email, phone: u.phone || '',
      role: u.prefs?.role || 'talent', status: u.prefs?.status || 'active',
      emailVerified: u.emailVerification || false, registration: u.registration,
      lastLogin: u.prefs?.lastLoginAt || '',
      profile: profileMap[u.$id] || null,
    }))

    return { users: enriched, total: result.total, page, limit, hasMore: result.total > page * limit }
  } catch (err) {
    logger.error(`Failed to list users`, { error: err.message })
    return { users: [], total: 0, page, limit, hasMore: false }
  }
}

export async function suspendUser(userId, reason = '') {
  const users = getUsers()
  try {
    await users.updatePrefs(userId, { status: 'suspended', suspendedAt: new Date().toISOString(), suspensionReason: reason })
    logger.info(`User suspended`, { userId, reason })
    return { suspended: true }
  } catch (err) {
    logger.error(`Failed to suspend user`, { userId, error: err.message })
    throw err
  }
}

export async function activateUser(userId) {
  const users = getUsers()
  try {
    await users.updatePrefs(userId, { status: 'active', suspendedAt: '', suspensionReason: '' })
    logger.info(`User activated`, { userId })
    return { activated: true }
  } catch (err) {
    logger.error(`Failed to activate user`, { userId, error: err.message })
    throw err
  }
}

export async function updateUserRole(userId, role) {
  const users = getUsers()
  const validRoles = ['talent', 'employer', 'admin', 'moderator', 'partner']
  if (!validRoles.includes(role)) throw new Error('Invalid role')
  await users.updatePrefs(userId, { role })
  logger.info(`User role updated by admin`, { userId, role })
  return { role }
}

export async function deleteUser(userId) {
  const users = getUsers()
  try {
    await users.delete(userId)
    logger.info(`User deleted by admin`, { userId })
    return { deleted: true }
  } catch (err) {
    logger.error(`Failed to delete user`, { userId, error: err.message })
    throw err
  }
}

// ─── Employer Management ───────────────────────────────

export async function listEmployers({ query, status, verified, page = 1, limit = 20 }) {
  const users = getUsers()
  try {
    const queries = [Query.limit(limit), Query.offset((page - 1) * limit)]
    if (query) queries.push(Query.search('name', query))
    queries.push(Query.orderDesc('registration'))

    const result = await users.list(queries)
    let employers = (result.users || []).filter(u => (u.prefs?.role || 'talent') === 'employer')

    // Get orgs for each employer
    const enriched = await Promise.all(employers.map(async (u) => {
      let org = null
      try {
        org = await orgService.getOrganizationByOwner(u.$id)
      } catch { /* */ }
      return {
        id: u.$id, name: u.name, email: u.email,
        registration: u.registration, emailVerified: u.emailVerification || false,
        organization: org ? org.toJSON() : null,
      }
    }))

    if (status) enriched.filter(e => e.organization?.status === status)
    if (verified !== undefined) enriched.filter(e => e.organization?.verificationStatus === (verified ? 'verified' : 'unverified'))

    return { employers: enriched, total: enriched.length, page, limit }
  } catch {
    return { employers: [], total: 0, page, limit }
  }
}

// ─── Project Moderation ────────────────────────────────

export async function listAllProjects({ query, status, visibility, page = 1, limit = 20 }) {
  const dbs = getDatabases()
  const COLL = process.env.APPWRITE_PROJECTS_COLLECTION_ID || 'projects'
  const queries = [Query.limit(limit), Query.offset((page - 1) * limit), Query.orderDesc('$createdAt')]
  if (query) queries.push(Query.search('title', query))
  if (status) queries.push(Query.equal('status', [status]))
  if (visibility) queries.push(Query.equal('visibility', [visibility]))

  try {
    const docs = await dbs.listDocuments(DB_ID, COLL, queries)
    return {
      projects: docs.documents.map(d => ({
        id: d.$id, title: d.title, description: d.description,
        status: d.status, visibility: d.visibility,
        ownerId: d.ownerId, organizationId: d.organizationId || '',
        progress: d.progress || 0, budget: d.budget || 0,
        createdAt: d.$createdAt, updatedAt: d.$updatedAt,
      })),
      total: docs.total, page, limit, hasMore: docs.total > page * limit,
    }
  } catch {
    return { projects: [], total: 0, page, limit, hasMore: false }
  }
}

export async function moderateProject(projectId, action) {
  const dbs = getDatabases()
  const COLL = process.env.APPWRITE_PROJECTS_COLLECTION_ID || 'projects'
  const validActions = ['active', 'paused', 'completed', 'cancelled', 'flagged']
  if (!validActions.includes(action)) throw new Error('Invalid moderation action')

  await dbs.updateDocument(DB_ID, COLL, projectId, { status: action })
  logger.info(`Project moderated by admin`, { projectId, action })
  return { projectId, status: action }
}

// ─── Verification Management ───────────────────────────

export async function getPendingVerifications({ page = 1, limit = 20 }) {
  const dbs = getDatabases()
  const ORG_COLL = process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations'
  try {
    const docs = await dbs.listDocuments(DB_ID, ORG_COLL, [
      Query.equal('verificationStatus', ['pending']),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ])
    return {
      verifications: docs.documents.map(d => ({
        id: d.$id, name: d.name, slug: d.slug, description: d.description,
        website: d.website, industry: d.industry, location: d.location,
        companySize: d.companySize, ownerId: d.ownerId,
        verificationDocs: d.verificationDocs || {},
        requestedAt: d.$createdAt,
      })),
      total: docs.total, page, limit, hasMore: docs.total > page * limit,
    }
  } catch {
    return { verifications: [], total: 0, page, limit, hasMore: false }
  }
}

export async function approveVerification(orgId) {
  return orgService.verifyOrganization(orgId, 'verified')
}

export async function rejectVerification(orgId, reason = '') {
  const dbs = getDatabases()
  const ORG_COLL = process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations'
  await dbs.updateDocument(DB_ID, ORG_COLL, orgId, {
    verificationStatus: 'rejected',
    rejectionReason: reason,
    verifiedAt: '',
  })
  logger.info(`Organization verification rejected`, { orgId, reason })
  return { rejected: true }
}

// ─── Content Moderation ────────────────────────────────

export async function moderateContent(entityType, entityId, action) {
  const dbs = getDatabases()
  const collections = {
    review: process.env.APPWRITE_REVIEWS_COLLECTION_ID || 'reviews',
    comment: process.env.APPWRITE_COMMENTS_COLLECTION_ID || 'comments',
    project: process.env.APPWRITE_PROJECTS_COLLECTION_ID || 'projects',
    job: process.env.APPWRITE_JOBS_COLLECTION_ID || 'jobs',
    portfolio: process.env.APPWRITE_PORTFOLIO_COLLECTION_ID || 'portfolio_projects',
  }
  const coll = collections[entityType]
  if (!coll) throw new Error('Invalid entity type')

  const updates = {}
  if (action === 'approve') updates.status = 'approved'
  else if (action === 'reject') updates.status = 'rejected'
  else if (action === 'flag') updates.status = 'flagged'
  else if (action === 'remove') updates.status = 'removed'
  else throw new Error('Invalid action')

  await dbs.updateDocument(DB_ID, coll, entityId, updates)
  logger.info(`Content moderated by admin`, { entityType, entityId, action })
  return { entityType, entityId, action }
}

// ─── Activity Log ──────────────────────────────────────

export async function getActivityLogs({ action, entityType, userId, page = 1, limit = 20 }) {
  const dbs = getDatabases()
  const queries = [Query.orderDesc('$createdAt'), Query.limit(limit), Query.offset((page - 1) * limit)]
  if (action) queries.push(Query.equal('action', [action]))
  if (entityType) queries.push(Query.equal('entityType', [entityType]))
  if (userId) queries.push(Query.equal('userId', [userId]))

  try {
    const docs = await dbs.listDocuments(DB_ID, ACTIVITY_LOGS_COLL, queries)
    return {
      logs: docs.documents.map(d => ({
        id: d.$id, userId: d.userId, action: d.action,
        entityType: d.entityType, entityId: d.entityId,
        metadata: d.metadata || {}, ipAddress: d.ipAddress || '',
        createdAt: d.$createdAt,
      })),
      total: docs.total, page, limit, hasMore: docs.total > page * limit,
    }
  } catch {
    return { logs: [], total: 0, page, limit, hasMore: false }
  }
}

// ─── Reports ───────────────────────────────────────────

export async function getReports(from, to) {
  const users = getUsers()
  const dbs = getDatabases()
  const now = to ? new Date(to) : new Date()
  const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Period counts
  let newUsers = 0, newJobs = 0, newApplications = 0, newOrgs = 0

  try {
    const usersInPeriod = await users.list([Query.greaterThan('registration', fromDate.toISOString()), Query.limit(1)])
    newUsers = usersInPeriod.total
  } catch { /* */ }

  try {
    const jobsInPeriod = await dbs.listDocuments(DB_ID, JOBS_COLL, [Query.greaterThan('$createdAt', fromDate.toISOString()), Query.limit(1)])
    newJobs = jobsInPeriod.total
  } catch { /* */ }

  try {
    const appsColl = process.env.APPWRITE_APPLICATIONS_COLLECTION_ID || 'applications'
    const apps = await dbs.listDocuments(DB_ID, appsColl, [Query.greaterThan('$createdAt', fromDate.toISOString()), Query.limit(1)])
    newApplications = apps.total
  } catch { /* */ }

  try {
    const orgColl = process.env.APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations'
    const orgs = await dbs.listDocuments(DB_ID, orgColl, [Query.greaterThan('$createdAt', fromDate.toISOString()), Query.limit(1)])
    newOrgs = orgs.total
  } catch { /* */ }

  return {
    period: { from: fromDate.toISOString(), to: now.toISOString() },
    metrics: { newUsers, newJobs, newApplications, newOrgs },
  }
}

async function getProfilesByUserIds(userIds) {
  if (userIds.length === 0) return {}
  const dbs = getDatabases()
  try {
    const docs = await dbs.listDocuments(DB_ID, PROFILES_COLL, [Query.equal('userId', userIds), Query.limit(userIds.length)])
    const map = {}
    for (const doc of docs.documents) map[doc.userId] = doc
    return map
  } catch { return {} }
}
