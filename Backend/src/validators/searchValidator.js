const ALLOWED_TYPES = ['all', 'users', 'jobs', 'projects', 'organizations', 'teams', 'skills']
const ALLOWED_SORT = ['relevance', 'newest', 'oldest', 'name']

export function validateSearchParams(data) {
  const errors = []

  if (data.type && !ALLOWED_TYPES.includes(data.type)) {
    errors.push(`Invalid type. Allowed: ${ALLOWED_TYPES.join(', ')}`)
  }

  if (data.sortBy && !ALLOWED_SORT.includes(data.sortBy)) {
    errors.push(`Invalid sortBy. Allowed: ${ALLOWED_SORT.join(', ')}`)
  }

  if (data.page !== undefined) {
    const page = parseInt(data.page, 10)
    if (isNaN(page) || page < 1) errors.push('page must be a positive integer')
  }

  if (data.limit !== undefined) {
    const limit = parseInt(data.limit, 10)
    if (isNaN(limit) || limit < 1 || limit > 50) errors.push('limit must be between 1 and 50')
  }

  return {
    isValid: errors.length === 0,
    message: errors.join('; '),
  }
}
