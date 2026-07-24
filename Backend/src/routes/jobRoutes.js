import { Router } from 'express'
import { createJob, updateJob, getJob, searchJobs, getEmployerJobs, incrementView, toggleFeatured, bookmarkJob, unbookmarkJob, getBookmarkedJobs } from '../controllers/jobController.js'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// ─── Public Routes ────────────────────────────────────
router.get('/search', searchJobs)
router.get('/featured', (req, res, next) => { req.query.featured = 'true'; next() }, searchJobs)
router.get('/:jobId', getJob)
router.post('/:jobId/view', incrementView)

// ─── Authenticated: Jobseeker ─────────────────────────
router.get('/bookmarks/list', authenticate, getBookmarkedJobs)
router.post('/bookmarks', authenticate, bookmarkJob)
router.delete('/bookmarks/:jobId', authenticate, unbookmarkJob)

// ─── Authenticated: Employer ──────────────────────────
router.post('/', authenticate, createJob)
router.put('/:jobId', authenticate, updateJob)
router.get('/employer/mine', authenticate, getEmployerJobs)

// ─── Admin ────────────────────────────────────────────
router.put('/:jobId/featured', authenticate, requireAdmin, toggleFeatured)

export default router
