const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'DEBUG']

function timestamp() {
  return new Date().toISOString()
}

function formatArgs(args) {
  return args.map(a => {
    if (a instanceof Error) return `${a.message}\n${a.stack?.split('\n').slice(0, 4).join('\n') || ''}`
    if (typeof a === 'object') {
      try { return JSON.stringify(a, null, 0) }
      catch { return String(a) }
    }
    return String(a)
  }).join(' ')
}

export const logger = {
  debug(...args) {
    if (currentLevel <= LOG_LEVELS.DEBUG) console.log(`[${timestamp()}] [DEBUG] ${formatArgs(args)}`)
  },
  info(...args) {
    if (currentLevel <= LOG_LEVELS.INFO) console.log(`[${timestamp()}] [INFO] ${formatArgs(args)}`)
  },
  warn(...args) {
    if (currentLevel <= LOG_LEVELS.WARN) console.warn(`[${timestamp()}] [WARN] ${formatArgs(args)}`)
  },
  error(...args) {
    if (currentLevel <= LOG_LEVELS.ERROR) console.error(`[${timestamp()}] [ERROR] ${formatArgs(args)}`)
  },

  // Auth-specific helpers
  authSuccess(action, email, details = {}) {
    this.info(`AUTH_OK`, { action, email, ...details })
  },
  authFailure(action, email, error, details = {}) {
    const errInfo = error ? {
      message: error.message,
      code: error.code || error.statusCode,
      type: error.type,
    } : {}
    this.error(`AUTH_FAIL`, { action, email, ...errInfo, ...details })
  },
  validationFailure(action, field, errors) {
    this.warn(`VALIDATION_FAIL`, { action, field, errors })
  },
  apiCall(method, path, status, duration) {
    this.debug(`API`, { method, path, status, duration: `${duration}ms` })
  },
}
