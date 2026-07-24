import helmet from 'helmet'
import hpp from 'hpp'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger.js'
import { appConfig } from '../config/appConfig.js'

/**
 * Helmet configuration with secure defaults
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: appConfig.isProduction() ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: appConfig.isProduction() ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    } : false,
    ieNoOpen: true,
    noSniff: true,
    permittedPolicies: {},
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  })
}

/**
 * HTTP Parameter Pollution protection
 */
export function preventParamPollution() {
  return hpp({
    whitelist: [
      'page', 'limit', 'sortBy', 'sortOrder', 'role', 'status',
      'query', 'from', 'to', 'category', 'period', 'interval',
    ],
  })
}

/**
 * Adds unique request ID to every request for tracing
 */
export function requestId() {
  return (req, res, next) => {
    req.requestId = req.headers['x-request-id'] || `req_${uuidv4().slice(0, 12)}`
    res.setHeader('X-Request-ID', req.requestId)
    next()
  }
}

/**
 * CORS configuration with strict origin validation
 */
export function createCors() {
  const allowedOrigins = [
    appConfig.frontendUrl,
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
  ]

  return cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const isAllowed = allowedOrigins.some(a => a instanceof RegExp ? a.test(origin) : a === origin)
      if (isAllowed) return callback(null, origin)
      if (appConfig.isDevelopment()) {
        logger.warn(`CORS: allowing unknown origin in dev: ${origin}`)
        return callback(null, origin)
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-Request-ID'],
    maxAge: 86400,
  })
}

/**
 * Request size limiter - rejects oversized payloads before body parsing
 */
export function requestSizeLimiter(maxBytes = 10 * 1024 * 1024) {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10)
    if (contentLength && contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: `Request body too large. Maximum size is ${Math.round(maxBytes / 1024 / 1024)}MB`,
      })
    }
    next()
  }
}

/**
 * Content-Type enforcement for API routes (not file uploads)
 */
export function enforceContentType(allowedTypes = ['application/json']) {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
    const ct = req.headers['content-type']?.split(';')[0]?.toLowerCase()
    if (ct && !allowedTypes.includes(ct) && !req.path.startsWith('/uploads')) {
      return res.status(415).json({
        success: false,
        message: `Unsupported Content-Type: ${ct}. Allowed: ${allowedTypes.join(', ')}`,
      })
    }
    next()
  }
}

/**
 * Response headers for additional security
 */
export function securityResponseHeaders() {
  return (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.removeHeader('X-Powered-By')
    next()
  }
}
