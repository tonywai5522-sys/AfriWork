import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'
import {
  createProject,
  updateProject,
  getProject,
  deleteProject,
  listMyProjects,
  searchProjects,
  incrementView,
  uploadMedia,
  deleteMedia,
  upload,
} from '../controllers/portfolioController.js'

const router = Router()

// ─── Public Routes ────────────────────────────────────
router.get('/search', searchProjects)
router.get('/:projectId', getProject)
router.post('/:projectId/view', incrementView)

// ─── Authenticated Routes ─────────────────────────────
router.post('/', authenticate, createProject)
router.get('/mine/list', authenticate, listMyProjects)
router.put('/:projectId', authenticate, updateProject)
router.delete('/:projectId', authenticate, deleteProject)

// ─── Media Upload ─────────────────────────────────────
router.post('/media/upload', authenticate, upload.single('file'), uploadMedia)
router.delete('/media/:fileId', authenticate, deleteMedia)

export default router
