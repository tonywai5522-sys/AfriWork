import { ID, Query } from 'node-appwrite'
import { getDatabases, getClient } from '../lib/appwriteClient.js'
import { appConfig } from '../config/appConfig.js'
import { PortfolioProject } from '../models/PortfolioProject.js'
import { logger } from '../utils/logger.js'

const DB_ID = appConfig.appwrite.databaseId
const PORTFOLIO_COLLECTION = process.env.APPWRITE_PORTFOLIO_COLLECTION_ID || 'portfolio_projects'

function formatDoc(doc) {
  return {
    ...doc,
    id: doc.$id,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  }
}

export async function createProject(userId, data) {
  const databases = getDatabases()
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const projectData = {
    userId,
    title: data.title,
    slug,
    description: data.description || '',
    category: data.category || 'web_app',
    tags: data.tags || [],
    technologies: data.technologies || [],
    liveUrl: data.liveUrl || '',
    githubUrl: data.githubUrl || '',
    demoUrl: data.demoUrl || '',
    thumbnailUrl: data.thumbnailUrl || '',
    thumbnailId: data.thumbnailId || '',
    media: data.media || [],
    featuredImage: data.featuredImage || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    isOngoing: data.isOngoing || false,
    highlights: data.highlights || [],
    role: data.role || '',
    teamSize: data.teamSize || 1,
    outcome: data.outcome || '',
    visibility: data.visibility || 'public',
    status: data.status || 'published',
    viewCount: 0,
    featured: data.featured || false,
  }

  const doc = await databases.createDocument(DB_ID, PORTFOLIO_COLLECTION, ID.unique(), projectData)
  logger.info(`Portfolio project created`, { userId, projectId: doc.$id, title: data.title })
  return new PortfolioProject(formatDoc(doc))
}

export async function updateProject(projectId, data) {
  const databases = getDatabases()
  const updates = {}
  const allowed = ['title', 'slug', 'description', 'category', 'tags', 'technologies', 'liveUrl', 'githubUrl', 'demoUrl', 'thumbnailUrl', 'thumbnailId', 'media', 'featuredImage', 'startDate', 'endDate', 'isOngoing', 'highlights', 'role', 'teamSize', 'outcome', 'visibility', 'status', 'featured']

  for (const f of allowed) {
    if (data[f] !== undefined) updates[f] = data[f]
  }

  if (data.title && !data.slug) {
    updates.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const doc = await databases.updateDocument(DB_ID, PORTFOLIO_COLLECTION, projectId, updates)
  return new PortfolioProject(formatDoc(doc))
}

export async function getProjectById(projectId) {
  const databases = getDatabases()
  try {
    const doc = await databases.getDocument(DB_ID, PORTFOLIO_COLLECTION, projectId)
    return new PortfolioProject(formatDoc(doc))
  } catch {
    return null
  }
}

export async function deleteProject(projectId) {
  const databases = getDatabases()
  await databases.deleteDocument(DB_ID, PORTFOLIO_COLLECTION, projectId)
}

export async function searchProjects({
  userId,
  category,
  status,
  visibility,
  featured,
  query,
  tags,
  sortBy,
  sortOrder,
  page = 1,
  limit = 12,
}) {
  const databases = getDatabases()
  const queries = []
  const offset = (page - 1) * limit

  queries.push(Query.limit(limit))
  queries.push(Query.offset(offset))

  if (userId) queries.push(Query.equal('userId', [userId]))
  if (category) queries.push(Query.equal('category', [category]))
  if (status) queries.push(Query.equal('status', [status]))
  else queries.push(Query.equal('status', ['published'])) // default: only published
  if (visibility) queries.push(Query.equal('visibility', [visibility]))
  else queries.push(Query.equal('visibility', ['public'])) // default: only public
  if (featured !== undefined) queries.push(Query.equal('featured', [featured]))
  if (query) queries.push(Query.search('title', query))

  const sortField = sortBy === 'views' ? 'viewCount' : sortBy === 'title' ? 'title' : '$createdAt'
  queries.push(sortOrder === 'asc' ? Query.orderAsc(sortField) : Query.orderDesc(sortField))

  let docs
  try {
    docs = await databases.listDocuments(DB_ID, PORTFOLIO_COLLECTION, queries)
  } catch {
    docs = { documents: [], total: 0 }
  }

  let projects = docs.documents.map(d => new PortfolioProject(formatDoc(d)))

  // Filter by tags client-side
  if (tags?.length) {
    const tagFilter = tags.map(t => t.toLowerCase())
    projects = projects.filter(p =>
      (p.tags || []).some(t => tagFilter.includes(t.toLowerCase())) ||
      (p.technologies || []).some(t => tagFilter.includes(t.toLowerCase()))
    )
  }

  return {
    projects: projects.map(p => p.toJSON()),
    total: docs.total,
    page,
    limit,
  }
}

export async function getProjectsByUser(userId, status, page, limit) {
  return searchProjects({ userId, status, limit: limit || 20, page: page || 1 })
}

export async function incrementViewCount(projectId) {
  const project = await getProjectById(projectId)
  if (!project) return null
  const databases = getDatabases()
  const updated = await databases.updateDocument(DB_ID, PORTFOLIO_COLLECTION, projectId, {
    viewCount: (project.viewCount || 0) + 1,
  })
  return new PortfolioProject(formatDoc(updated))
}

export async function toggleFeatured(projectId) {
  const project = await getProjectById(projectId)
  if (!project) return null
  const databases = getDatabases()
  const updated = await databases.updateDocument(DB_ID, PORTFOLIO_COLLECTION, projectId, {
    featured: !project.featured,
  })
  return new PortfolioProject(formatDoc(updated))
}

export async function uploadProjectMedia(userId, file) {
  const { Storage } = await import('node-appwrite')
  const client = getClient()
  const storage = new Storage(client)
  const bucketId = process.env.APPWRITE_PORTFOLIO_BUCKET_ID || 'portfolio_media'

  const uploaded = await storage.createFile(bucketId, ID.unique(), file)
  const fileUrl = `${appConfig.appwrite.endpoint}/storage/buckets/${bucketId}/files/${uploaded.$id}/view?project=${appConfig.appwrite.projectId}`

  const mediaItem = {
    id: uploaded.$id,
    url: fileUrl,
    type: file.mimetype?.startsWith('image/') ? 'image' : 'file',
    name: file.originalname || uploaded.$id,
    size: file.size || 0,
    createdAt: new Date().toISOString(),
  }

  return mediaItem
}

export async function deleteProjectMedia(fileId) {
  const { Storage } = await import('node-appwrite')
  const client = getClient()
  const storage = new Storage(client)
  const bucketId = process.env.APPWRITE_PORTFOLIO_BUCKET_ID || 'portfolio_media'

  try {
    await storage.deleteFile(bucketId, fileId)
    return true
  } catch {
    return false
  }
}
