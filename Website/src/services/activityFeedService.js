import { API_BASE } from './apiClient.js'

class ActivityFeedError extends Error {
  constructor(message, status) { super(message); this.name = 'ActivityFeedError'; this.status = status }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', ...options,
  }
  if (options.body instanceof FormData) delete config.headers['Content-Type']
  let response
  try { response = await fetch(`${API_BASE}${path}`, config) } catch { throw new ActivityFeedError('Connection failed', 0) }
  let payload
  try { payload = await response.json() } catch { throw new ActivityFeedError('Invalid response', response.status) }
  if (!response.ok) throw new ActivityFeedError(payload.message || 'Request failed', response.status)
  return payload
}

export async function getProjectActivity(projectId, params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/activity-feed/project/${projectId}?${q}`)
}
