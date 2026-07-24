import { useState, useEffect, useRef, useCallback } from 'react'
import * as chatService from '../../services/chatService.js'
import { useSocket } from '../../context/SocketContext.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import MessageBubble from './MessageBubble.jsx'
import MessageInput from './MessageInput.jsx'

export default function ChatWindow({ conversationId, onBack }) {
  const { user } = useAuth()
  const { emit, on, off, isUserOnline, joinConversation, leaveConversation } = useSocket()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!conversationId) return

    setMessages([])
    setPage(1)
    setHasMore(false)
    setLoading(true)
    setTypingUsers([])

    joinConversation(conversationId)

    loadConversation()
    loadMessages()

    return () => {
      leaveConversation(conversationId)
    }
  }, [conversationId])

  // Socket event listeners
  useEffect(() => {
    const onNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev
          return [...prev, message]
        })
      }
    }

    const onMessageEdited = ({ messageId, content }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content, isEdited: true } : m))
    }

    const onMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m))
    }

    const onReadReceipt = ({ messageId }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, readBy: [...(m.readBy || []), { userId: 'reader' }] } : m))
    }

    const onTypingStart = ({ userId, userName }) => {
      if (userId !== user.id) {
        setTypingUsers(prev => prev.some(u => u.userId === userId) ? prev : [...prev, { userId, userName }])
      }
    }

    const onTypingStop = ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId))
    }

    on('chat:new_message', onNewMessage)
    on('chat:message_edited', onMessageEdited)
    on('chat:message_deleted', onMessageDeleted)
    on('chat:read_receipt', onReadReceipt)
    on('chat:user_typing', onTypingStart)
    on('chat:user_stopped_typing', onTypingStop)

    return () => {
      off('chat:new_message', onNewMessage)
      off('chat:message_edited', onMessageEdited)
      off('chat:message_deleted', onMessageDeleted)
      off('chat:read_receipt', onReadReceipt)
      off('chat:user_typing', onTypingStart)
      off('chat:user_stopped_typing', onTypingStop)
    }
  }, [conversationId, user.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (messages.length > 0) {
      const latest = messages[messages.length - 1]
      if (latest.senderId !== user.id) {
        emit('chat:mark_read', { conversationId, messageId: latest.id })
      }
    }
  }, [messages.length, conversationId, user.id])

  async function loadConversation() {
    try {
      const res = await chatService.getConversation(conversationId)
      setConversation(res.data?.conversation || null)
    } catch { /* */ }
  }

  async function loadMessages(pageNum = 1) {
    try {
      const res = await chatService.getMessages(conversationId, { page: pageNum, limit: 50 })
      const msgData = res.data?.messages || []
      const total = res.data?.total || 0
      const loadedCount = pageNum * 50

      if (pageNum === 1) {
        setMessages(msgData)
      } else {
        setMessages(prev => [...msgData, ...prev])
      }

      setHasMore(loadedCount < total)
      setLoading(false)
      setLoadingMore(false)
    } catch {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  function handleLoadMore() {
    if (hasMore && !loadingMore) {
      setLoadingMore(true)
      const nextPage = page + 1
      setPage(nextPage)
      loadMessages(nextPage)
    }
  }

  async function handleSendMessage(content, files) {
    if (!conversationId) return

    const formData = new FormData()
    formData.append('content', content)
    for (const file of files) {
      formData.append('files', file)
    }

    const res = await chatService.sendMessage(conversationId, formData)
    return res
  }

  function getConversationName() {
    if (!conversation) return ''
    if (conversation.title) return conversation.title
    const other = (conversation.participants || []).find(p => p.userId !== user.id)
    return other?.name || other?.email || 'Unknown'
  }

  function getOtherUserId() {
    if (!conversation) return null
    if (conversation.type === 'direct') {
      return (conversation.participants || []).find(p => p.userId !== user.id)?.userId || null
    }
    return null
  }

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
          <h3 className="mt-4 text-lg font-bold text-slate-400">Select a conversation</h3>
          <p className="mt-1 text-sm text-slate-400">Choose a conversation from the left or start a new one</p>
        </div>
      </div>
    )
  }

  if (!conversation && loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-slate-900" />
      </div>
    )
  }

  const otherUserId = getOtherUserId()
  const online = otherUserId ? isUserOnline(otherUserId) : false
  const visibleMessages = messages.filter(m => !m.isDeleted || m.content)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b-2 border-slate-200 px-4 py-3">
        {onBack && (
          <button onClick={onBack} className="mr-1 lg:hidden">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        <div className="relative h-10 w-10 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
            {getConversationName()[0]?.toUpperCase() || '?'}
          </div>
          {online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-900">{getConversationName()}</h3>
          <p className="text-xs font-medium text-slate-500">
            {online ? 'Online' : 'Offline'}
            {typingUsers.length > 0 && ` · ${typingUsers.map(u => u.userName).join(', ')} typing...`}
          </p>
        </div>
        <div className="flex gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {hasMore && (
          <div className="mb-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-lg border-2 border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load earlier messages'}
            </button>
          </div>
        )}
        {visibleMessages.length === 0 && !loading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">No messages yet</p>
              <p className="mt-1 text-xs text-slate-400">Send a message to start the conversation</p>
            </div>
          </div>
        )}
        {visibleMessages.map((msg, i) => {
          const prev = visibleMessages[i - 1]
          const isConsecutive = prev && prev.senderId === msg.senderId &&
            (new Date(msg.createdAt) - new Date(prev.createdAt)) < 300000
          const showDate = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isConsecutive={!!isConsecutive}
              showDateSeparator={showDate && i > 0}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        conversationId={conversationId}
        onSendMessage={handleSendMessage}
        disabled={!conversationId}
      />
    </div>
  )
}
