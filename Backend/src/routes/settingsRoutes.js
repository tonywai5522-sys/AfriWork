import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import * as settingsController from '../controllers/settingsController.js'

const router = Router()

router.use(authenticate)

router.get('/', settingsController.getFullSettings)
router.get('/account', settingsController.getAccount)
router.put('/account', settingsController.updateAccount)
router.get('/security', settingsController.getSecurity)
router.put('/security', settingsController.updateSecurity)
router.post('/security/change-password', settingsController.changePassword)
router.get('/privacy', settingsController.getPrivacy)
router.put('/privacy', settingsController.updatePrivacy)
router.get('/notifications', settingsController.getNotifications)
router.put('/notifications', settingsController.updateNotifications)
router.get('/connected-accounts', settingsController.getConnectedAccounts)
router.post('/connected-accounts', settingsController.connectAccount)
router.delete('/connected-accounts/:accountId', settingsController.disconnectAccount)

export default router
