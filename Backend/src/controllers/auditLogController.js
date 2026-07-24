import * as auditLogService from '../services/auditLogService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'

export async function queryLogs(req, res) {
  try {
    const {
      userId, action, entityType, entityId, severity,
      isSensitive, userRole, search, from, to,
      sortBy, sortOrder, page, limit,
    } = req.query
    const result = await auditLogService.queryAuditLogs({
      userId,
      action,
      entityType,
      entityId,
      severity,
      isSensitive: isSensitive === 'true' ? true : isSensitive === 'false' ? false : undefined,
      userRole,
      search,
      from,
      to,
      sortBy,
      sortOrder,
      page: parseInt(page) || 1,
      limit: Math.min(100, parseInt(limit) || 30),
    })
    return sendSuccess(res, result)
  } catch (e) {
    return sendError(res, e.message, 500)
  }
}

export async function getLogById(req, res) {
  try {
    const log = await auditLogService.getAuditLogById(req.params.logId)
    if (!log) return sendError(res, 'Audit log not found', 404)
    return sendSuccess(res, log)
  } catch (e) {
    return sendError(res, e.message, 500)
  }
}

export async function getStats(req, res) {
  try {
    const { from, to } = req.query
    const stats = await auditLogService.getAuditStats({ from, to })
    return sendSuccess(res, stats)
  } catch (e) {
    return sendError(res, e.message, 500)
  }
}

export async function getUserHistory(req, res) {
  try {
    const { page, limit } = req.query
    const result = await auditLogService.getUserActivityHistory(req.params.userId, {
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 30),
    })
    return sendSuccess(res, result)
  } catch (e) {
    return sendError(res, e.message, 500)
  }
}

export async function getEntityHistory(req, res) {
  try {
    const { page, limit } = req.query
    const result = await auditLogService.getEntityAuditHistory(req.params.entityType, req.params.entityId, {
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 30),
    })
    return sendSuccess(res, result)
  } catch (e) {
    return sendError(res, e.message, 500)
  }
}

export async function getAdminLogs(req, res) {
  try {
    const { page, limit } = req.query
    const result = await auditLogService.getAdminActivityLogs({
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 30),
    })
    return sendSuccess(res, result)
  } catch (e) {
    return sendError(res, e.message, 500)
  }
}

export async function cleanupOldLogs(req, res) {
  try {
    const { retentionDays } = req.body
    const result = await auditLogService.cleanupAuditLogs(parseInt(retentionDays) || 90)
    return sendSuccess(res, result, `Cleaned up ${result.deleted} logs`)
  } catch (e) {
    return sendError(res, e.message, 500)
  }
}
