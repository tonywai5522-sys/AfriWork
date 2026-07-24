import { Router } from 'express'
import { authenticate, requireAdmin, requireModerator } from '../middleware/authMiddleware.js'
import * as analyticsController from '../controllers/analyticsController.js'

const router = Router()

router.use(authenticate)

router.get('/kpi', requireModerator, analyticsController.getPlatformKPI)
router.get('/users/growth', requireModerator, analyticsController.getUserGrowth)
router.get('/jobs', requireModerator, analyticsController.getJobAnalytics)
router.get('/projects', requireModerator, analyticsController.getProjectAnalytics)
router.get('/employers', requireModerator, analyticsController.getEmployerAnalytics)
router.get('/applications', requireModerator, analyticsController.getApplicationAnalytics)
router.get('/reviews', requireModerator, analyticsController.getReviewAnalytics)
router.get('/trends', requireModerator, analyticsController.getTimeSeriesTrends)
router.get('/dashboard', requireModerator, analyticsController.getAnalyticsDashboard)

export default router
