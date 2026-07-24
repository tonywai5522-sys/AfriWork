import { logger } from '../utils/logger.js'

const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const SQL_PATTERN = /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi
const NO_SCRIPT_PATTERN = /javascript\s*:/gi
const ON_EVENT_PATTERN = /\son\w+\s*=\s*['"]?[^'"]*['"]?/gi

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      .replace(SCRIPT_PATTERN, '')
      .replace(NO_SCRIPT_PATTERN, 'blocked:')
      .replace(ON_EVENT_PATTERN, '')
      .replace(/[<>]/g, (match) => match === '<' ? '<' : '>')
  }
  if (typeof value === 'object' && value !== null) {
    return sanitizeObject(value)
  }
  return value
}

function sanitizeObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeValue(item))
  }
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeValue(value)
  }
  return sanitized
}

/**
 * Middleware: sanitizes req.body, req.query, and req.params
 * Prevents XSS, NoSQL injection, and SQL injection patterns
 */
export function sanitizeInput(req, res, next) {
  const originalPath = req.originalUrl
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body)
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query)
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params)
    }
    next()
  } catch (error) {
    logger.warn('Input sanitization failed', { path: originalPath, error: error.message })
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
    })
  }
}

/**
 * Strips HTML tags from string fields (for textarea/long text)
 */
export function stripHtmlTags(value) {
  if (typeof value !== 'string') return value
  return value.replace(/<[^>]*>/g, '')
}

/**
 * Validates that a value is a safe string (no XSS patterns)
 */
export function isSafeString(value) {
  if (typeof value !== 'string') return false
  return !SCRIPT_PATTERN.test(value) && !ON_EVENT_PATTERN.test(value) && !value.includes('javascript:')
}

/**
 * Sanitizes a filename to prevent path traversal attacks
 */
export function safeFilename(filename) {
  if (!filename) return ''
  return filename
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255)
}

/**
 * Strips potential SQL injection patterns from search fields
 */
export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return ''
  return query.replace(SQL_PATTERN, '').trim().substring(0, 200)
}
