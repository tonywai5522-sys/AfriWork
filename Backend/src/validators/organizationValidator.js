function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidUrl(url) {
  if (!url) return true
  try { new URL(url); return true }
  catch { return false }
}

function isValidSlug(slug) {
  return /^[a-z0-9-]{3,80}$/.test(slug)
}

function buildValidationResult(errors) {
  return { isValid: errors.length === 0, errors, message: errors.length > 0 ? errors[0] : null }
}

export function validateOrganizationCreatePayload(payload = {}) {
  const errors = []
  if (!payload.name || !isNonEmpty(payload.name)) errors.push('Organization name is required')
  else if (payload.name.length > 200) errors.push('Name must be 200 characters or less')
  if (payload.slug && !isValidSlug(payload.slug)) errors.push('Slug must be 3-80 characters, lowercase, numbers, and hyphens only')
  if (payload.description && payload.description.length > 4000) errors.push('Description must be 4000 characters or less')
  if (payload.website && !isValidUrl(payload.website)) errors.push('Website must be a valid URL')
  if (payload.industry && payload.industry.length > 120) errors.push('Industry must be 120 characters or less')
  if (payload.location && payload.location.length > 180) errors.push('Location must be 180 characters or less')
  return buildValidationResult(errors)
}

export function validateOrganizationUpdatePayload(payload = {}) {
  const errors = []
  if (payload.name !== undefined && (!isNonEmpty(payload.name) || payload.name.length > 200)) errors.push('Name must be between 1 and 200 characters')
  if (payload.slug !== undefined && !isValidSlug(payload.slug)) errors.push('Slug must be 3-80 characters, lowercase, numbers, and hyphens only')
  if (payload.description !== undefined && payload.description.length > 4000) errors.push('Description must be 4000 characters or less')
  if (payload.website !== undefined && !isValidUrl(payload.website)) errors.push('Website must be a valid URL')
  if (payload.industry !== undefined && payload.industry.length > 120) errors.push('Industry must be 120 characters or less')
  if (payload.location !== undefined && payload.location.length > 180) errors.push('Location must be 180 characters or less')
  return buildValidationResult(errors)
}

export function validateRecruiterInvitePayload(payload = {}) {
  const errors = []
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push('A valid email is required')
  if (payload.role && !['recruiter', 'manager', 'admin'].includes(payload.role)) errors.push('Role must be recruiter, manager, or admin')
  return buildValidationResult(errors)
}
