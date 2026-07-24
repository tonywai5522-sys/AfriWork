import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as talentService from '../services/talentService.js'

export async function searchTalents(req, res) {
  try {
    const {
      query,
      skills,
      experienceLevel,
      availability,
      location,
      hourlyRateMin,
      hourlyRateMax,
      sortBy,
      sortOrder,
      page = 1,
      limit = 12,
    } = req.query

    const parsedSkills = skills ? (Array.isArray(skills) ? skills : skills.split(',')) : []
    const parsedPage = Math.max(1, parseInt(page, 10) || 1)
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12))

    const result = await talentService.searchTalents({
      query: query || '',
      skills: parsedSkills,
      experienceLevel: experienceLevel || undefined,
      availability: availability || undefined,
      location: location || undefined,
      hourlyRateMin: hourlyRateMin !== undefined ? parseFloat(hourlyRateMin) : undefined,
      hourlyRateMax: hourlyRateMax !== undefined ? parseFloat(hourlyRateMax) : undefined,
      sortBy: sortBy || 'relevance',
      sortOrder: sortOrder || 'desc',
      page: parsedPage,
      limit: parsedLimit,
    })

    return sendSuccess(res, result, 'Talents retrieved')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to search talents', 400)
  }
}

export async function getTalent(req, res) {
  try {
    const { talentId } = req.params
    const talent = await talentService.getTalentById(talentId)
    return sendSuccess(res, { talent }, 'Talent retrieved')
  } catch (error) {
    return sendError(res, 'Talent not found', 404)
  }
}

export async function getTalentStats(req, res) {
  try {
    const stats = await talentService.getTalentStats()
    return sendSuccess(res, stats, 'Talent stats retrieved')
  } catch (error) {
    return sendError(res, 'Failed to get talent stats', 400)
  }
}

export async function saveTalent(req, res) {
  try {
    const { talentId } = req.body
    if (!talentId) return sendError(res, 'talentId is required', 400)

    const userId = req.user.id
    const result = await talentService.saveTalent(userId, talentId)
    return sendSuccess(res, result, result.saved ? 'Talent saved' : 'Already saved')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to save talent', 400)
  }
}

export async function unsaveTalent(req, res) {
  try {
    const { talentId } = req.params
    const userId = req.user.id
    const result = await talentService.unsaveTalent(userId, talentId)
    return sendSuccess(res, result, 'Talent unsaved')
  } catch (error) {
    return sendError(res, 'Failed to unsave talent', 400)
  }
}

export async function getSavedTalents(req, res) {
  try {
    const userId = req.user.id
    const talents = await talentService.getSavedTalents(userId)
    return sendSuccess(res, { talents }, 'Saved talents retrieved')
  } catch (error) {
    return sendError(res, 'Failed to get saved talents', 400)
  }
}

export async function getSavedTalentIds(req, res) {
  try {
    const userId = req.user.id
    const ids = await talentService.getSavedTalentIds(userId)
    return sendSuccess(res, { ids }, 'Saved talent IDs retrieved')
  } catch (error) {
    return sendError(res, 'Failed to get saved talent IDs', 400)
  }
}
