const APPLICATION_STATUSES = ['pending', 'reviewed', 'accepted', 'rejected', 'withdrawn']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR', 'GHS', 'ETB']

function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidUrl(url) {
  if (!url) return true
  try { new URL(url); return true } catch { return false }
}

function buildResult(errors) {
  return { isValid: errors.length === 0, errors, message: errors[0] || null }
}

export function validateApplicationCreatePayload(payload = {}) {
  const errors = []

  if (!payload.jobId || !isNonEmpty(payload.jobId)) {
    errors.push('Job ID is required')
  }

  if (payload.coverLetter && payload.coverLetter.length > 8000) {
    errors.push('Cover letter must be 8000 characters or less')
  }

  if (payload.portfolioUrl && !isValidUrl(payload.portfolioUrl)) {
    errors.push('Portfolio URL must be a valid URL')
  }

  if (payload.resumeUrl && !isValidUrl(payload.resumeUrl)) {
    errors.push('Resume URL must be a valid URL')
  }

  if (payload.proposedRate !== undefined && (typeof payload.proposedRate !== 'number' || payload.proposedRate < 0)) {
    errors.push('Proposed rate must be a positive number')
  }

  if (payload.currency && !CURRENCIES.includes(payload.currency)) {
    errors.push(`Currency must be one of: ${CURRENCIES.join(', ')}`)
  }

  return buildResult(errors)
}

export function validateApplicationUpdatePayload(payload = {}) {
  const errors = []

  if (payload.status && !APPLICATION_STATUSES.includes(payload.status)) {
    errors.push(`Status must be one of: ${APPLICATION_STATUSES.join(', ')}`)
  }

  if (payload.reviewNotes !== undefined && payload.reviewNotes.length > 4000) {
    errors.push('Review notes must be 4000 characters or less')
  }

  if (payload.coverLetter !== undefined && payload.coverLetter.length > 8000) {
    errors.push('Cover letter must be 8000 characters or less')
  }

  if (payload.proposedRate !== undefined && (typeof payload.proposedRate !== 'number' || payload.proposedRate < 0)) {
    errors.push('Proposed rate must be a positive number')
  }

  return buildResult(errors)
}

export { APPLICATION_STATUSES, CURRENCIES }
