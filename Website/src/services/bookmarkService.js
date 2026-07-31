import { API_BASE } from './apiClient.js'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const config = { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, credentials: 'include', ...options }
  const res = await fetch(url, config)
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.message || 'Request failed')
  return payload
}

export async function toggleBookmark(targetType, targetId) {
  return request('/bookmarks/toggle', { method: 'POST', body: JSON.stringify({ targetType, targetId }) })
}

export async function isBookmarked(targetType, targetId) {
  return request(`/bookmarks/check/${targetType}/${targetId}`)
}

export async function getBookmarkedIds(targetType) {
  return request(`/bookmarks/ids/${targetType}`)
}

export async function getUserBookmarks(params = {}) {
  const q = new URLSearchParams()
  if (params.type) q.set('type', params.type)
  if (params.page) q.set('page', params.page)
  if (params.populated !== undefined) q.set('populated', params.populated ? 'true' : 'false')
  const query = q.toString() ? `?${q}` : ''
  return request(`/bookmarks${query}`)
}

export async function getAllBookmarkIds() {
  return request('/bookmarks/all')
}

export async function removeBookmark(targetType, targetId) {
  return request(`/bookmarks/${targetType}/${targetId}`, { method: 'DELETE' })
}
