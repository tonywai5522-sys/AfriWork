import { API_BASE } from './apiClient.js'

class TaskServiceError extends Error {
  constructor(message, status) { super(message); this.name = 'TaskServiceError'; this.status = status }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', ...options,
  }
  if (options.body instanceof FormData) delete config.headers['Content-Type']
  let response
  try { response = await fetch(`${API_BASE}${path}`, config) } catch { throw new TaskServiceError('Connection failed', 0) }
  let payload
  try { payload = await response.json() } catch { throw new TaskServiceError('Invalid response', response.status) }
  if (!response.ok) throw new TaskServiceError(payload.message || 'Request failed', response.status)
  return payload
}

export async function createTask(data) { return request('/tasks', { method: 'POST', body: JSON.stringify(data) }) }
export async function getTaskById(id) { return request(`/tasks/${id}`) }
export async function updateTask(id, data) { return request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function deleteTask(id) { return request(`/tasks/${id}`, { method: 'DELETE' }) }
export async function getProjectTasks(projectId, params = {}) {
  const q = new URLSearchParams()
  if (params.taskListId) q.set('taskListId', params.taskListId)
  if (params.assigneeId) q.set('assigneeId', params.assigneeId)
  if (params.priority) q.set('priority', params.priority)
  if (params.status) q.set('status', params.status)
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/tasks/project/${projectId}?${q}`)
}
export async function reorderTasks(data) { return request('/tasks/reorder', { method: 'PUT', body: JSON.stringify(data) }) }
export async function bulkUpdateTasks(data) { return request('/tasks/bulk-update', { method: 'PUT', body: JSON.stringify(data) }) }
