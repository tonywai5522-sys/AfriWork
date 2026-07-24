function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function buildValidationResult(errors) {
  return { isValid: errors.length === 0, errors, message: errors.length > 0 ? errors[0] : null }
}

export function validateProjectCreatePayload(payload = {}) {
  const errors = []
  if (!payload.title || !isNonEmpty(payload.title)) errors.push('Project title is required')
  else if (payload.title.length > 200) errors.push('Project title must be 200 characters or less')
  if (payload.description !== undefined && payload.description.length > 5000) errors.push('Description must be 5000 characters or less')
  if (payload.visibility !== undefined && !['private', 'team', 'public'].includes(payload.visibility)) errors.push('Visibility must be private, team, or public')
  if (payload.budget !== undefined && (typeof payload.budget !== 'number' || payload.budget < 0)) errors.push('Budget must be a positive number')
  if (payload.startDate !== undefined && isNaN(Date.parse(payload.startDate))) errors.push('Start date is not valid')
  if (payload.endDate !== undefined && isNaN(Date.parse(payload.endDate))) errors.push('End date is not valid')
  if (payload.startDate && payload.endDate && !isNaN(Date.parse(payload.startDate)) && !isNaN(Date.parse(payload.endDate)) && new Date(payload.endDate) < new Date(payload.startDate)) errors.push('End date must be after start date')
  return buildValidationResult(errors)
}

export function validateProjectUpdatePayload(payload = {}) {
  const errors = []
  if (payload.title !== undefined && (!isNonEmpty(payload.title) || payload.title.length > 200)) errors.push('Project title must be between 1 and 200 characters')
  if (payload.description !== undefined && payload.description.length > 5000) errors.push('Description must be 5000 characters or less')
  if (payload.visibility !== undefined && !['private', 'team', 'public'].includes(payload.visibility)) errors.push('Visibility must be private, team, or public')
  if (payload.budget !== undefined && (typeof payload.budget !== 'number' || payload.budget < 0)) errors.push('Budget must be a positive number')
  if (payload.startDate !== undefined && isNaN(Date.parse(payload.startDate))) errors.push('Start date is not valid')
  if (payload.endDate !== undefined && isNaN(Date.parse(payload.endDate))) errors.push('End date is not valid')
  if (payload.startDate && payload.endDate && !isNaN(Date.parse(payload.startDate)) && !isNaN(Date.parse(payload.endDate)) && new Date(payload.endDate) < new Date(payload.startDate)) errors.push('End date must be after start date')
  return buildValidationResult(errors)
}

export function validateProjectMemberInvitePayload(payload = {}) {
  const errors = []
  if (!payload.email && !payload.userId) errors.push('Email or userId is required')
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push('A valid email is required')
  if (payload.role && !['member', 'manager', 'admin'].includes(payload.role)) errors.push('Role must be member, manager, or admin')
  return buildValidationResult(errors)
}