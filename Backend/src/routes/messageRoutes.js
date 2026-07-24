import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import { multiFile } from '../services/fileUploadService.js'
import * as messageController from '../controllers/messageController.js'

const router = Router()

router.use(authenticate)

router.get('/:conversationId', messageController.getMessages)
router.post('/:conversationId/text', messageController.sendTextMessage)
router.post('/:conversationId', multiFile, messageController.sendMessage)
router.put('/:messageId', messageController.editMessage)
router.delete('/:messageId', messageController.deleteMessage)
router.post('/:messageId/reactions', messageController.addReaction)
router.post('/upload', messageController.uploadAttachment)

export default router
