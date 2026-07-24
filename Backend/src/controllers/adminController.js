import * as adminService from '../services/adminService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'

export async function getStats(req, res) {
  try { const stats = await adminService.getDashboardStats(); return sendSuccess(res, stats) }
  catch (e) { return sendError(res, e.message, 500) }
}

export async function listUsers(req, res) {
  try {
    const { query, role, status, sortBy, sortOrder, page, limit } = req.query
    const result = await adminService.listUsers({
      query, role, status, sortBy, sortOrder,
      page: parseInt(page) || 1, limit: Math.min(50, parseInt(limit) || 20),
    })
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function suspendUser(req, res) {
  try {
    const { userId } = req.params; const { reason } = req.body
    const result = await adminService.suspendUser(userId, reason)
    return sendSuccess(res, result, 'User suspended')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function activateUser(req, res) {
  try {
    const result = await adminService.activateUser(req.params.userId)
    return sendSuccess(res, result, 'User activated')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function updateUserRole(req, res) {
  try {
    const { role } = req.body
    const result = await adminService.updateUserRole(req.params.userId, role)
    return sendSuccess(res, result, 'Role updated')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function deleteUser(req, res) {
  try {
    await adminService.deleteUser(req.params.userId)
    return sendSuccess(res, null, 'User deleted')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function listEmployers(req, res) {
  try {
    const { query, status, verified, page, limit } = req.query
    const result = await adminService.listEmployers({
      query, status, verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
      page: parseInt(page) || 1, limit: Math.min(50, parseInt(limit) || 20),
    })
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function listAllProjects(req, res) {
  try {
    const { query, status, visibility, page, limit } = req.query
    const result = await adminService.listAllProjects({
      query, status, visibility,
      page: parseInt(page) || 1, limit: Math.min(50, parseInt(limit) || 20),
    })
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function moderateProject(req, res) {
  try {
    const { action } = req.body
    const result = await adminService.moderateProject(req.params.projectId, action)
    return sendSuccess(res, result, 'Project moderated')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getPendingVerifications(req, res) {
  try {
    const { page, limit } = req.query
    const result = await adminService.getPendingVerifications({
      page: parseInt(page) || 1, limit: Math.min(50, parseInt(limit) || 20),
    })
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function approveVerification(req, res) {
  try {
    await adminService.approveVerification(req.params.orgId)
    return sendSuccess(res, null, 'Verification approved')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function rejectVerification(req, res) {
  try {
    const { reason } = req.body
    await adminService.rejectVerification(req.params.orgId, reason)
    return sendSuccess(res, null, 'Verification rejected')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function moderateContent(req, res) {
  try {
    const { entityType, entityId } = req.params; const { action } = req.body
    const result = await adminService.moderateContent(entityType, entityId, action)
    return sendSuccess(res, result, 'Content moderated')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getActivityLogs(req, res) {
  try {
    const { action, entityType, userId, page, limit } = req.query
    const result = await adminService.getActivityLogs({
      action, entityType, userId,
      page: parseInt(page) || 1, limit: Math.min(50, parseInt(limit) || 20),
    })
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getReports(req, res) {
  try {
    const { from, to } = req.query
    const result = await adminService.getReports(from, to)
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}
