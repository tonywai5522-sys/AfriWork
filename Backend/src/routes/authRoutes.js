import { Router } from 'express'
import {
  register,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  sendVerification,
  confirmVerification,
  getSession,
  getCurrentUser,
  logout,
  logoutAll,
  listSessions,
  revokeSession,
  updateProfile,
  changePassword,
  updateUserRole,
  getUserById,
  me,
} from '../controllers/authController.js'
import {
  authenticate,
  requireRole,
  requireAdmin,
  authRateLimiter,
  authStrictRateLimiter,
} from '../middleware/authMiddleware.js'

const router = Router()

// ─── Public Routes ─────────────────────────────────────
router.post('/register', authStrictRateLimiter, register)
router.post('/login', authRateLimiter, login)
router.post('/admin-login', authRateLimiter, adminLogin)
router.post('/forgot-password', authRateLimiter, forgotPassword)
router.post('/reset-password', authRateLimiter, resetPassword)

// ─── Email Verification Routes ────────────────────────
router.post('/verification-email', authenticate, sendVerification)
router.post('/verify-email', confirmVerification)

// ─── Authenticated Routes ─────────────────────────────
router.get('/session', authenticate, getSession)
router.get('/me', authenticate, me)
router.get('/profile', authenticate, getCurrentUser)
router.put('/profile', authenticate, updateProfile)
router.put('/change-password', authenticate, changePassword)
router.post('/logout', authenticate, logout)
router.post('/logout-all', authenticate, logoutAll)

// ─── Session Management ───────────────────────────────
router.get('/sessions', authenticate, listSessions)
router.delete('/sessions/:sessionId', authenticate, revokeSession)

// ─── Admin Routes ─────────────────────────────────────
router.get('/users/:userId', authenticate, requireAdmin, getUserById)
router.put('/users/:userId/role', authenticate, requireAdmin, updateUserRole)

export default router
