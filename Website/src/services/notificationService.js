const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class NotifError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'NotifError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  }
  let response
  try {
    response = await fetch(url, config)
  } catch {
    throw new NotifError('Unable to connect to server', 0)
  }
  const payload = await response.json()
  if (!response.ok) throw new NotifError(payload.message || 'Request failed', response.status)
  return payload
}

export async function getNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
  return request(`/notifications?page=${page}&limit=${limit}&unread=${unreadOnly}`)
}

export async function getUnreadCount() {
  return request('/notifications/unread-count')
}

export async function markAsRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, { method: 'POST' })
}

export async function markAllAsRead() {
  return request('/notifications/read-all', { method: 'POST' })
}

export async function deleteNotification(notificationId) {
  return request(`/notifications/${notificationId}`, { method: 'DELETE' })
}

export async function getPreferences() {
  return request('/notifications/preferences')
}

export async function updatePreferences(data) {
  return request('/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
