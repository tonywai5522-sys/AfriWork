const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

class CertificationServiceError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'CertificationServiceError'
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

  let response
  try {
    response = await fetch(url, config)
  } catch {
    throw new CertificationServiceError('Unable to connect to the server', 0)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new CertificationServiceError('Invalid response from server', response.status)
  }

  if (!response.ok) {
    throw new CertificationServiceError(
      Array.isArray(payload.message) ? payload.message[0] : payload.message || 'Request failed',
      response.status,
      Array.isArray(payload.message) ? payload.message : []
    )
  }

  return payload
}

export async function getCertifications() {
  return request('/certifications')
}

export async function addCertification(data) {
  return request('/certifications', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAllCertifications(certifications) {
  return request('/certifications', {
    method: 'PUT',
    body: JSON.stringify({ certifications }),
  })
}

export async function updateCertification(certId, data) {
  return request(`/certifications/${certId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCertification(certId) {
  return request(`/certifications/${certId}`, {
    method: 'DELETE',
  })
}
