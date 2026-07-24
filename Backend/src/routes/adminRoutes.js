import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import * as adminController from '../controllers/adminController.js'

const router = Router()

router.use(authenticate)
router.use(requireAdmin)

router.get('/stats', adminController.getStats)
router.get('/users', adminController.listUsers)
router.put('/users/:userId/suspend', adminController.suspendUser)
router.put('/users/:userId/activate', adminController.activateUser)
router.put('/users/:userId/role', adminController.updateUserRole)
router.delete('/users/:userId', adminController.deleteUser)

router.get('/employers', adminController.listEmployers)

router.get('/projects', adminController.listAllProjects)
router.put('/projects/:projectId/moderate', adminController.moderateProject)

router.get('/verifications', adminController.getPendingVerifications)
router.post('/verifications/:orgId/approve', adminController.approveVerification)
router.post('/verifications/:orgId/reject', adminController.rejectVerification)

router.post('/moderate/:entityType/:entityId', adminController.moderateContent)

router.get('/activity', adminController.getActivityLogs)
router.get('/reports', adminController.getReports)

export default router
