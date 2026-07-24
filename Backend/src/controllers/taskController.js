import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as taskService from '../services/taskService.js'
import { validateTaskCreatePayload, validateTaskUpdatePayload } from '../validators/taskValidator.js'

export async function createTask(req, res) {
  try {
    const validation = validateTaskCreatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const task = await taskService.createTask(req.user.id, {
      ...req.body,
      actorName: req.user.name,
      actorAvatar: req.user.avatar,
    })
    return sendSuccess(res, { task: task.toJSON() }, 'Task created')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to create task', 400)
  }
}

export async function getTaskById(req, res) {
  try {
    const task = await taskService.getTaskById(req.params.taskId)
    if (!task) return sendError(res, 'Task not found', 404)
    return sendSuccess(res, { task: task.toJSON() }, 'Task retrieved')
  } catch (error) {
    return sendError(res, 'Task not found', 404)
  }
}

export async function updateTask(req, res) {
  try {
    const validation = validateTaskUpdatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.message, 400)

    const task = await taskService.getTaskById(req.params.taskId)
    if (!task) return sendError(res, 'Task not found', 404)

    const updated = await taskService.updateTask(req.params.taskId, { ...req.body, updatedBy: req.user.id })
    return sendSuccess(res, { task: updated.toJSON() }, 'Task updated')
  } catch (error) {
    return sendError(res, 'Failed to update task', 400)
  }
}

export async function deleteTask(req, res) {
  try {
    const task = await taskService.getTaskById(req.params.taskId)
    if (!task) return sendError(res, 'Task not found', 404)

    await taskService.deleteTask(req.params.taskId)
    return sendSuccess(res, null, 'Task deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete task', 400)
  }
}

export async function getProjectTasks(req, res) {
  try {
    const { page, limit, taskListId, assigneeId, priority, status } = req.query
    const result = await taskService.getProjectTasks(req.params.projectId, {
      page: parseInt(page) || 1,
      limit: Math.min(100, parseInt(limit) || 50),
      taskListId,
      assigneeId,
      priority,
      status,
    })
    return sendSuccess(res, {
      tasks: result.tasks.map(t => t.toJSON()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }, 'Tasks retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve tasks', 400)
  }
}

export async function reorderTasks(req, res) {
  try {
    const { taskListId, taskIds } = req.body
    if (!taskListId || !taskIds || !Array.isArray(taskIds)) {
      return sendError(res, 'taskListId and taskIds array are required', 400)
    }

    const result = await taskService.reorderTasks(taskListId, taskIds)
    return sendSuccess(res, result, 'Tasks reordered')
  } catch (error) {
    return sendError(res, 'Failed to reorder tasks', 400)
  }
}

export async function bulkUpdateTasks(req, res) {
  try {
    const { taskIds, updates } = req.body
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return sendError(res, 'taskIds array is required', 400)
    }
    if (!updates || typeof updates !== 'object') {
      return sendError(res, 'updates object is required', 400)
    }

    const result = await taskService.bulkUpdateTasks(taskIds, updates)
    return sendSuccess(res, result, 'Tasks updated')
  } catch (error) {
    return sendError(res, 'Failed to bulk update tasks', 400)
  }
}
