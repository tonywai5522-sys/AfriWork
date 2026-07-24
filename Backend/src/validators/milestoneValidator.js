function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function buildValidationResult(errors) {
  return { isValid: errors.length === 0, errors, message: errors.length > 0 ? errors[0] : null }
}

export function validateMilestoneCreatePayload(payload = {}) {
  const errors = []
  if (!payload.title || !isNonEmpty(payload.title)) errors.push('Milestone title is required')
  else if (payload.title.length > 200) errors.push('Milestone title must be 200 characters or less')
  if (!payload.projectId || !isNonEmpty(payload.projectId)) errors.push('Project ID is required')
  if (payload.dueDate !== undefined && isNaN(Date.parse(payload.dueDate))) errors.push('Due date is not valid')
  if (payload.status !== undefined && !['pending', 'in_progress', 'completed', 'cancelled'].includes(payload.status)) errors.push('Status must be pending, in_progress, completed, or cancelled')
  if (payload.budget !== undefined && (typeof payload.budget !== 'number' || payload.budget < 0)) errors.push('Budget must be a positive number')
  return buildValidationResult(errors)
}

export function validateMilestoneUpdatePayload(payload = {}) {
  const errors = []
  if (payload.title !== undefined && (!isNonEmpty(payload.title) || payload.title.length > 200)) errors.push('Milestone title must be between 1 and 200 characters')
  if (payload.projectId !== undefined && !isNonEmpty(payload.projectId)) errors.push('Project ID must be a non-empty string')
  if (payload.dueDate !== undefined && isNaN(Date.parse(payload.dueDate))) errors.push('Due date is not valid')
  if (payload.status !== undefined && !['pending', 'in_progress', 'completed', 'cancelled'].includes(payload.status)) errors.push('Status must be pending, in_progress, completed, or cancelled')
  if (payload.budget !== undefined && (typeof payload.budget !== 'number' || payload.budget < 0)) errors.push('Budget must be a positive number')
  return buildValidationResult(errors)
}