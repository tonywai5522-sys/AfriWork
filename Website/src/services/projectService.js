const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class ProjectServiceError extends Error {
  constructor(message, status) { super(message); this.name = 'ProjectServiceError'; this.status = status }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', ...options,
  }
  if (options.body instanceof FormData) delete config.headers['Content-Type']
  let response
  try { response = await fetch(`${API_BASE_URL}${path}`, config) } catch { throw new ProjectServiceError('Connection failed', 0) }
  let payload
  try { payload = await response.json() } catch { throw new ProjectServiceError('Invalid response', response.status) }
  if (!response.ok) throw new ProjectServiceError(payload.message || 'Request failed', response.status)
  return payload
}

export async function getMyProjects() { return request('/projects') }
export async function createProject(data) { return request('/projects', { method: 'POST', body: JSON.stringify(data) }) }
export async function getProjectById(id) { return request(`/projects/${id}`) }
export async function updateProject(id, data) { return request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function deleteProject(id) { return request(`/projects/${id}`, { method: 'DELETE' }) }
export async function listProjects(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.status) q.set('status', params.status)
  if (params.organizationId) q.set('organizationId', params.organizationId)
  return request(`/projects/public/list?${q}`)
}
export async function addProjectMember(id, data) { return request(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify(data) }) }
export async function updateProjectMember(id, memberId, data) { return request(`/projects/${id}/members/${memberId}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function removeProjectMember(id, memberId) { return request(`/projects/${id}/members/${memberId}`, { method: 'DELETE' }) }