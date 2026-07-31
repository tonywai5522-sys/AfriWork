import { API_BASE } from './apiClient.js'

class CommentServiceError extends Error {
  constructor(message, status) { super(message); this.name = 'CommentServiceError'; this.status = status }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', ...options,
  }
  if (options.body instanceof FormData) delete config.headers['Content-Type']
  let response
  try { response = await fetch(`${API_BASE}${path}`, config) } catch { throw new CommentServiceError('Connection failed', 0) }
  let payload
  try { payload = await response.json() } catch { throw new CommentServiceError('Invalid response', response.status) }
  if (!response.ok) throw new CommentServiceError(payload.message || 'Request failed', response.status)
  return payload
}

export async function createComment(data) { return request('/comments', { method: 'POST', body: JSON.stringify(data) }) }
export async function getCommentById(id) { return request(`/comments/${id}`) }
export async function updateComment(id, data) { return request(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function deleteComment(id) { return request(`/comments/${id}`, { method: 'DELETE' }) }
export async function getEntityComments(entityType, entityId, params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/comments/entity/${entityType}/${entityId}?${q}`)
}