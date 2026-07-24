const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class OrgServiceError extends Error {
  constructor(message, status) { super(message); this.name = 'OrgServiceError'; this.status = status }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', ...options,
  }
  if (options.body instanceof FormData) delete config.headers['Content-Type']
  let response
  try { response = await fetch(`${API_BASE_URL}${path}`, config) } catch { throw new OrgServiceError('Connection failed', 0) }
  let payload
  try { payload = await response.json() } catch { throw new OrgServiceError('Invalid response', response.status) }
  if (!response.ok) throw new OrgServiceError(payload.message || 'Request failed', response.status)
  return payload
}

export async function getMyOrganization() { return request('/organizations/my') }
export async function createOrganization(data) { return request('/organizations', { method: 'POST', body: JSON.stringify(data) }) }
export async function updateOrganization(data) { return request('/organizations', { method: 'PUT', body: JSON.stringify(data) }) }
export async function uploadOrgLogo(file) { const fd = new FormData(); fd.append('logo', file); return request('/organizations/logo', { method: 'POST', body: fd }) }
export async function updateBranding(data) { return request('/organizations/branding', { method: 'PUT', body: JSON.stringify(data) }) }
export async function requestVerification(documents = {}) { return request('/organizations/verification', { method: 'POST', body: JSON.stringify({ documents }) }) }
export async function verifyOrganization(orgId, status) { return request(`/organizations/${orgId}/verify`, { method: 'PUT', body: JSON.stringify({ status }) }) }
export async function addRecruiter(data) { return request('/organizations/recruiters', { method: 'POST', body: JSON.stringify(data) }) }
export async function updateRecruiter(recruiterId, data) { return request(`/organizations/recruiters/${recruiterId}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function removeRecruiter(recruiterId) { return request(`/organizations/recruiters/${recruiterId}`, { method: 'DELETE' }) }
export async function getEmployerDashboard() { return request('/organizations/dashboard') }
export async function listOrganizations(params = {}) { const q = new URLSearchParams(); if (params.page) q.set('page', params.page); if (params.verified) q.set('verified', params.verified); return request(`/organizations/public?${q}`) }
export async function getOrganizationById(orgId) { return request(`/organizations/public/${orgId}`) }
