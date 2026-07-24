import { Router } from 'express'
import {
  createComment, getCommentById, updateComment, deleteComment,
  getEntityComments,
} from '../controllers/commentController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', authenticate, createComment)
router.get('/entity/:entityType/:entityId', authenticate, getEntityComments)
router.get('/:commentId', authenticate, getCommentById)
router.put('/:commentId', authenticate, updateComment)
router.delete('/:commentId', authenticate, deleteComment)

export default router
