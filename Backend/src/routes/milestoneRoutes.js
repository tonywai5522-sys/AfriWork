import { Router } from 'express'
import {
  createMilestone, getMilestoneById, updateMilestone, deleteMilestone,
  getProjectMilestones,
} from '../controllers/milestoneController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', authenticate, createMilestone)
router.get('/project/:projectId', authenticate, getProjectMilestones)
router.get('/:milestoneId', authenticate, getMilestoneById)
router.put('/:milestoneId', authenticate, updateMilestone)
router.delete('/:milestoneId', authenticate, deleteMilestone)

export default router
