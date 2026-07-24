import { Router } from 'express'
import {
  createTask, getTaskById, updateTask, deleteTask,
  getProjectTasks, reorderTasks, bulkUpdateTasks,
} from '../controllers/taskController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', authenticate, createTask)
router.get('/project/:projectId', authenticate, getProjectTasks)
router.put('/reorder', authenticate, reorderTasks)
router.put('/bulk-update', authenticate, bulkUpdateTasks)
router.get('/:taskId', authenticate, getTaskById)
router.put('/:taskId', authenticate, updateTask)
router.delete('/:taskId', authenticate, deleteTask)

export default router
