import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as searchService from '../services/searchService.js'
import * as recentSearchService from '../services/recentSearchService.js'
import { validateSearchParams } from '../validators/searchValidator.js'

export async function globalSearch(req, res) {
  try {
    const { query, type, sortBy, page, limit, status, location, experienceLevel, skills, budgetMin, budgetMax } = req.body || req.query || {}

    const validation = validateSearchParams({ type, sortBy, page, limit })
    if (!validation.isValid) {
      return sendError(res, validation.message, 400)
    }

    const filters = {}
    if (status) filters.status = status
    if (location) filters.location = location
    if (experienceLevel) filters.experienceLevel = experienceLevel
    if (skills) filters.skills = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',') : [])
    if (budgetMin !== undefined) filters.budgetMin = parseFloat(budgetMin)
    if (budgetMax !== undefined) filters.budgetMax = parseFloat(budgetMax)

    const result = await searchService.globalSearch({
      query: query || '',
      type: type || 'all',
      filters,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sortBy: sortBy || 'relevance',
      userId: req.user?.id,
    })

    return sendSuccess(res, result, 'Search completed')
  } catch (error) {
    return sendError(res, error?.message || 'Search failed', 500)
  }
}

export async function getRecentSearches(req, res) {
  try {
    const userId = req.user.id
    const searches = await recentSearchService.getRecentSearches(userId)
    return sendSuccess(res, { searches }, 'Recent searches retrieved')
  } catch (error) {
    return sendError(res, 'Failed to get recent searches', 500)
  }
}

export async function saveRecentSearch(req, res) {
  try {
    const userId = req.user.id
    const { query, type, results } = req.body
    if (!query) return sendError(res, 'query is required', 400)
    await recentSearchService.saveRecentSearch(userId, query, type || 'all', results || 0)
    return sendSuccess(res, {}, 'Search saved')
  } catch (error) {
    return sendError(res, 'Failed to save search', 500)
  }
}

export async function clearRecentSearches(req, res) {
  try {
    const userId = req.user.id
    await recentSearchService.clearRecentSearches(userId)
    return sendSuccess(res, {}, 'Recent searches cleared')
  } catch (error) {
    return sendError(res, 'Failed to clear searches', 500)
  }
}

export async function deleteRecentSearch(req, res) {
  try {
    const { searchId } = req.params
    await recentSearchService.deleteRecentSearch(searchId)
    return sendSuccess(res, {}, 'Search deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete search', 500)
  }
}
