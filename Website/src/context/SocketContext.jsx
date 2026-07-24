import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { io } from 'socket.io-client'
import { useAuthContext } from './AuthContext.jsx'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuthContext()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const onlineUsersRef = useRef([])
  const [, forceUpdate] = useState(0)

  const stableUserId = useMemo(() => user?.id, [user?.id])
  const stableUserName = useMemo(() => user?.name, [user?.name])
  const stableIsAuthed = useMemo(() => isAuthenticated, [isAuthenticated])

  useEffect(() => {
    if (!stableIsAuthed || !stableUserId) {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setConnected(false)
      onlineUsersRef.current = []
      return
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('identify', { userId: stableUserId, userName: stableUserName, userAvatar: '' })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('online:users', (userIds) => {
      onlineUsersRef.current = userIds
      forceUpdate(n => n + 1)
    })

    socket.on('user:online', ({ userId }) => {
      if (!onlineUsersRef.current.includes(userId)) {
        onlineUsersRef.current = [...onlineUsersRef.current, userId]
        forceUpdate(n => n + 1)
      }
    })

    socket.on('user:offline', ({ userId }) => {
      onlineUsersRef.current = onlineUsersRef.current.filter(id => id !== userId)
      forceUpdate(n => n + 1)
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [stableIsAuthed, stableUserId, stableUserName])

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }, [])

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler)
  }, [])

  const joinConversation = useCallback((conversationId) => {
    socketRef.current?.emit('chat:join', { conversationId })
  }, [])

  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit('chat:leave', { conversationId })
  }, [])

  const value = useMemo(() => ({
    socket: socketRef.current,
    connected,
    onlineUsers: onlineUsersRef.current,
    isUserOnline: (userId) => onlineUsersRef.current.includes(userId),
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
  }), [connected, emit, on, off, joinConversation, leaveConversation])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within a SocketProvider')
  return context
}
