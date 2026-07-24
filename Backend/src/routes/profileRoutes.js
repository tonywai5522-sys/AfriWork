import { Router } from 'express'
import multer from 'multer'
import {
  getMyProfile,
  createProfile,
  updateMyProfile,
  updateSkills,
  updateExperience,
  updateEducation,
  uploadProfileAvatar,
  deleteProfileAvatar,
  getPublicProfile,
  getProfileCompleteness,
} from '../controllers/profileController.js'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false)
    }
  },
})

// ─── Authenticated Profile Routes ─────────────────────
router.get('/', authenticate, getMyProfile)
router.post('/', authenticate, createProfile)
router.put('/', authenticate, updateMyProfile)

// ─── Profile Sections ─────────────────────────────────
router.put('/skills', authenticate, updateSkills)
router.put('/experience', authenticate, updateExperience)
router.put('/education', authenticate, updateEducation)

// ─── Avatar ────────────────────────────────────────────
router.post('/avatar', authenticate, upload.single('avatar'), uploadProfileAvatar)
router.delete('/avatar', authenticate, deleteProfileAvatar)

// ─── Profile Completeness ──────────────────────────────
router.get('/completeness', authenticate, getProfileCompleteness)

// ─── Public Profile ───────────────────────────────────
router.get('/public/:userId', getPublicProfile)

export default router
