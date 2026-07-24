import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/authMiddleware.js'
import * as reviewController from '../controllers/reviewController.js'

const router = Router()

router.use(authenticate)

// My reviews
router.get('/my', reviewController.getMyReviews)

// Moderation (admin only)
router.get('/moderation/pending', requireAdmin, reviewController.getPendingReviews)
router.get('/moderation/flagged', requireAdmin, reviewController.getFlaggedReviews)
router.post('/:id/moderate', requireAdmin, reviewController.moderateReview)

// Rating summary
router.get('/summary/:targetType/:targetId', reviewController.getRatingSummary)

// Review eligibility
router.get('/can-review/:targetType/:targetId', reviewController.canReviewTarget)

// My existing review for a target
router.get('/my/:targetType/:targetId', reviewController.getMyReview)

// CRUD
router.post('/', reviewController.createReview)
router.get('/:targetType/:targetId', reviewController.getReviews)
router.put('/:id', reviewController.updateReview)
router.delete('/:id', reviewController.deleteReview)

// Interactions
router.post('/:id/helpful', reviewController.markHelpful)
router.post('/:id/reply', reviewController.addReply)
router.post('/:id/report', reviewController.reportReview)

export default router
