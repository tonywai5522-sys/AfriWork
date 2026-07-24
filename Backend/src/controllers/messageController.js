import * as messageService from '../services/messageService.js'
import * as conversationService from '../services/conversationService.js'
import { singleFile, multiFile, formatFileInfo } from '../services/fileUploadService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'
import { validateSendMessage } from '../validators/chatValidator.js'

export async function getMessages(req, res) {
  try {
    const { conversationId } = req.params
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 50

    const conversation = await conversationService.getConversationById(conversationId)
    if (!conversation) return sendError(res, 'Conversation not found', 404)
    if (!conversation.isParticipant(req.user.id)) return sendError(res, 'Access denied', 403)

    const result = await messageService.getMessages(conversationId, { page, limit })
    return sendSuccess(res, result, 'Messages retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function sendMessage(req, res) {
  try {
    const { conversationId } = req.params
    let content = req.body?.content || ''
    let type = req.body?.type || 'text'
    let replyTo = req.body?.replyTo || null
    let attachments = []

    // Handle multipart file uploads
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(formatFileInfo)
    }

    // Handle JSON-only body
    if (req.body?.attachments && Array.isArray(req.body.attachments) && req.body.attachments.length > 0) {
      attachments = req.body.attachments
    }

    const validation = validateSendMessage({ conversationId, content, attachments })
    if (!validation.valid) return sendError(res, validation.errors.join(', '), 400)

    const conversation = await conversationService.getConversationById(conversationId)
    if (!conversation) return sendError(res, 'Conversation not found', 404)
    if (!conversation.isParticipant(req.user.id)) return sendError(res, 'Access denied', 403)

    const message = await messageService.createMessage({
      conversationId,
      senderId: req.user.id,
      senderName: req.user.name || '',
      senderAvatar: '',
      content,
      type,
      replyTo,
      attachments,
    })

    await conversationService.updateLastMessage(conversationId, message.toJSON())

    return sendSuccess(res, { message: message.toJSON() }, 'Message sent')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function editMessage(req, res) {
  try {
    const { messageId } = req.params
    const { content } = req.body
    if (!content || !content.trim()) return sendError(res, 'Content is required', 400)

    const message = await messageService.getMessageById(messageId)
    if (!message) return sendError(res, 'Message not found', 404)
    if (message.senderId !== req.user.id) return sendError(res, 'You can only edit your own messages', 403)

    const updated = await messageService.editMessage(messageId, content)
    return sendSuccess(res, { message: updated.toJSON() }, 'Message updated')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params
    const message = await messageService.getMessageById(messageId)
    if (!message) return sendError(res, 'Message not found', 404)
    if (message.senderId !== req.user.id) return sendError(res, 'You can only delete your own messages', 403)

    await messageService.deleteMessage(messageId)
    return sendSuccess(res, null, 'Message deleted')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function addReaction(req, res) {
  try {
    const { messageId } = req.params
    const { emoji } = req.body
    if (!emoji) return sendError(res, 'emoji is required', 400)

    const reactions = await messageService.addReaction(messageId, req.user.id, emoji)
    return sendSuccess(res, { reactions }, 'Reaction updated')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function uploadAttachment(req, res) {
  singleFile(req, res, async (err) => {
    if (err) return sendError(res, err.message, 400)
    if (!req.file) return sendError(res, 'No file uploaded', 400)

    const fileInfo = formatFileInfo(req.file)
    return sendSuccess(res, { attachment: fileInfo }, 'File uploaded')
  })
}

export async function sendTextMessage(req, res) {
  try {
    const { conversationId } = req.params
    const { content, type, replyTo } = req.body
    if (!content && !replyTo) return sendError(res, 'Content is required', 400)

    const conversation = await conversationService.getConversationById(conversationId)
    if (!conversation) return sendError(res, 'Conversation not found', 404)
    if (!conversation.isParticipant(req.user.id)) return sendError(res, 'Access denied', 403)

    const message = await messageService.createMessage({
      conversationId,
      senderId: req.user.id,
      senderName: req.user.name || '',
      senderAvatar: '',
      content: content || '',
      type: type || 'text',
      replyTo: replyTo || null,
      attachments: [],
    })

    await conversationService.updateLastMessage(conversationId, message.toJSON())

    return sendSuccess(res, { message: message.toJSON() }, 'Message sent')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}
