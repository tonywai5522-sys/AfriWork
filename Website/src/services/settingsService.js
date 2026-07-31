import { API_BASE } from './apiClient.js'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const config = { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, credentials: 'include', ...options }
  const res = await fetch(url, config)
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.message || 'Request failed')
  return payload
}

export async function getFullSettings() {
  return request('/settings')
}

export async function getAccountSettings() {
  return request('/settings/account')
}

export async function updateAccountSettings(data) {
  return request('/settings/account', { method: 'PUT', body: JSON.stringify(data) })
}

export async function getSecuritySettings() {
  return request('/settings/security')
}

export async function updateSecuritySettings(data) {
  return request('/settings/security', { method: 'PUT', body: JSON.stringify(data) })
}

export async function changePassword(currentPassword, newPassword, confirmNewPassword) {
  return request('/settings/security/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  })
}

export async function getPrivacySettings() {
  return request('/settings/privacy')
}

export async function updatePrivacySettings(data) {
  return request('/settings/privacy', { method: 'PUT', body: JSON.stringify(data) })
}

export async function getNotificationSettings() {
  return request('/settings/notifications')
}

export async function updateNotificationSettings(data) {
  return request('/settings/notifications', { method: 'PUT', body: JSON.stringify(data) })
}

export async function getConnectedAccounts() {
  return request('/settings/connected-accounts')
}

export async function connectAccount(data) {
  return request('/settings/connected-accounts', { method: 'POST', body: JSON.stringify(data) })
}

export async function disconnectAccount(accountId) {
  return request(`/settings/connected-accounts/${accountId}`, { method: 'DELETE' })
}
