import { Router } from 'express'
import { getProjectActivity } from '../controllers/activityFeedController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/project/:projectId', authenticate, getProjectActivity)

export default router
