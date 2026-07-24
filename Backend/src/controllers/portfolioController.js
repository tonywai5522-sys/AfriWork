import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import { logger } from '../utils/logger.js'
import { validatePortfolioProjectPayload } from '../validators/portfolioValidator.js'
import * as portfolioService from '../services/portfolioService.js'
import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPEG, PNG, GIF, WebP, and PDF files are allowed'), false)
  },
})

export { upload }

export async function createProject(req, res) {
  try {
    const validation = validatePortfolioProjectPayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)
    const project = await portfolioService.createProject(req.user.id, req.body)
    return sendSuccess(res, { project: project.toJSON() }, 'Project created')
  } catch (error) {
    return sendError(res, error.message || 'Failed to create project', 400)
  }
}

export async function updateProject(req, res) {
  try {
    const validation = validatePortfolioProjectPayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    const project = await portfolioService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403)
    }

    const updated = await portfolioService.updateProject(req.params.projectId, req.body)
    return sendSuccess(res, { project: updated.toJSON() }, 'Project updated')
  } catch (error) {
    return sendError(res, error.message || 'Failed to update project', 400)
  }
}

export async function getProject(req, res) {
  try {
    const project = await portfolioService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)

    // Only return if public or the owner
    if (project.visibility !== 'public' && project.userId !== req.user?.id && req.user?.role !== 'admin') {
      return sendError(res, 'Project not found', 404)
    }

    return sendSuccess(res, { project: project.toJSON() }, 'Project retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve project', 400)
  }
}

export async function deleteProject(req, res) {
  try {
    const project = await portfolioService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403)
    }
    await portfolioService.deleteProject(req.params.projectId)
    return sendSuccess(res, null, 'Project deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete project', 400)
  }
}

export async function listMyProjects(req, res) {
  try {
    const { category, status, page, limit } = req.query
    const result = await portfolioService.getProjectsByUser(
      req.user.id,
      status || undefined,
      parseInt(page) || 1,
      Math.min(50, parseInt(limit) || 20)
    )
    return sendSuccess(res, result, 'Projects retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve projects', 400)
  }
}

export async function searchProjects(req, res) {
  try {
    const { userId, category, query, tags, sortBy, sortOrder, page, limit } = req.query
    const result = await portfolioService.searchProjects({
      userId: userId || undefined,
      category: category || undefined,
      query: query || undefined,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined,
      sortBy, sortOrder,
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 12),
    })
    return sendSuccess(res, result, 'Projects retrieved')
  } catch (error) {
    return sendError(res, 'Failed to search projects', 400)
  }
}

export async function incrementView(req, res) {
  try {
    const project = await portfolioService.incrementViewCount(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    return sendSuccess(res, { project: project.toJSON() }, 'View counted')
  } catch (error) {
    return sendError(res, 'Failed to increment view', 400)
  }
}

export async function uploadMedia(req, res) {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400)
    const media = await portfolioService.uploadProjectMedia(req.user.id, req.file)
    return sendSuccess(res, media, 'Media uploaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to upload media', 400)
  }
}

export async function deleteMedia(req, res) {
  try {
    const { fileId } = req.params
    if (!fileId) return sendError(res, 'fileId is required', 400)
    await portfolioService.deleteProjectMedia(fileId)
    return sendSuccess(res, null, 'Media deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete media', 400)
  }
}
