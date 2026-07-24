function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function buildValidationResult(errors) {
  return { isValid: errors.length === 0, errors, message: errors.length > 0 ? errors[0] : null }
}

export function validateTaskCreatePayload(payload = {}) {
  const errors = []
  if (!payload.title || !isNonEmpty(payload.title)) errors.push('Task title is required')
  else if (payload.title.length > 300) errors.push('Task title must be 300 characters or less')
  if (!payload.projectId || !isNonEmpty(payload.projectId)) errors.push('Project ID is required')
  if (!payload.taskListId || !isNonEmpty(payload.taskListId)) errors.push('Task list ID is required')
  if (payload.priority !== undefined && !['none', 'low', 'medium', 'high', 'urgent'].includes(payload.priority)) errors.push('Priority must be none, low, medium, high, or urgent')
  if (payload.status !== undefined && !['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'].includes(payload.status)) errors.push('Status must be backlog, todo, in_progress, in_review, done, or cancelled')
  if (payload.estimatedHours !== undefined && (typeof payload.estimatedHours !== 'number' || payload.estimatedHours < 0)) errors.push('Estimated hours must be a positive number')
  if (payload.dueDate !== undefined && isNaN(Date.parse(payload.dueDate))) errors.push('Due date is not valid')
  return buildValidationResult(errors)
}

export function validateTaskUpdatePayload(payload = {}) {
  const errors = []
  if (payload.title !== undefined && (!isNonEmpty(payload.title) || payload.title.length > 300)) errors.push('Task title must be between 1 and 300 characters')
  if (payload.projectId !== undefined && !isNonEmpty(payload.projectId)) errors.push('Project ID must be a non-empty string')
  if (payload.taskListId !== undefined && !isNonEmpty(payload.taskListId)) errors.push('Task list ID must be a non-empty string')
  if (payload.priority !== undefined && !['none', 'low', 'medium', 'high', 'urgent'].includes(payload.priority)) errors.push('Priority must be none, low, medium, high, or urgent')
  if (payload.status !== undefined && !['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'].includes(payload.status)) errors.push('Status must be backlog, todo, in_progress, in_review, done, or cancelled')
  if (payload.estimatedHours !== undefined && (typeof payload.estimatedHours !== 'number' || payload.estimatedHours < 0)) errors.push('Estimated hours must be a positive number')
  if (payload.dueDate !== undefined && isNaN(Date.parse(payload.dueDate))) errors.push('Due date is not valid')
  return buildValidationResult(errors)
}