import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import * as notificationController from '../controllers/notificationController.js'

const router = Router()

router.use(authenticate)

router.get('/', notificationController.getNotifications)
router.get('/unread-count', notificationController.getUnreadCount)
router.post('/:notificationId/read', notificationController.markAsRead)
router.post('/read-all', notificationController.markAllAsRead)
router.delete('/:notificationId', notificationController.deleteNotification)
router.get('/preferences', notificationController.getPreferences)
router.put('/preferences', notificationController.updatePreferences)

export default router
