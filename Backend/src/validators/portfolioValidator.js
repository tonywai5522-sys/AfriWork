const CATEGORIES = ['web_app', 'mobile_app', 'api', 'design', 'data', 'ai', 'blockchain', 'devops', 'open_source', 'freelance', 'other']
const VISIBILITY = ['public', 'private', 'draft']
const STATUSES = ['published', 'draft', 'archived']

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

export function validatePortfolioProjectPayload(payload = {}) {
  const errors = []

  if (!payload.title || !isNonEmpty(payload.title)) {
    errors.push('Project title is required')
  } else if (payload.title.length > 200) {
    errors.push('Title must be 200 characters or less')
  }

  if (payload.description && payload.description.length > 8000) {
    errors.push('Description must be 8000 characters or less')
  }

  if (payload.category && !CATEGORIES.includes(payload.category)) {
    errors.push(`Category must be one of: ${CATEGORIES.join(', ')}`)
  }

  if (payload.tags && !Array.isArray(payload.tags)) {
    errors.push('Tags must be an array')
  }
  if (payload.technologies && !Array.isArray(payload.technologies)) {
    errors.push('Technologies must be an array')
  }
  if (payload.highlights && !Array.isArray(payload.highlights)) {
    errors.push('Highlights must be an array')
  }
  if (payload.media && !Array.isArray(payload.media)) {
    errors.push('Media must be an array')
  }

  if (payload.liveUrl && !isValidUrl(payload.liveUrl)) errors.push('Live URL must be a valid URL')
  if (payload.githubUrl && !isValidUrl(payload.githubUrl)) errors.push('GitHub URL must be a valid URL')
  if (payload.demoUrl && !isValidUrl(payload.demoUrl)) errors.push('Demo URL must be a valid URL')

  if (payload.visibility && !VISIBILITY.includes(payload.visibility)) {
    errors.push(`Visibility must be one of: ${VISIBILITY.join(', ')}`)
  }
  if (payload.status && !STATUSES.includes(payload.status)) {
    errors.push(`Status must be one of: ${STATUSES.join(', ')}`)
  }

  if (payload.teamSize !== undefined && (typeof payload.teamSize !== 'number' || payload.teamSize < 1)) {
    errors.push('Team size must be a positive number')
  }

  return buildResult(errors)
}

export { CATEGORIES, VISIBILITY, STATUSES }
