/**
 * Centralized API client for AfriWork Website frontend.
 *
 * Normalizes the base URL so it always includes `/api/v1`, regardless
 * of whether VITE_API_URL is set to the bare domain or the full path.
 */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Ensure the URL always ends with `/api/v1` (no double-slashes, no trailing slash)
const API_BASE = BASE.replace(/\/+$/, '')       // strip trailing slashes
  .replace(/\/api\/v1\/?$/, '/api/v1')           // normalize /api/v1 suffix
  + (BASE.includes('/api/v1') ? '' : '/api/v1')  // append /api/v1 if missing

export { API_BASE }

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors || []
  }
}

/**
 * Generic authenticated/unauthenticated request helper.
 *
 * @param {string} path       — e.g. "/auth/register" (without the base URL)
 * @param {object} [options]  — fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} parsed JSON response body
 */
export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`
  const token = localStorage.getItem('afriwork_session_token') || ''

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  }

  let response
  try {
    response = await fetch(url, config)
  } catch {
    throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('Invalid response from server', response.status)
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('afriwork_session_token')
    }
    const errorMessage = Array.isArray(payload.message)
      ? payload.message[0]
      : payload.message || 'Request failed'
    throw new ApiError(errorMessage, response.status, Array.isArray(payload.message) ? payload.message : [])
  }

  return payload
}
