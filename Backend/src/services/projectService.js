import { ID, Query } from 'node-appwrite'
import { getDatabases } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { Project } from '../models/Project.js'
import { logger } from '../utils/logger.js'
import { createDefaultLists } from './taskListService.js'

const DB_ID = appConfig.appwrite.databaseId
const COLLECTION = process.env.APPWRITE_PROJECTS_COLLECTION_ID || 'projects'

export async function getProjectById(projectId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, COLLECTION, projectId)
    return new Project(doc)
  } catch { return null }
}

export async function createProject(userId, data) {
  const databases = getDatabases()
  const now = new Date().toISOString()
  const projectData = {
    title: data.title,
    description: data.description || '',
    status: 'draft',
    visibility: data.visibility || 'private',
    ownerId: userId,
    organizationId: data.organizationId || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    budget: data.budget || 0,
    currency: data.currency || 'USD',
    progress: 0,
    members: JSON.stringify([
      {
        userId,
        role: 'owner',
        name: data.ownerName || '',
        email: data.ownerEmail || '',
        joinedAt: now,
      },
    ]),
    categories: data.categories ? JSON.stringify(data.categories) : '[]',
    tags: data.tags ? JSON.stringify(data.tags) : '[]',
    status: 'active',
    createdBy: userId,
  }

  const doc = await databases.createDocument(DB_ID, COLLECTION, ID.unique(), projectData)
  logger.info(`Project created`, { projectId: doc.$id, title: data.title, ownerId: userId })

  // Auto-create default task lists
  try {
    await createDefaultLists(doc.$id, userId)
  } catch (error) {
    logger.warn(`Failed to create default task lists`, { projectId: doc.$id, error: error.message })
  }

  return new Project({ ...doc, members: JSON.parse(doc.members || '[]'), categories: JSON.parse(doc.categories || '[]'), tags: JSON.parse(doc.tags || '[]') })
}

export async function updateProject(projectId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowedFields = ['title', 'description', 'status', 'visibility', 'startDate', 'endDate', 'budget', 'currency', 'progress', 'organizationId']
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field]
  }
  if (data.members) updates.members = JSON.stringify(data.members)
  if (data.categories) updates.categories = JSON.stringify(data.categories)
  if (data.tags) updates.tags = JSON.stringify(data.tags)

  const doc = await databases.updateDocument(DB_ID, COLLECTION, projectId, updates)
  logger.info(`Project updated`, { projectId })
  return new Project({ ...doc, members: JSON.parse(doc.members || '[]'), categories: JSON.parse(doc.categories || '[]'), tags: JSON.parse(doc.tags || '[]') })
}

export async function deleteProject(projectId) {
  const databases = getDatabases()
  await databases.deleteDocument(DB_ID, COLLECTION, projectId)
  logger.info(`Project deleted`, { projectId })
  return { deleted: true }
}

export async function getUserProjects(userId) {
  const databases = getDatabases()
  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ])

    const projects = docs.documents
      .map(d => new Project({ ...d, members: JSON.parse(d.members || '[]'), categories: JSON.parse(d.categories || '[]'), tags: JSON.parse(d.tags || '[]') }))
      .filter(p => p.isOwner(userId) || p.getMember(userId))
    return projects
  } catch {
    return []
  }
}

export async function listProjects(options = {}) {
  const { page = 1, limit = 20, status, organizationId, visibility = 'public' } = options
  const databases = getDatabases()
  const queries = [
    Query.limit(limit),
    Query.offset((page - 1) * limit),
    Query.orderDesc('$createdAt'),
  ]

  if (status) queries.push(Query.equal('status', [status]))
  if (organizationId) queries.push(Query.equal('organizationId', [organizationId]))
  if (visibility) queries.push(Query.equal('visibility', [visibility]))

  try {
    const docs = await databases.listDocuments(DB_ID, COLLECTION, queries)
    return {
      projects: docs.documents.map(d => new Project({ ...d, members: JSON.parse(d.members || '[]'), categories: JSON.parse(d.categories || '[]'), tags: JSON.parse(d.tags || '[]') })),
      total: docs.total,
      page, limit,
    }
  } catch {
    return { projects: [], total: 0, page, limit }
  }
}

export async function addProjectMember(projectId, memberData) {
  const databases = getDatabases()
  const project = await getProjectById(projectId)
  if (!project) throw new Error('Project not found')

  const members = [...project.members]
  const exists = members.find(m => m.userId === memberData.userId || m.email === memberData.email)
  if (exists) throw new Error('Member already in this project')

  const newMember = {
    ...memberData,
    userId: memberData.userId || '',
    role: memberData.role || 'member',
    name: memberData.name || '',
    email: memberData.email || '',
    joinedAt: new Date().toISOString(),
  }

  members.push(newMember)
  await databases.updateDocument(DB_ID, COLLECTION, projectId, { members: JSON.stringify(members) })
  logger.info(`Project member added`, { projectId, email: memberData.email, role: memberData.role })
  return newMember
}

export async function updateProjectMember(projectId, memberId, updates) {
  const databases = getDatabases()
  const project = await getProjectById(projectId)
  if (!project) throw new Error('Project not found')

  const members = project.members.map(m =>
    (m.userId === memberId || m.email === memberId) ? { ...m, ...updates } : m
  )
  await databases.updateDocument(DB_ID, COLLECTION, projectId, { members: JSON.stringify(members) })
  return { updated: true }
}

export async function removeProjectMember(projectId, memberId) {
  const databases = getDatabases()
  const project = await getProjectById(projectId)
  if (!project) throw new Error('Project not found')

  const members = project.members.filter(m => m.userId !== memberId && m.email !== memberId)
  await databases.updateDocument(DB_ID, COLLECTION, projectId, { members: JSON.stringify(members) })
  logger.info(`Project member removed`, { projectId, memberId })
  return { removed: true }
}

export async function updateProjectProgress(projectId) {
  const databases = getDatabases()
  try {
    const TASKS_COLLECTION = process.env.APPWRITE_TASKS_COLLECTION_ID || 'tasks'
    const docs = await databases.listDocuments(DB_ID, TASKS_COLLECTION, [
      Query.equal('projectId', [projectId]),
      Query.limit(100),
    ])

    const tasks = docs.documents
    if (tasks.length === 0) {
      await databases.updateDocument(DB_ID, COLLECTION, projectId, { progress: 0 })
      return 0
    }

    const doneCount = tasks.filter(t => t.status === 'done').length
    const progress = Math.round((doneCount / tasks.length) * 100)
    await databases.updateDocument(DB_ID, COLLECTION, projectId, { progress })
    return progress
  } catch {
    return 0
  }
}
