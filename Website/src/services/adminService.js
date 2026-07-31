import { API_BASE } from './apiClient.js'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const config = { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, credentials: 'include', ...options }
  const res = await fetch(url, config)
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.message || 'Request failed')
  return payload
}

export async function getAdminStats() {
  return request('/admin/stats')
}

export async function listUsers(params = {}) {
  const q = new URLSearchParams()
  if (params.query) q.set('query', params.query)
  if (params.role) q.set('role', params.role)
  if (params.status) q.set('status', params.status)
  if (params.sortBy) q.set('sortBy', params.sortBy)
  if (params.sortOrder) q.set('sortOrder', params.sortOrder)
  if (params.page) q.set('page', params.page)
  if (params.limit) q.set('limit', params.limit)
  return request(`/admin/users?${q}`)
}

export async function suspendUser(userId, reason = '') {
  return request(`/admin/users/${userId}/suspend`, { method: 'PUT', body: JSON.stringify({ reason }) })
}

export async function activateUser(userId) {
  return request(`/admin/users/${userId}/activate`, { method: 'PUT' })
}

export async function updateUserRole(userId, role) {
  return request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) })
}

export async function deleteUser(userId) {
  return request(`/admin/users/${userId}`, { method: 'DELETE' })
}

export async function listEmployers(params = {}) {
  const q = new URLSearchParams()
  if (params.query) q.set('query', params.query)
  if (params.page) q.set('page', params.page)
  return request(`/admin/employers?${q}`)
}

export async function listAllProjects(params = {}) {
  const q = new URLSearchParams()
  if (params.query) q.set('query', params.query)
  if (params.status) q.set('status', params.status)
  if (params.page) q.set('page', params.page)
  return request(`/admin/projects?${q}`)
}

export async function moderateProject(projectId, action) {
  return request(`/admin/projects/${projectId}/moderate`, { method: 'PUT', body: JSON.stringify({ action }) })
}

export async function getPendingVerifications(page = 1) {
  return request(`/admin/verifications?page=${page}`)
}

export async function approveVerification(orgId) {
  return request(`/admin/verifications/${orgId}/approve`, { method: 'POST' })
}

export async function rejectVerification(orgId, reason = '') {
  return request(`/admin/verifications/${orgId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
}

export async function moderateContent(entityType, entityId, action) {
  return request(`/admin/moderate/${entityType}/${entityId}`, { method: 'POST', body: JSON.stringify({ action }) })
}

export async function getActivityLogs(params = {}) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', params.page)
  if (params.action) q.set('action', params.action)
  if (params.entityType) q.set('entityType', params.entityType)
  return request(`/admin/activity?${q}`)
}

export async function getReports(from, to) {
  const q = new URLSearchParams()
  if (from) q.set('from', from)
  if (to) q.set('to', to)
  return request(`/admin/reports?${q}`)
}
