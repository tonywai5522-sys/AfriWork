const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class TeamServiceError extends Error {
  constructor(message, status) { super(message); this.name = 'TeamServiceError'; this.status = status }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', ...options,
  }
  if (options.body instanceof FormData) delete config.headers['Content-Type']
  let response
  try { response = await fetch(`${API_BASE_URL}${path}`, config) } catch { throw new TeamServiceError('Connection failed', 0) }
  let payload
  try { payload = await response.json() } catch { throw new TeamServiceError('Invalid response', response.status) }
  if (!response.ok) throw new TeamServiceError(payload.message || 'Request failed', response.status)
  return payload
}

export async function getMyTeams() { return request('/teams') }
export async function createTeam(data) { return request('/teams', { method: 'POST', body: JSON.stringify(data) }) }
export async function getTeamById(teamId) { return request(`/teams/${teamId}`) }
export async function updateTeam(teamId, data) { return request(`/teams/${teamId}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function deleteTeam(teamId) { return request(`/teams/${teamId}`, { method: 'DELETE' }) }
export async function addTeamMember(teamId, data) { return request(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify(data) }) }
export async function updateTeamMember(teamId, memberId, data) { return request(`/teams/${teamId}/members/${memberId}`, { method: 'PUT', body: JSON.stringify(data) }) }
export async function removeTeamMember(teamId, memberId) { return request(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' }) }
export async function acceptInvitation(teamId) { return request(`/teams/${teamId}/accept`, { method: 'POST' }) }
export async function listTeams(params = {}) { const q = new URLSearchParams(); if (params.page) q.set('page', params.page); if (params.organizationId) q.set('organizationId', params.organizationId); return request(`/teams/public/list?${q}`) }
