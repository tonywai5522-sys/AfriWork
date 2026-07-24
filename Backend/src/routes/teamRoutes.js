import { Router } from 'express'
import {
  getMyTeams, createTeam, getTeamById, updateTeam, deleteTeam,
  listTeams, addMember, updateMember, removeMember, acceptInvitation,
} from '../controllers/teamController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

// ─── Authenticated Team Routes ─────────────────────────
router.get('/', authenticate, getMyTeams)
router.post('/', authenticate, createTeam)
router.get('/:teamId', authenticate, getTeamById)
router.put('/:teamId', authenticate, updateTeam)
router.delete('/:teamId', authenticate, deleteTeam)

// ─── Public Teams Listing ─────────────────────────────
router.get('/public/list', listTeams)

// ─── Team Member Management ───────────────────────────
router.post('/:teamId/members', authenticate, addMember)
router.put('/:teamId/members/:memberId', authenticate, updateMember)
router.delete('/:teamId/members/:memberId', authenticate, removeMember)

// ─── Invitations ─────────────────────────────────────
router.post('/:teamId/accept', authenticate, acceptInvitation)

export default router
