import { logger } from '../utils/logger.js'

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'

  logger.error(`Unhandled error`, {
    method: req.method,
    path: req.originalUrl,
    status,
    ip: req.ip,
    error: err.message,
    stack: err.stack?.split('\n').slice(0, 5).join('\n'),
  })

  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error' : message,
  })
}
