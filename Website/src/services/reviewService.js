const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class ReviewError extends Error {
  constructor(message, status) { super(message); this.name = 'ReviewError'; this.status = status }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const config = { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, credentials: 'include', ...options }
  let response
  try { response = await fetch(url, config) } catch { throw new ReviewError('Unable to connect', 0) }
  const payload = await response.json()
  if (!response.ok) throw new ReviewError(payload.message || 'Failed', response.status)
  return payload
}

export async function createReview(data) {
  return request('/reviews', { method: 'POST', body: JSON.stringify(data) })
}

export async function getReviews(targetType, targetId, { page = 1, limit = 20, sortBy = 'date', status = 'approved' } = {}) {
  return request(`/reviews/${targetType}/${targetId}?page=${page}&limit=${limit}&sortBy=${sortBy}&status=${status}`)
}

export async function getRatingSummary(targetType, targetId) {
  return request(`/reviews/summary/${targetType}/${targetId}`)
}

export async function getMyReview(targetType, targetId) {
  return request(`/reviews/my/${targetType}/${targetId}`)
}

export async function getMyReviews(page = 1) {
  return request(`/reviews/my?page=${page}`)
}

export async function updateReview(id, data) {
  return request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteReview(id) {
  return request(`/reviews/${id}`, { method: 'DELETE' })
}

export async function markHelpful(id) {
  return request(`/reviews/${id}/helpful`, { method: 'POST' })
}

export async function addReply(id, body) {
  return request(`/reviews/${id}/reply`, { method: 'POST', body: JSON.stringify({ body }) })
}

export async function reportReview(id, reason = '') {
  return request(`/reviews/${id}/report`, { method: 'POST', body: JSON.stringify({ reason }) })
}

export async function moderateReview(id, status) {
  return request(`/reviews/${id}/moderate`, { method: 'POST', body: JSON.stringify({ status }) })
}

export async function getPendingReviews(page = 1) {
  return request(`/reviews/moderation/pending?page=${page}`)
}

export async function getFlaggedReviews(page = 1) {
  return request(`/reviews/moderation/flagged?page=${page}`)
}

export async function canReview(targetType, targetId) {
  return request(`/reviews/can-review/${targetType}/${targetId}`)
}
