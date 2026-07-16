export function validateLoginPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: 'Payload must be an object' }
  }

  if (!payload.email || !payload.password) {
    return { valid: false, message: 'Email and password are required' }
  }

  return { valid: true }
}
