import * as analyticsService from '../services/analyticsService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'

export async function getPlatformKPI(req, res) {
  try {
    const result = await analyticsService.getPlatformKPI(req.query.period || '30d')
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getUserGrowth(req, res) {
  try {
    const result = await analyticsService.getUserGrowthMetrics(req.query.period || '90d')
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getJobAnalytics(req, res) {
  try {
    const result = await analyticsService.getJobAnalytics(req.query.period || '90d')
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getProjectAnalytics(req, res) {
  try {
    const result = await analyticsService.getProjectAnalytics(req.query.period || '90d')
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getEmployerAnalytics(req, res) {
  try {
    const result = await analyticsService.getEmployerAnalytics(req.query.period || '90d')
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getApplicationAnalytics(req, res) {
  try {
    const result = await analyticsService.getApplicationAnalytics(req.query.period || '90d')
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getReviewAnalytics(req, res) {
  try {
    const result = await analyticsService.getReviewAnalytics(req.query.period || '90d')
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getTimeSeriesTrends(req, res) {
  try {
    const result = await analyticsService.getTimeSeriesTrends(req.query.period || '90d', req.query.interval || 'day')
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getAnalyticsDashboard(req, res) {
  try {
    const result = await analyticsService.getAnalyticsDashboard()
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}
