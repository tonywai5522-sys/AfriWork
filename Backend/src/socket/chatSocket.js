import { logger } from '../utils/logger.js'
import * as messageService from '../services/messageService.js'
import * as conversationService from '../services/conversationService.js'

export function setupChatSocket(io) {
  const userSockets = new Map()
  const socketUsers = new Map()

  io.on('connection', (socket) => {
    logger.debug(`[ChatSocket] New connection: ${socket.id}`)

    // ─── Identify / Authenticate ─────────────────────────
    socket.on('identify', ({ userId, userName, userAvatar }) => {
      if (!userId) {
        socket.emit('chat:error', { message: 'userId is required' })
        return
      }

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set())
      }
      userSockets.get(userId).add(socket.id)
      socketUsers.set(socket.id, { userId, userName, userAvatar })

      socket.join(`user:${userId}`)
      socket.emit('identified', { userId, userName })

      const onlineUserIds = Array.from(userSockets.keys())
      socket.emit('online:users', onlineUserIds)
      socket.broadcast.emit('user:online', { userId, userName, isOnline: true })

      logger.debug(`[ChatSocket] User identified: ${userId} (${userName})`)
    })

    // ─── Join / Leave conversation room ──────────────────
    socket.on('chat:join', ({ conversationId }) => {
      if (!conversationId) return
      socket.join(`conversation:${conversationId}`)
      logger.debug(`[ChatSocket] ${socket.id} joined conversation:${conversationId}`)
    })

    socket.on('chat:leave', ({ conversationId }) => {
      if (!conversationId) return
      socket.leave(`conversation:${conversationId}`)
    })

    // ─── Send message ────────────────────────────────────
    socket.on('chat:send_message', async (data) => {
      const userInfo = socketUsers.get(socket.id)
      if (!userInfo) {
        socket.emit('chat:error', { message: 'You must identify first' })
        return
      }

      const { conversationId, content, type, replyTo, attachments } = data
      if (!conversationId) {
        socket.emit('chat:error', { message: 'conversationId is required' })
        return
      }

      try {
        const message = await messageService.createMessage({
          conversationId,
          senderId: userInfo.userId,
          senderName: userInfo.userName || 'Unknown',
          senderAvatar: userInfo.userAvatar || '',
          content: content || '',
          type: type || 'text',
          replyTo: replyTo || null,
          attachments: attachments || [],
        })

        await conversationService.updateLastMessage(conversationId, message.toJSON())

        io.to(`conversation:${conversationId}`).emit('chat:new_message', message.toJSON())

        // Notify participant rooms for unread badge updates
        try {
          const conversation = await conversationService.getConversationById(conversationId)
          if (conversation) {
            for (const p of conversation.participants) {
              if (p.userId !== userInfo.userId) {
                io.to(`user:${p.userId}`).emit('conversation:updated', {
                  conversationId,
                  lastMessage: message.toJSON(),
                })
              }
            }
          }
        } catch { /* best effort */ }
      } catch (err) {
        logger.error('[ChatSocket] Error sending message:', err.message)
        socket.emit('chat:error', { message: 'Failed to send message' })
      }
    })

    // ─── Typing indicators ───────────────────────────────
    socket.on('chat:typing_start', ({ conversationId }) => {
      const userInfo = socketUsers.get(socket.id)
      if (!userInfo || !conversationId) return
      socket.to(`conversation:${conversationId}`).emit('chat:user_typing', {
        conversationId,
        userId: userInfo.userId,
        userName: userInfo.userName,
      })
    })

    socket.on('chat:typing_stop', ({ conversationId }) => {
      const userInfo = socketUsers.get(socket.id)
      if (!userInfo || !conversationId) return
      socket.to(`conversation:${conversationId}`).emit('chat:user_stopped_typing', {
        conversationId,
        userId: userInfo.userId,
      })
    })

    // ─── Read receipts ───────────────────────────────────
    socket.on('chat:mark_read', async ({ conversationId, messageId }) => {
      const userInfo = socketUsers.get(socket.id)
      if (!userInfo || !messageId) return

      try {
        await messageService.markAsRead(messageId, userInfo.userId)
        await conversationService.markAsRead(conversationId, userInfo.userId)
        socket.to(`conversation:${conversationId}`).emit('chat:read_receipt', {
          messageId,
          userId: userInfo.userId,
          readAt: new Date().toISOString(),
        })
      } catch { /* best effort */ }
    })

    // ─── Reactions ───────────────────────────────────────
    socket.on('chat:add_reaction', async ({ messageId, emoji }) => {
      const userInfo = socketUsers.get(socket.id)
      if (!userInfo || !messageId || !emoji) return

      try {
        const reactions = await messageService.addReaction(messageId, userInfo.userId, emoji)
        io.to(`conversation:*`).emit('chat:reaction_updated', { messageId, reactions })
      } catch { /* best effort */ }
    })

    // ─── Edit / Delete message ───────────────────────────
    socket.on('chat:edit_message', async ({ messageId, content }) => {
      const userInfo = socketUsers.get(socket.id)
      if (!userInfo || !messageId || !content) return

      try {
        const message = await messageService.editMessage(messageId, content)
        // Verify sender
        if (message.senderId !== userInfo.userId) {
          socket.emit('chat:error', { message: 'You can only edit your own messages' })
          return
        }
        io.emit('chat:message_edited', { messageId, content })
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to edit message' })
      }
    })

    socket.on('chat:delete_message', async ({ messageId }) => {
      const userInfo = socketUsers.get(socket.id)
      if (!userInfo || !messageId) return

      try {
        const message = await messageService.getMessageById(messageId)
        if (message && message.senderId !== userInfo.userId) {
          socket.emit('chat:error', { message: 'You can only delete your own messages' })
          return
        }
        await messageService.deleteMessage(messageId)
        io.emit('chat:message_deleted', { messageId })
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to delete message' })
      }
    })

    // ─── Disconnect ──────────────────────────────────────
    socket.on('disconnect', () => {
      logger.debug(`[ChatSocket] Disconnected: ${socket.id}`)
      const userInfo = socketUsers.get(socket.id)
      if (userInfo) {
        const sockets = userSockets.get(userInfo.userId)
        if (sockets) {
          sockets.delete(socket.id)
          if (sockets.size === 0) {
            userSockets.delete(userInfo.userId)
            socket.broadcast.emit('user:offline', {
              userId: userInfo.userId,
              userName: userInfo.userName,
            })
          }
        }
        socketUsers.delete(socket.id)
      }
    })

    socket.on('error', (err) => {
      logger.error(`[ChatSocket] Socket error (${socket.id}):`, err.message || err)
    })
  })
}
