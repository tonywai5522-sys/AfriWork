import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import {
  createApplication,
  getApplication,
  updateApplication,
  withdrawApplication,
  deleteApplication,
  listMyApplications,
  listEmployerApplications,
  listJobApplications,
  reviewApplication,
  bulkReviewApplications,
  getApplicationStats,
} from '../controllers/applicationController.js'

const router = Router()

// ─── All routes require authentication ─────────────────

// ─── Applicant Routes ──────────────────────────────────
router.post('/', authenticate, createApplication)
router.get('/mine', authenticate, listMyApplications)

// ─── Employer Routes ───────────────────────────────────
router.get('/employer', authenticate, requireRole('employer', 'admin'), listEmployerApplications)
router.get('/employer/stats', authenticate, requireRole('employer', 'admin'), getApplicationStats)
router.post('/bulk-review', authenticate, requireRole('employer', 'admin'), bulkReviewApplications)

// ─── Job-specific applications (employer) ──────────────
router.get('/job/:jobId', authenticate, listJobApplications)

// ─── Single application operations ─────────────────────
router.get('/:applicationId', authenticate, getApplication)
router.put('/:applicationId', authenticate, updateApplication)
router.post('/:applicationId/withdraw', authenticate, withdrawApplication)
router.delete('/:applicationId', authenticate, deleteApplication)

// ─── Review (employer) ─────────────────────────────────
router.put('/:applicationId/review', authenticate, requireRole('employer', 'admin'), reviewApplication)

export default router
