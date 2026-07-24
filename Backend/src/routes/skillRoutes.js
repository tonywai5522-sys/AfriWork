import { Router } from 'express'
import {
  listSkills,
  listCategories,
  createSkill,
  getPresetSkills,
} from '../controllers/skillController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

// Public routes
router.get('/', listSkills)
router.get('/categories', listCategories)
router.get('/presets', getPresetSkills)

// Admin routes
router.post('/', authenticate, createSkill)

export default router
