import { Router } from 'express'
import {
  searchTalents,
  getTalent,
  getTalentStats,
  saveTalent,
  unsaveTalent,
  getSavedTalents,
  getSavedTalentIds,
} from '../controllers/talentController.js'
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js'

const router = Router()

// ─── Public / Semi-Public Routes ──────────────────────
router.get('/search', searchTalents)
router.get('/stats', getTalentStats)
router.get('/:talentId', getTalent)

// ─── Authenticated Routes ─────────────────────────────
router.get('/saved/list', authenticate, getSavedTalents)
router.get('/saved/ids', authenticate, getSavedTalentIds)
router.post('/saved', authenticate, saveTalent)
router.delete('/saved/:talentId', authenticate, unsaveTalent)

export default router
