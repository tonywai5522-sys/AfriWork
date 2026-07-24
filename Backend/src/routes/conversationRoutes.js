import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import * as conversationController from '../controllers/conversationController.js'

const router = Router()

router.use(authenticate)

router.get('/', conversationController.getConversations)
router.get('/:id', conversationController.getConversation)
router.post('/direct', conversationController.createDirectConversation)
router.post('/group', conversationController.createGroupConversation)
router.put('/:id', conversationController.updateConversation)
router.delete('/:id', conversationController.deleteConversation)
router.post('/:id/participants', conversationController.addParticipant)
router.delete('/:id/participants/:userId', conversationController.removeParticipant)
router.post('/:id/read', conversationController.markAsRead)

export default router
