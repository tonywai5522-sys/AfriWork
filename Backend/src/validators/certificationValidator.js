function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidUrl(url) {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function buildValidationResult(errors) {
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors[0] : null,
  }
}

export function validateCertificationPayload(payload = {}) {
  const errors = []

  if (!payload.name || !isNonEmpty(payload.name)) {
    errors.push('Certification name is required')
  } else if (payload.name.length > 220) {
    errors.push('Certification name must be 220 characters or less')
  }

  if (!payload.issuer || !isNonEmpty(payload.issuer)) {
    errors.push('Issuer is required')
  } else if (payload.issuer.length > 160) {
    errors.push('Issuer must be 160 characters or less')
  }

  if (!payload.issueDate) {
    errors.push('Issue date is required')
  } else {
    const d = new Date(payload.issueDate)
    if (isNaN(d.getTime())) {
      errors.push('Issue date must be a valid date')
    }
  }

  if (payload.expiryDate && !payload.doesNotExpire) {
    const expiry = new Date(payload.expiryDate)
    if (isNaN(expiry.getTime())) {
      errors.push('Expiry date must be a valid date')
    }
    if (payload.issueDate && !isNaN(expiry.getTime())) {
      const issue = new Date(payload.issueDate)
      if (!isNaN(issue.getTime()) && expiry < issue) {
        errors.push('Expiry date cannot be before issue date')
      }
    }
  }

  if (payload.credentialUrl && !isValidUrl(payload.credentialUrl)) {
    errors.push('Credential URL must be a valid URL')
  }

  if (payload.credentialId && payload.credentialId.length > 120) {
    errors.push('Credential ID must be 120 characters or less')
  }

  if (payload.description && payload.description.length > 2000) {
    errors.push('Description must be 2000 characters or less')
  }

  return buildValidationResult(errors)
}
