import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as skillService from '../services/skillService.js'

export async function listSkills(req, res) {
  try {
    const { category, search, limit } = req.query
    const skills = await skillService.getSkills({ category, search, limit: limit ? parseInt(limit) : 50 })
    return sendSuccess(res, { skills }, 'Skills retrieved')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to retrieve skills', 400)
  }
}

export async function listCategories(req, res) {
  try {
    const categories = await skillService.getCategories()
    return sendSuccess(res, { categories }, 'Categories retrieved')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to retrieve categories', 400)
  }
}

export async function createSkill(req, res) {
  try {
    const { name, category, description } = req.body
    if (!name || !name.trim()) {
      return sendError(res, 'Skill name is required', 400)
    }
    const skill = await skillService.createSkill({ name, category, description })
    return sendSuccess(res, { skill }, 'Skill created')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to create skill', 400)
  }
}

export async function getPresetSkills(req, res) {
  try {
    const skills = await skillService.getPresetSkills()
    return sendSuccess(res, { skills }, 'Preset skills retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve preset skills', 400)
  }
}
