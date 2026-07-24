const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class ResumeServiceError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ResumeServiceError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`

  const config = {
    headers: {
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
    throw new ResumeServiceError('Unable to connect to the server', 0)
  }

  return response
}

export async function getResumeInfo() {
  const response = await request('/resume')
  const payload = await response.json()
  if (!response.ok) {
    throw new ResumeServiceError(payload.message || 'Failed to get resume info', response.status)
  }
  return payload
}

export async function uploadResume(file) {
  const formData = new FormData()
  formData.append('resume', file)
  const response = await request('/resume', {
    method: 'POST',
    body: formData,
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new ResumeServiceError(payload.message || 'Failed to upload resume', response.status)
  }
  return payload
}

export async function deleteResume() {
  const response = await request('/resume', {
    method: 'DELETE',
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new ResumeServiceError(payload.message || 'Failed to delete resume', response.status)
  }
  return payload
}

export async function downloadResume() {
  const response = await request('/resume/download')
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new ResumeServiceError(payload.message || 'Failed to download resume', response.status)
  }
  return response.blob()
}

export async function getPublicResumeUrl(userId) {
  const response = await request(`/resume/public/${userId}`)
  const payload = await response.json()
  if (!response.ok) {
    throw new ResumeServiceError(payload.message || 'Failed to get resume URL', response.status)
  }
  return payload
}
