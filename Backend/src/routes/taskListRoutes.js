import { Router } from 'express'
import {
  createTaskList, getTaskListById, updateTaskList, deleteTaskList,
  getProjectTaskLists, reorderTaskLists,
} from '../controllers/taskListController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', authenticate, createTaskList)
router.get('/project/:projectId', authenticate, getProjectTaskLists)
router.put('/reorder', authenticate, reorderTaskLists)
router.get('/:listId', authenticate, getTaskListById)
router.put('/:listId', authenticate, updateTaskList)
router.delete('/:listId', authenticate, deleteTaskList)

export default router
