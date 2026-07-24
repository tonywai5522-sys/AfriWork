import { Router } from 'express'
import { authenticate, requireAdmin, requireModerator } from '../middleware/authMiddleware.js'
import * as auditLogController from '../controllers/auditLogController.js'

const router = Router()

// All audit log routes require authentication
router.use(authenticate)

// Regular audit log queries (accessible to moderators and admins)
router.get('/', requireModerator, auditLogController.queryLogs)
router.get('/stats', requireModerator, auditLogController.getStats)
router.get('/:logId', requireModerator, auditLogController.getLogById)

// Admin-only routes
router.get('/user/:userId', requireAdmin, auditLogController.getUserHistory)
router.get('/entity/:entityType/:entityId', requireAdmin, auditLogController.getEntityHistory)
router.get('/admin/logs', requireAdmin, auditLogController.getAdminLogs)
router.post('/cleanup', requireAdmin, auditLogController.cleanupOldLogs)

export default router
