const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class MilestoneServiceError extends Error {
  constructor(message, status) { super(message); this.name = 'MilestoneServiceError'; this.status = status }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', ...options,
  }
  if (options.body instanceof FormData) delete config.headers['Content-Type']
  let response
  try { response = await fetch(`${API_BASE_URL}${path}`, config) } catch { throw new MilestoneServiceError('Connection failed', 0) }
  let payload
  try { payload = await response.json() } catch { throw new MilestoneServiceError('Invalid response', response.status) }
  if (!response.ok) throw new MilestoneServiceError(payload.message || 'Request failed', response.status)
  return payload
}

export async function createMilestone(data) { return request('/milestones', { method: 'POST', body: JSON.stringify(data) }) }
export async function getMilestoneById(id) { return request(`/milestones/${id}`) }
export async function updateMilestone(id, data) { return request(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function deleteMilestone(id) { return request(`/milestones/${id}`, { method: 'DELETE' }) }
export async function getProjectMilestones(projectId, params = {}) {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/milestones/project/${projectId}?${q}`)
}