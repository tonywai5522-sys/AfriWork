const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class ProfileServiceError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ProfileServiceError'
    this.status = status
    this.errors = errors || []
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  }

  if (options.body instanceof FormData) {
    delete config.headers['Content-Type']
  }

  let response
  try {
    response = await fetch(url, config)
  } catch {
    throw new ProfileServiceError('Unable to connect to the server', 0)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ProfileServiceError('Invalid response from server', response.status)
  }

  if (!response.ok) {
    throw new ProfileServiceError(
      Array.isArray(payload.message) ? payload.message[0] : payload.message || 'Request failed',
      response.status,
      Array.isArray(payload.message) ? payload.message : []
    )
  }

  return payload
}

export async function getProfile() {
  return request('/profile')
}

export async function createProfile(data) {
  return request('/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProfile(data) {
  return request('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function updateSkills(skills) {
  return request('/profile/skills', {
    method: 'PUT',
    body: JSON.stringify({ skills }),
  })
}

export async function updateExperience(experience) {
  return request('/profile/experience', {
    method: 'PUT',
    body: JSON.stringify({ experience }),
  })
}

export async function updateEducation(education) {
  return request('/profile/education', {
    method: 'PUT',
    body: JSON.stringify({ education }),
  })
}

export async function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  return request('/profile/avatar', {
    method: 'POST',
    body: formData,
  })
}

export async function deleteAvatar() {
  return request('/profile/avatar', {
    method: 'DELETE',
  })
}

export async function getProfileCompleteness() {
  return request('/profile/completeness')
}

export async function getPublicProfile(userId) {
  return request(`/profile/public/${userId}`)
}
