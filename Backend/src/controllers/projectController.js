import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import { logger } from '../utils/logger.js'
import {
  validateProjectCreatePayload,
  validateProjectUpdatePayload,
  validateProjectMemberInvitePayload,
} from '../validators/projectValidator.js'
import * as projectService from '../services/projectService.js'

export async function getMyProjects(req, res) {
  try {
    const projects = await projectService.getUserProjects(req.user.id)
    return sendSuccess(res, { projects: projects.map(p => p.toJSON()) }, 'Projects retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve projects', 400)
  }
}

export async function createProject(req, res) {
  try {
    const validation = validateProjectCreatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const project = await projectService.createProject(req.user.id, {
      ...req.body,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
    })
    return sendSuccess(res, { project: project.toJSON() }, 'Project created')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to create project', 400)
  }
}

export async function getProjectById(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    return sendSuccess(res, { project: project.toJSON() }, 'Project retrieved')
  } catch (error) {
    return sendError(res, 'Project not found', 404)
  }
}

export async function updateProject(req, res) {
  try {
    const validation = validateProjectUpdatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const project = await projectService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    if (!project.isOwner(req.user.id) && project.getMember(req.user.id)?.role !== 'admin') {
      return sendError(res, 'You do not have permission to edit this project', 403)
    }

    const updated = await projectService.updateProject(req.params.projectId, req.body)
    return sendSuccess(res, { project: updated.toJSON() }, 'Project updated')
  } catch (error) {
    return sendError(res, 'Failed to update project', 400)
  }
}

export async function deleteProject(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    if (!project.isOwner(req.user.id)) return sendError(res, 'Only the owner can delete the project', 403)

    await projectService.deleteProject(req.params.projectId)
    return sendSuccess(res, null, 'Project deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete project', 400)
  }
}

export async function listProjects(req, res) {
  try {
    const { page, limit, status, organizationId } = req.query
    const result = await projectService.listProjects({
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 20),
      status,
      organizationId,
    })
    return sendSuccess(res, { projects: result.projects.map(p => p.toJSON()), total: result.total, page: result.page, limit: result.limit }, 'Projects listed')
  } catch (error) {
    return sendError(res, 'Failed to list projects', 400)
  }
}

export async function addMember(req, res) {
  try {
    const validation = validateProjectMemberInvitePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const project = await projectService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    if (!project.isOwner(req.user.id) && project.getMember(req.user.id)?.role !== 'admin') {
      return sendError(res, 'You do not have permission to manage members', 403)
    }

    const member = await projectService.addProjectMember(req.params.projectId, req.body)
    return sendSuccess(res, { member }, 'Member added')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to add member', 400)
  }
}

export async function updateMember(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    if (!project.isOwner(req.user.id) && project.getMember(req.user.id)?.role !== 'admin') {
      return sendError(res, 'Permission denied', 403)
    }

    await projectService.updateProjectMember(req.params.projectId, req.params.memberId, req.body)
    return sendSuccess(res, null, 'Member updated')
  } catch (error) {
    return sendError(res, 'Failed to update member', 400)
  }
}

export async function removeMember(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.projectId)
    if (!project) return sendError(res, 'Project not found', 404)
    if (!project.isOwner(req.user.id) && project.getMember(req.user.id)?.role !== 'admin') {
      return sendError(res, 'Permission denied', 403)
    }

    await projectService.removeProjectMember(req.params.projectId, req.params.memberId)
    return sendSuccess(res, null, 'Member removed')
  } catch (error) {
    return sendError(res, 'Failed to remove member', 400)
  }
}
