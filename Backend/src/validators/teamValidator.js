function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function buildValidationResult(errors) {
  return { isValid: errors.length === 0, errors, message: errors.length > 0 ? errors[0] : null }
}

export function validateTeamCreatePayload(payload = {}) {
  const errors = []
  if (!payload.name || !isNonEmpty(payload.name)) errors.push('Team name is required')
  else if (payload.name.length > 160) errors.push('Team name must be 160 characters or less')
  if (payload.description && payload.description.length > 4000) errors.push('Description must be 4000 characters or less')
  return buildValidationResult(errors)
}

export function validateTeamUpdatePayload(payload = {}) {
  const errors = []
  if (payload.name !== undefined && (!isNonEmpty(payload.name) || payload.name.length > 160)) errors.push('Name must be between 1 and 160 characters')
  if (payload.description !== undefined && payload.description.length > 4000) errors.push('Description must be 4000 characters or less')
  return buildValidationResult(errors)
}

export function validateTeamMemberInvitePayload(payload = {}) {
  const errors = []
  if (!payload.email && !payload.userId) errors.push('Email or userId is required')
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push('A valid email is required')
  if (payload.role && !['member', 'manager', 'admin'].includes(payload.role)) errors.push('Role must be member, manager, or admin')
  return buildValidationResult(errors)
}
