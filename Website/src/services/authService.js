const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class AuthServiceError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'AuthServiceError'
    this.status = status
    this.errors = errors || []
  }
}

/**
 * Retrieve the stored session token from localStorage.
 * The login/register responses include a session id which we store
 * and send as Bearer token on all authenticated requests.
 */
function getSessionToken() {
  return localStorage.getItem('afriwork_session_token') || ''
}

/**
 * Store the session token from a login/register response.
 */
function setSessionToken(response) {
  const token = response?.data?.session?.id || response?.session?.id
  if (token) {
    localStorage.setItem('afriwork_session_token', token)
  }
}

export function clearSessionToken() {
  localStorage.removeItem('afriwork_session_token')
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const token = getSessionToken()

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  }

  let response
  try {
    response = await fetch(url, config)
  } catch (networkError) {
    throw new AuthServiceError(
      'Unable to connect to the server. Please check your internet connection.',
      0
    )
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new AuthServiceError('Invalid response from server', response.status)
  }

  if (!response.ok) {
    // If 401, clear the stored token — session expired
    if (response.status === 401) {
      clearSessionToken()
    }

    const errorMessage = Array.isArray(payload.message)
      ? payload.message[0]
      : payload.message || 'Request failed'

    throw new AuthServiceError(
      errorMessage,
      response.status,
      Array.isArray(payload.message) ? payload.message : []
    )
  }

  return payload
}

// ─── Authentication ────────────────────────────────────

export async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setSessionToken(res)
  return res
}

export async function register(payload) {
  const res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setSessionToken(res)
  return res
}

export async function logout() {
  clearSessionToken()
  return request('/auth/logout', {
    method: 'POST',
  })
}

export async function logoutAll() {
  clearSessionToken()
  return request('/auth/logout-all', {
    method: 'POST',
  })
}

// ─── Session Management ────────────────────────────────

export async function getSession() {
  return request('/auth/session')
}

export async function listSessions() {
  return request('/auth/sessions')
}

export async function revokeSession(sessionId) {
  return request(`/auth/sessions/${sessionId}`, {
    method: 'DELETE',
  })
}

// ─── User Profile ───────────────────────────────────────

export async function getProfile() {
  return request('/auth/profile')
}

export async function updateProfile(data) {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function getMe() {
  return request('/auth/me')
}

// ─── Password Management ────────────────────────────────

export async function forgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(userId, secret, password, confirmPassword) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ userId, secret, password, confirmPassword }),
  })
}

export async function changePassword(currentPassword, newPassword, confirmNewPassword) {
  return request('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  })
}

// ─── Email Verification ────────────────────────────────

export async function sendVerificationEmail() {
  return request('/auth/verification-email', {
    method: 'POST',
  })
}

export async function confirmVerification(userId, secret) {
  return request('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ userId, secret }),
  })
}
