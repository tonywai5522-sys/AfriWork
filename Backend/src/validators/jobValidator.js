function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'volunteer']
const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'expert']
const JOB_STATUSES = ['draft', 'active', 'closed', 'paused', 'archived']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR', 'GHS', 'ETB']

function buildResult(errors) {
  return { isValid: errors.length === 0, errors, message: errors[0] || null }
}

export function validateJobCreatePayload(payload = {}) {
  const errors = []
  if (!payload.title || !isNonEmpty(payload.title)) errors.push('Job title is required')
  else if (payload.title.length > 200) errors.push('Title must be 200 characters or less')

  if (!payload.description || !isNonEmpty(payload.description)) errors.push('Description is required')
  else if (payload.description.length > 8000) errors.push('Description must be 8000 characters or less')

  if (payload.jobType && !JOB_TYPES.includes(payload.jobType)) errors.push(`Job type must be: ${JOB_TYPES.join(', ')}`)
  if (payload.experienceLevel && !EXPERIENCE_LEVELS.includes(payload.experienceLevel)) errors.push(`Experience level must be: ${EXPERIENCE_LEVELS.join(', ')}`)
  if (payload.status && !JOB_STATUSES.includes(payload.status)) errors.push(`Status must be: ${JOB_STATUSES.join(', ')}`)
  if (payload.currency && !CURRENCIES.includes(payload.currency)) errors.push(`Currency must be: ${CURRENCIES.join(', ')}`)
  if (payload.salaryMin !== undefined && payload.salaryMin < 0) errors.push('Salary min must be positive')
  if (payload.salaryMax !== undefined && payload.salaryMax < 0) errors.push('Salary max must be positive')
  if (payload.salaryMin && payload.salaryMax && payload.salaryMin > payload.salaryMax) errors.push('Salary min cannot exceed salary max')
  if (payload.skills && !Array.isArray(payload.skills)) errors.push('Skills must be an array')
  if (payload.remote !== undefined && typeof payload.remote !== 'boolean') errors.push('Remote must be true or false')

  return buildResult(errors)
}

export function validateJobUpdatePayload(payload = {}) {
  const errors = []
  if (payload.title !== undefined && (!isNonEmpty(payload.title) || payload.title.length > 200)) errors.push('Title must be between 1-200 characters')
  if (payload.description !== undefined && (!isNonEmpty(payload.description) || payload.description.length > 8000)) errors.push('Description must be 1-8000 characters')
  if (payload.jobType && !JOB_TYPES.includes(payload.jobType)) errors.push(`Job type must be: ${JOB_TYPES.join(', ')}`)
  if (payload.experienceLevel && !EXPERIENCE_LEVELS.includes(payload.experienceLevel)) errors.push(`Experience level must be: ${EXPERIENCE_LEVELS.join(', ')}`)
  if (payload.status && !JOB_STATUSES.includes(payload.status)) errors.push(`Status must be: ${JOB_STATUSES.join(', ')}`)
  if (payload.salaryMin !== undefined && payload.salaryMin < 0) errors.push('Salary min must be positive')
  if (payload.salaryMax !== undefined && payload.salaryMax < 0) errors.push('Salary max must be positive')
  if (payload.skills && !Array.isArray(payload.skills)) errors.push('Skills must be an array')
  return buildResult(errors)
}
