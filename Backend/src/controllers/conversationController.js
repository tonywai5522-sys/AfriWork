import * as conversationService from '../services/conversationService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'
import { validateCreateConversation, validateCreateGroup } from '../validators/chatValidator.js'

export async function getConversations(req, res) {
  try {
    const conversations = await conversationService.getUserConversations(req.user.id)
    return sendSuccess(res, { conversations }, 'Conversations retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getConversation(req, res) {
  try {
    const conversation = await conversationService.getConversationById(req.params.id)
    if (!conversation) return sendError(res, 'Conversation not found', 404)
    if (!conversation.isParticipant(req.user.id)) return sendError(res, 'Access denied', 403)
    return sendSuccess(res, { conversation: conversation.toJSON() })
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function createDirectConversation(req, res) {
  try {
    const { recipientId, recipientName, recipientEmail, recipientAvatar } = req.body
    if (!recipientId) return sendError(res, 'recipientId is required', 400)

    // Check if direct conversation already exists
    const existing = await conversationService.findDirectConversation(req.user.id, recipientId)
    if (existing) return sendSuccess(res, { conversation: existing.toJSON(), existing: true })

    const conversation = await conversationService.createConversation(req.user.id, {
      type: 'direct',
      participants: [{
        userId: recipientId,
        name: recipientName || '',
        email: recipientEmail || '',
        avatarUrl: recipientAvatar || '',
        role: 'member',
      }],
      creatorName: req.user.name,
      creatorEmail: req.user.email,
      metadata: {},
    })

    return sendSuccess(res, { conversation: conversation.toJSON(), existing: false }, 'Conversation created')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function createGroupConversation(req, res) {
  try {
    const validation = validateCreateGroup(req.body)
    if (!validation.valid) return sendError(res, validation.errors.join(', '), 400)

    const conversation = await conversationService.createConversation(req.user.id, {
      type: 'group',
      title: req.body.title,
      avatar: req.body.avatar || '',
      participants: req.body.participants.map(p => ({
        userId: p.userId,
        name: p.name || '',
        email: p.email || '',
        avatarUrl: p.avatarUrl || '',
        role: 'member',
      })),
      projectId: req.body.projectId || '',
      teamId: req.body.teamId || '',
      creatorName: req.user.name,
      creatorEmail: req.user.email,
      metadata: req.body.metadata || {},
    })

    return sendSuccess(res, { conversation: conversation.toJSON() }, 'Group created')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function updateConversation(req, res) {
  try {
    const conversation = await conversationService.getConversationById(req.params.id)
    if (!conversation) return sendError(res, 'Conversation not found', 404)

    const updated = await conversationService.updateConversation(req.params.id, {
      title: req.body.title,
      avatar: req.body.avatar,
      metadata: req.body.metadata,
    })
    return sendSuccess(res, { conversation: updated.toJSON() }, 'Conversation updated')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function deleteConversation(req, res) {
  try {
    const conversation = await conversationService.getConversationById(req.params.id)
    if (!conversation) return sendError(res, 'Conversation not found', 404)
    if (conversation.createdBy !== req.user.id) return sendError(res, 'Only the creator can delete this conversation', 403)

    await conversationService.deleteConversation(req.params.id)
    return sendSuccess(res, null, 'Conversation deleted')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function addParticipant(req, res) {
  try {
    const { userId, name, email, avatarUrl, role } = req.body
    if (!userId) return sendError(res, 'userId is required', 400)

    const participant = await conversationService.addParticipant(req.params.id, { userId, name, email, avatarUrl, role })
    return sendSuccess(res, { participant: participant.toJSON() }, 'Participant added')
  } catch (err) {
    return sendError(res, err.message, 400)
  }
}

export async function removeParticipant(req, res) {
  try {
    await conversationService.removeParticipant(req.params.id, req.params.userId)
    return sendSuccess(res, null, 'Participant removed')
  } catch (err) {
    return sendError(res, err.message, 400)
  }
}

export async function markAsRead(req, res) {
  try {
    await conversationService.markAsRead(req.params.id, req.user.id)
    return sendSuccess(res, null, 'Marked as read')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}
