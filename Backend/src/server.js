import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import talentRoutes from './routes/talentRoutes.js'
import organizationRoutes from './routes/organizationRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import portfolioRoutes from './routes/portfolioRoutes.js'
import certificationRoutes from './routes/certificationRoutes.js'
import skillRoutes from './routes/skillRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import teamRoutes from './routes/teamRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import taskListRoutes from './routes/taskListRoutes.js'
import milestoneRoutes from './routes/milestoneRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import activityFeedRoutes from './routes/activityFeedRoutes.js'
import searchRoutes from './routes/searchRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import bookmarkRoutes from './routes/bookmarkRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import auditLogRoutes from './routes/auditLogRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import { requestAuditLogger } from './middleware/auditMiddleware.js'
import { setNotificationSocket } from './services/notificationService.js'
import { errorHandler } from './middleware/errorHandler.js'
import { appConfig } from './config/appConfig.js'
import { logger } from './utils/logger.js'
import { securityHeaders, preventParamPollution, requestId, createCors, requestSizeLimiter, enforceContentType, securityResponseHeaders } from './middleware/securityMiddleware.js'
import { sanitizeInput } from './middleware/inputSanitizer.js'
import { standardLimiter, authLimiter } from './middleware/rateLimiter.js'

import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupChatSocket } from './socket/chatSocket.js'

const app = express()
const server = createServer(app)
const port = appConfig.port

// ============================================================
// SECURITY MIDDLEWARE STACK (Order matters)
// ============================================================

// 1. Unique request ID for tracing
app.use(requestId())

// 2. Security response headers (before CORS)
app.use(securityResponseHeaders())

// 3. Helmet security headers
app.use(securityHeaders())

// 4. CORS with strict origin validation
const allowedOrigins = [
  appConfig.frontendUrl,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
]
const corsOptions = {
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
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// 5. Request size limiter (before body parsing)
app.use(requestSizeLimiter())

// 6. Body parsers with size limits
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// 7. HPP protection (after body parsing)
app.use(preventParamPollution())

// 8. Input sanitization (XSS, SQL injection prevention)
app.use(sanitizeInput)

// 9. Content-Type enforcement
app.use(enforceContentType())

// 10. Trust proxy for rate limiting
app.set('trust proxy', 1)

// 11. Global rate limit (100 req/15min per IP)
app.use(standardLimiter)

// 12. Request audit logging
app.use(requestAuditLogger)

// Health check
app.use('/api/v1', healthRoutes)

// Auth routes
app.use('/api/v1/auth', authRoutes)

// Profile routes
app.use('/api/v1/profile', profileRoutes)

// Talent discovery routes
app.use('/api/v1/talents', talentRoutes)

// Organization routes
app.use('/api/v1/organizations', organizationRoutes)

// Job marketplace routes
app.use('/api/v1/jobs', jobRoutes)

// Application routes
app.use('/api/v1/applications', applicationRoutes)

// Portfolio routes
app.use('/api/v1/portfolio', portfolioRoutes)

// Certification routes
app.use('/api/v1/certifications', certificationRoutes)

// Skills taxonomy routes
app.use('/api/v1/skills', skillRoutes)

// Resume routes
app.use('/api/v1/resume', resumeRoutes)

// Team routes
app.use('/api/v1/teams', teamRoutes)

// Project workspace routes
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/tasks', taskRoutes)
app.use('/api/v1/task-lists', taskListRoutes)
app.use('/api/v1/milestones', milestoneRoutes)
app.use('/api/v1/comments', commentRoutes)
app.use('/api/v1/activity-feed', activityFeedRoutes)

// Search routes
app.use('/api/v1/search', searchRoutes)

// Chat routes
app.use('/api/v1/conversations', conversationRoutes)
app.use('/api/v1/messages', messageRoutes)

// Notification routes
app.use('/api/v1/notifications', notificationRoutes)

// Review routes
app.use('/api/v1/reviews', reviewRoutes)

// Learning Hub routes
app.use('/api/v1/learning', courseRoutes)

// Bookmark routes
app.use('/api/v1/bookmarks', bookmarkRoutes)

// Settings routes
app.use('/api/v1/settings', settingsRoutes)

// Admin routes (protected by requireAdmin in the router)
app.use('/api/v1/admin', adminRoutes)

// Audit log routes (protected by auth middleware in the router)
app.use('/api/v1/audit-logs', auditLogRoutes)

// Analytics routes (protected by auth middleware in the router)
app.use('/api/v1/analytics', analyticsRoutes)

// Serve uploaded files
app.use('/uploads', express.static('uploads'))

// Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) return allowed.test(origin)
        return allowed === origin
      })
      if (isAllowed || appConfig.isDevelopment()) return callback(null, true)
      callback(new Error('Origin not allowed'))
    },
    credentials: true,
  },
})
setupChatSocket(io)
setNotificationSocket(io)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// Global error handler
app.use(errorHandler)

server.listen(port, () => {
  console.log(`🚀 AfriWork API server running on port ${port}`)
  console.log(`📋 Environment: ${appConfig.nodeEnv}`)
  console.log(`🔗 Frontend URL: ${appConfig.frontendUrl}`)
})

export default app
