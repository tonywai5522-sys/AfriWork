const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class TaskListServiceError extends Error {
  constructor(message, status) { super(message); this.name = 'TaskListServiceError'; this.status = status }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', ...options,
  }
  if (options.body instanceof FormData) delete config.headers['Content-Type']
  let response
  try { response = await fetch(`${API_BASE_URL}${path}`, config) } catch { throw new TaskListServiceError('Connection failed', 0) }
  let payload
  try { payload = await response.json() } catch { throw new TaskListServiceError('Invalid response', response.status) }
  if (!response.ok) throw new TaskListServiceError(payload.message || 'Request failed', response.status)
  return payload
}

export async function createTaskList(data) { return request('/task-lists', { method: 'POST', body: JSON.stringify(data) }) }
export async function getTaskListById(id) { return request(`/task-lists/${id}`) }
export async function updateTaskList(id, data) { return request(`/task-lists/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function deleteTaskList(id) { return request(`/task-lists/${id}`, { method: 'DELETE' }) }
export async function getProjectTaskLists(projectId) { return request(`/task-lists/project/${projectId}`) }
export async function reorderTaskLists(data) { return request('/task-lists/reorder', { method: 'PUT', body: JSON.stringify(data) }) }