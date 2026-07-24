const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class TalentServiceError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'TalentServiceError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  }
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, config)
  } catch {
    throw new TalentServiceError('Unable to connect to the server', 0)
  }
  let payload
  try {
    payload = await response.json()
  } catch {
    throw new TalentServiceError('Invalid response', response.status)
  }
  if (!response.ok) {
    throw new TalentServiceError(payload.message || 'Request failed', response.status)
  }
  return payload
}

export async function searchTalents(params = {}) {
  const query = new URLSearchParams()
  if (params.query) query.set('query', params.query)
  if (params.skills?.length) query.set('skills', params.skills.join(','))
  if (params.experienceLevel) query.set('experienceLevel', params.experienceLevel)
  if (params.availability) query.set('availability', params.availability)
  if (params.location) query.set('location', params.location)
  if (params.hourlyRateMin !== undefined) query.set('hourlyRateMin', params.hourlyRateMin)
  if (params.hourlyRateMax !== undefined) query.set('hourlyRateMax', params.hourlyRateMax)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortOrder) query.set('sortOrder', params.sortOrder)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  return request(`/talents/search?${query.toString()}`)
}

export async function getTalentById(talentId) {
  return request(`/talents/${talentId}`)
}

export async function getTalentStats() {
  return request('/talents/stats')
}

export async function saveTalent(talentId) {
  return request('/talents/saved', { method: 'POST', body: JSON.stringify({ talentId }) })
}

export async function unsaveTalent(talentId) {
  return request(`/talents/saved/${talentId}`, { method: 'DELETE' })
}

export async function getSavedTalents() {
  return request('/talents/saved/list')
}

export async function getSavedTalentIds() {
  return request('/talents/saved/ids')
}
