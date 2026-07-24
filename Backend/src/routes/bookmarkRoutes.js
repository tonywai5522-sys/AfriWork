import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import * as bookmarkController from '../controllers/bookmarkController.js'

const router = Router()

router.use(authenticate)

router.get('/all', bookmarkController.getAllBookmarkIds)
router.get('/', bookmarkController.getUserBookmarks)
router.post('/toggle', bookmarkController.toggleBookmark)
router.get('/check/:targetType/:targetId', bookmarkController.isBookmarked)
router.get('/ids/:targetType', bookmarkController.getBookmarkedIds)
router.delete('/:targetType/:targetId', bookmarkController.removeBookmark)

export default router
