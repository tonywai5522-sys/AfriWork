/**
 * Authentication service.
 *
 * All requests go through the centralized apiClient which normalizes
 * the API base URL so `/api/v1` is always present — even if the
 * VITE_API_URL env var is set to just the bare domain.
 */
import { apiRequest, ApiError } from './apiClient.js'

export { ApiError }

// ─── Session Token Helpers ─────────────────────────────

function getSessionToken() {
  return localStorage.getItem('afriwork_session_token') || ''
}

function setSessionToken(response) {
  const token = response?.data?.session?.id || response?.session?.id
  if (token) {
    localStorage.setItem('afriwork_session_token', token)
  }
}

export function clearSessionToken() {
  localStorage.removeItem('afriwork_session_token')
}

// ─── Authentication ────────────────────────────────────

export async function login(email, password) {
  const res = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setSessionToken(res)
  return res
}

export async function register(payload) {
  const res = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setSessionToken(res)
  return res
}

export async function logout() {
  clearSessionToken()
  return apiRequest('/auth/logout', { method: 'POST' })
}

export async function logoutAll() {
  clearSessionToken()
  return apiRequest('/auth/logout-all', { method: 'POST' })
}

// ─── Session Management ────────────────────────────────

export async function getSession() {
  return apiRequest('/auth/session')
}

export async function listSessions() {
  return apiRequest('/auth/sessions')
}

export async function revokeSession(sessionId) {
  return apiRequest(`/auth/sessions/${sessionId}`, { method: 'DELETE' })
}

// ─── User Profile ───────────────────────────────────────

export async function getProfile() {
  return apiRequest('/auth/profile')
}

export async function updateProfile(data) {
  return apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function getMe() {
  return apiRequest('/auth/me')
}

// ─── Password Management ────────────────────────────────

export async function forgotPassword(email) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(userId, secret, password, confirmPassword) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ userId, secret, password, confirmPassword }),
  })
}

export async function changePassword(currentPassword, newPassword, confirmNewPassword) {
  return apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  })
}

// ─── Email Verification ────────────────────────────────

export async function sendVerificationEmail() {
  return apiRequest('/auth/verification-email', { method: 'POST' })
}

export async function confirmVerification(userId, secret) {
  return apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ userId, secret }),
  })
}
