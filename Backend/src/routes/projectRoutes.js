import { Router } from 'express'
import {
  getMyProjects, createProject, getProjectById, updateProject, deleteProject,
  listProjects, addMember, updateMember, removeMember,
} from '../controllers/projectController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authenticate, getMyProjects)
router.post('/', authenticate, createProject)
router.get('/public/list', listProjects)
router.get('/:projectId', authenticate, getProjectById)
router.put('/:projectId', authenticate, updateProject)
router.delete('/:projectId', authenticate, deleteProject)
router.post('/:projectId/members', authenticate, addMember)
router.put('/:projectId/members/:memberId', authenticate, updateMember)
router.delete('/:projectId/members/:memberId', authenticate, removeMember)

export default router
