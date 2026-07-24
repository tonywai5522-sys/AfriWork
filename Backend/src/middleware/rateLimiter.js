import rateLimit from 'express-rate-limit'
import { logger } from '../utils/logger.js'

/**
 * Tiered rate limiting configuration
 */
const limiterConfig = {
  standard: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  },
  strict: {
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  },
  api: {
    windowMs: 60 * 1000,  // 1 minute
    max: 60,
    message: { success: false, message: 'Too many API requests. Slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
  },
  admin: {
    windowMs: 60 * 1000,
    max: 120,
    message: { success: false, message: 'Too many admin requests.' },
    standardHeaders: true,
    legacyHeaders: false,
  },
  burst: {
    windowMs: 1 * 1000,  // 1 second
    max: 10,
    message: { success: false, message: 'Burst limit exceeded. Slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
  },
}

function createLimiter(name = 'standard') {
  const config = limiterConfig[name]
  if (!config) {
    logger.warn(`Rate limiter "${name}" not found, using standard`)
    return createLimiter('standard')
  }

  const limiter = rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded`, {
        ip: req.ip,
        path: req.originalUrl,
        limiter: name,
        limit: config.max,
        window: config.windowMs,
      })
      res.status(429).json(config.message)
    },
  })

  return limiter
}

export const standardLimiter = createLimiter('standard')
export const strictLimiter = createLimiter('strict')
export const authLimiter = createLimiter('auth')
export const apiLimiter = createLimiter('api')
export const adminLimiter = createLimiter('admin')
export const burstLimiter = createLimiter('burst')

export default createLimiter
