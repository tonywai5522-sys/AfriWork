import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import * as taskListService from '../services/taskListService.js'

export async function createTaskList(req, res) {
  try {
    if (!req.body.projectId || !req.body.title) {
      return sendError(res, 'projectId and title are required', 400)
    }
    const list = await taskListService.createTaskList(req.user.id, req.body)
    return sendSuccess(res, { taskList: list.toJSON() }, 'Task list created')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to create task list', 400)
  }
}

export async function getTaskListById(req, res) {
  try {
    const list = await taskListService.getTaskListById(req.params.listId)
    if (!list) return sendError(res, 'Task list not found', 404)
    return sendSuccess(res, { taskList: list.toJSON() }, 'Task list retrieved')
  } catch (error) {
    return sendError(res, 'Task list not found', 404)
  }
}

export async function updateTaskList(req, res) {
  try {
    const list = await taskListService.getTaskListById(req.params.listId)
    if (!list) return sendError(res, 'Task list not found', 404)

    const updated = await taskListService.updateTaskList(req.params.listId, req.body)
    return sendSuccess(res, { taskList: updated.toJSON() }, 'Task list updated')
  } catch (error) {
    return sendError(res, 'Failed to update task list', 400)
  }
}

export async function deleteTaskList(req, res) {
  try {
    const list = await taskListService.getTaskListById(req.params.listId)
    if (!list) return sendError(res, 'Task list not found', 404)

    await taskListService.deleteTaskList(req.params.listId)
    return sendSuccess(res, null, 'Task list deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete task list', 400)
  }
}

export async function getProjectTaskLists(req, res) {
  try {
    const lists = await taskListService.getProjectTaskLists(req.params.projectId)
    return sendSuccess(res, { taskLists: lists.map(l => l.toJSON()) }, 'Task lists retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve task lists', 400)
  }
}

export async function reorderTaskLists(req, res) {
  try {
    const { projectId, listIds } = req.body
    if (!projectId || !listIds || !Array.isArray(listIds)) {
      return sendError(res, 'projectId and listIds array are required', 400)
    }

    const result = await taskListService.reorderTaskLists(projectId, listIds)
    return sendSuccess(res, result, 'Task lists reordered')
  } catch (error) {
    return sendError(res, 'Failed to reorder task lists', 400)
  }
}
