function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function buildValidationResult(errors) {
  return { isValid: errors.length === 0, errors, message: errors.length > 0 ? errors[0] : null }
}

export function validateCommentCreatePayload(payload = {}) {
  const errors = []
  if (!payload.entityType || !isNonEmpty(payload.entityType)) errors.push('Entity type is required')
  if (!payload.entityId || !isNonEmpty(payload.entityId)) errors.push('Entity ID is required')
  if (!payload.content || !isNonEmpty(payload.content)) errors.push('Content is required')
  else if (payload.content.length > 16000) errors.push('Content must be 16000 characters or less')
  return buildValidationResult(errors)
}

export function validateCommentUpdatePayload(payload = {}) {
  const errors = []
  if (!payload.content || !isNonEmpty(payload.content)) errors.push('Content is required')
  else if (payload.content.length > 16000) errors.push('Content must be 16000 characters or less')
  return buildValidationResult(errors)
}