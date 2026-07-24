import { Router } from 'express'
import multer from 'multer'
import {
  getMyOrganization, createOrganization, updateOrganization,
  uploadLogo, updateBranding, requestVerification, verifyOrganization,
  getOrganizationById, listOrganizations, addRecruiter,
  updateRecruiter, removeRecruiter, getEmployerDashboard,
} from '../controllers/organizationController.js'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { const t = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; cb(null, t.includes(file.mimetype)) } })

// ─── Employer Dashboard ───────────────────────────────
router.get('/dashboard', authenticate, getEmployerDashboard)

// ─── Organization CRUD ────────────────────────────────
router.get('/my', authenticate, getMyOrganization)
router.post('/', authenticate, createOrganization)
router.put('/', authenticate, updateOrganization)

// ─── Logo & Branding ──────────────────────────────────
router.post('/logo', authenticate, upload.single('logo'), uploadLogo)
router.put('/branding', authenticate, updateBranding)

// ─── Verification ─────────────────────────────────────
router.post('/verification', authenticate, requestVerification)
router.put('/:orgId/verify', authenticate, requireAdmin, verifyOrganization)

// ─── Recruiters ────────────────────────────────────────
router.post('/recruiters', authenticate, addRecruiter)
router.put('/recruiters/:recruiterId', authenticate, updateRecruiter)
router.delete('/recruiters/:recruiterId', authenticate, removeRecruiter)

// ─── Public Routes ────────────────────────────────────
router.get('/public', listOrganizations)
router.get('/public/:orgId', getOrganizationById)

export default router
