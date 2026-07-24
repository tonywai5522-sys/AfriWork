import { sendError, sendSuccess } from '../utils/responseFormatter.js'
import { logger } from '../utils/logger.js'
import {
  validateTeamCreatePayload,
  validateTeamUpdatePayload,
  validateTeamMemberInvitePayload,
} from '../validators/teamValidator.js'
import * as teamService from '../services/teamService.js'

export async function getMyTeams(req, res) {
  try {
    const teams = await teamService.getUserTeams(req.user.id)
    return sendSuccess(res, { teams: teams.map(t => t.toJSON()) }, 'Teams retrieved')
  } catch (error) {
    return sendError(res, 'Failed to retrieve teams', 400)
  }
}

export async function createTeam(req, res) {
  try {
    const validation = validateTeamCreatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    const team = await teamService.createTeam(req.user.id, {
      ...req.body,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
    })
    return sendSuccess(res, { team: team.toJSON() }, 'Team created')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to create team', 400)
  }
}

export async function getTeamById(req, res) {
  try {
    const team = await teamService.getTeamById(req.params.teamId)
    if (!team) return sendError(res, 'Team not found', 404)
    return sendSuccess(res, { team: team.toJSON() }, 'Team retrieved')
  } catch (error) {
    return sendError(res, 'Team not found', 404)
  }
}

export async function updateTeam(req, res) {
  try {
    const validation = validateTeamUpdatePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    const team = await teamService.getTeamById(req.params.teamId)
    if (!team) return sendError(res, 'Team not found', 404)
    if (!team.hasPermission(req.user.id, 'canEdit')) return sendError(res, 'You do not have permission to edit this team', 403)

    const updated = await teamService.updateTeam(req.params.teamId, req.body)
    return sendSuccess(res, { team: updated.toJSON() }, 'Team updated')
  } catch (error) {
    return sendError(res, 'Failed to update team', 400)
  }
}

export async function deleteTeam(req, res) {
  try {
    const team = await teamService.getTeamById(req.params.teamId)
    if (!team) return sendError(res, 'Team not found', 404)
    if (!team.isOwner(req.user.id)) return sendError(res, 'Only the owner can delete the team', 403)

    await teamService.deleteTeam(req.params.teamId)
    return sendSuccess(res, null, 'Team deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete team', 400)
  }
}

export async function listTeams(req, res) {
  try {
    const { page, limit, organizationId } = req.query
    const result = await teamService.listTeams({
      page: parseInt(page) || 1,
      limit: Math.min(50, parseInt(limit) || 20),
      organizationId,
    })
    return sendSuccess(res, result, 'Teams listed')
  } catch (error) {
    return sendError(res, 'Failed to list teams', 400)
  }
}

export async function addMember(req, res) {
  try {
    const validation = validateTeamMemberInvitePayload(req.body)
    if (!validation.isValid) return sendError(res, validation.errors, 400)

    const team = await teamService.getTeamById(req.params.teamId)
    if (!team) return sendError(res, 'Team not found', 404)
    if (!team.hasPermission(req.user.id, 'canInvite')) return sendError(res, 'You do not have permission to invite members', 403)

    const member = await teamService.addTeamMember(req.params.teamId, {
      ...req.body,
      invitedBy: req.user.id,
    })
    return sendSuccess(res, { member: member.toJSON() }, 'Member invited')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to invite member', 400)
  }
}

export async function updateMember(req, res) {
  try {
    const team = await teamService.getTeamById(req.params.teamId)
    if (!team) return sendError(res, 'Team not found', 404)
    if (!team.hasPermission(req.user.id, 'canEdit')) return sendError(res, 'Permission denied', 403)

    await teamService.updateTeamMember(req.params.teamId, req.params.memberId, req.body)
    return sendSuccess(res, null, 'Member updated')
  } catch (error) {
    return sendError(res, 'Failed to update member', 400)
  }
}

export async function removeMember(req, res) {
  try {
    const team = await teamService.getTeamById(req.params.teamId)
    if (!team) return sendError(res, 'Team not found', 404)
    if (!team.hasPermission(req.user.id, 'canRemove')) return sendError(res, 'Permission denied', 403)

    await teamService.removeTeamMember(req.params.teamId, req.params.memberId)
    return sendSuccess(res, null, 'Member removed')
  } catch (error) {
    return sendError(res, 'Failed to remove member', 400)
  }
}

export async function acceptInvitation(req, res) {
  try {
    const result = await teamService.acceptInvitation(req.params.teamId, req.user.id)
    return sendSuccess(res, result, 'Invitation accepted')
  } catch (error) {
    return sendError(res, error?.message || 'Failed to accept invitation', 400)
  }
}
