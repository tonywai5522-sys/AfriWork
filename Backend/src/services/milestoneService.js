import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Milestone } from '../models/Milestone.js'
import { logger } from '../utils/logger.js'
import { createActivityEntry } from './activityFeedService.js'
import { getTasksByMilestone } from './taskService.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION = process.env.APPWRITE_MILESTONES_COLLECTION_ID || 'milestones'

export async function getMilestoneById(milestoneId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, COLLECTION, milestoneId)
    return new Milestone(doc)
  } catch { return null }
}

export async function createMilestone(userId, data) {
  const databases = getDatabases()
  const milestoneData = {
    projectId: data.projectId,
    title: data.title,
    description: data.description || '',
    dueDate: data.dueDate || '',
    completedAt: '',
    status: data.status || 'pending',
    progress: 0,
    budget: data.budget || 0,
    currency: data.currency || 'USD',
    completedBy: '',
    createdBy: userId,
  }

  const doc = await databases.createDocument(DB_ID, COLLECTION, ID.unique(), milestoneData)
  logger.info(`Milestone created`, { milestoneId: doc.$id, title: data.title, projectId: data.projectId })

  // Create activity feed entry
  try {
    await createActivityEntry(data.projectId, userId, 'milestone_created', {
      entityType: 'milestone',
      entityId: doc.$id,
      description: `Created milestone "${data.title}"`,
      metadata: { dueDate: data.dueDate },
    })
  } catch { /* non-critical */ }

  return new Milestone(doc)
}

export async function updateMilestone(milestoneId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowedFields = ['title', 'description', 'dueDate', 'status', 'progress', 'budget', 'currency']
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field]
  }

  // If marking as completed, set completedAt and completedBy
  if (data.status === 'completed') {
    updates.completedAt = new Date().toISOString()
    updates.completedBy = data.completedBy || data.updatedBy || ''
    updates.progress = 100
  }

  // If reopening from completed
  if (data.status && data.status !== 'completed' && data.status !== undefined) {
    updates.completedAt = ''
    updates.completedBy = ''
  }

  const doc = await databases.updateDocument(DB_ID, COLLECTION, milestoneId, updates)
  logger.info(`Milestone updated`, { milestoneId, status: data.status })

  // Activity feed for status changes
  if (data.status) {
    try {
      await createActivityEntry(doc.projectId, data.updatedBy || '', `milestone_${data.status}`, {
        entityType: 'milestone',
        entityId: milestoneId,
        description: `Milestone "${doc.title}" ${data.status === 'completed' ? 'completed' : data.status}`,
      })
    } catch { /* non-critical */ }
  }

  return new Milestone(doc)
}

export async function deleteMilestone(milestoneId) {
  const databases = getDatabases()
  await databases.deleteDocument(DB_ID, COLLECTION, milestoneId)
  logger.info(`Milestone deleted`, { milestoneId })
  return { deleted: true }
}

export async function getProjectMilestones(projectId, options = {}) {
  const { page = 1, limit = 20, status } = options
  const databases = getDatabases()
  const queries = [
    Query.equal('projectId', [projectId]),
    Query.limit(limit),
    Query.offset((page - 1) * limit),
  ]

  if (status) queries.push(Query.equal('status', [status]))

  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, queries)
    return {
      milestones: docs.documents.map(d => new Milestone(d)),
      total: docs.total,
      page, limit,
    }
  } catch {
    return { milestones: [], total: 0, page, limit }
  }
}

export async function updateMilestoneProgress(milestoneId) {
  try {
    const tasks = await getTasksByMilestone(milestoneId)
    if (tasks.length === 0) return 0

    const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0)
    const avgProgress = Math.round(totalProgress / tasks.length)

    const databases = getDatabases()
    await databases.updateDocument(DB_ID, COLLECTION, milestoneId, { progress: avgProgress })
    return avgProgress
  } catch {
    return 0
  }
}
