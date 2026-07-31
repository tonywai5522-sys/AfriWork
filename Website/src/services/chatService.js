import { API_BASE } from './apiClient.js'

class ChatServiceError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ChatServiceError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  }
  let response
  try {
    response = await fetch(url, config)
  } catch {
    throw new ChatServiceError('Unable to connect to server', 0)
  }
  const payload = await response.json()
  if (!response.ok) {
    throw new ChatServiceError(payload.message || 'Request failed', response.status)
  }
  return payload
}

export async function getConversations() {
  return request('/conversations')
}

export async function getConversation(id) {
  return request(`/conversations/${id}`)
}

export async function createDirectConversation(recipientId, recipientName, recipientEmail, recipientAvatar) {
  return request('/conversations/direct', {
    method: 'POST',
    body: JSON.stringify({ recipientId, recipientName, recipientEmail, recipientAvatar }),
  })
}

export async function createGroupConversation(data) {
  return request('/conversations/group', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateConversation(id, data) {
  return request(`/conversations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteConversation(id) {
  return request(`/conversations/${id}`, { method: 'DELETE' })
}

export async function addParticipant(conversationId, data) {
  return request(`/conversations/${conversationId}/participants`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function removeParticipant(conversationId, userId) {
  return request(`/conversations/${conversationId}/participants/${userId}`, { method: 'DELETE' })
}

export async function markConversationRead(conversationId) {
  return request(`/conversations/${conversationId}/read`, { method: 'POST' })
}

export async function getMessages(conversationId, { page = 1, limit = 50 } = {}) {
  return request(`/messages/${conversationId}?page=${page}&limit=${limit}`)
}

export async function sendMessage(conversationId, formData) {
  const url = `${API_BASE}/messages/${conversationId}`
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const payload = await response.json()
  if (!response.ok) throw new ChatServiceError(payload.message || 'Failed to send', response.status)
  return payload
}

export async function sendTextMessage(conversationId, content, replyTo = null) {
  return request(`/messages/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({ content, replyTo }),
  })
}

export async function editMessage(messageId, content) {
  return request(`/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export async function deleteMessage(messageId) {
  return request(`/messages/${messageId}`, { method: 'DELETE' })
}

export async function addReaction(messageId, emoji) {
  return request(`/messages/${messageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ emoji }),
  })
}

export async function uploadAttachment(file) {
  const formData = new FormData()
  formData.append('file', file)
  const url = `${API_BASE}/messages/upload`
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const payload = await response.json()
  if (!response.ok) throw new ChatServiceError(payload.message || 'Upload failed', response.status)
  return payload
}
