import { Router } from 'express'
import multer from 'multer'
import {
  uploadResume,
  downloadResume,
  getResumeInfo,
  deleteResume,
  getPublicResumeUrl,
} from '../controllers/resumeController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, and RTF files are allowed'), false)
    }
  },
})

// Authenticated routes
router.get('/', authenticate, getResumeInfo)
router.post('/', authenticate, upload.single('resume'), uploadResume)
router.delete('/', authenticate, deleteResume)

// Download own resume
router.get('/download', authenticate, downloadResume)

// Public routes
router.get('/public/:userId', getPublicResumeUrl)
router.get('/public/:userId/download', downloadResume)

export default router
