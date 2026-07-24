import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useSocket } from './SocketContext.jsx'
import { useAuthContext } from './AuthContext.jsx'
import * as notifService from '../services/notificationService.js'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuthContext()
  const { on, off } = useSocket()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notifService.getUnreadCount()
      setUnreadCount(res.data?.count || 0)
    } catch { /* */ }
  }, [])

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setLoading(true)
    try {
      const res = await notifService.getNotifications({ page: pageNum, limit: 20 })
      const items = res.data?.notifications || []
      if (pageNum === 1) {
        setNotifications(items)
      } else {
        setNotifications(prev => [...prev, ...items])
      }
      setTotal(res.data?.total || 0)
      setHasMore(res.data?.hasMore || false)
      setPage(pageNum)
    } catch { /* */ }
    setLoading(false)
  }, [])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchNotifications(page + 1)
  }, [loading, hasMore, page, fetchNotifications])

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount()
      fetchNotifications(1)
    } else {
      setUnreadCount(0)
      setNotifications([])
    }
  }, [isAuthenticated])

  // Real-time socket updates
  useEffect(() => {
    const handleNewNotif = () => {
      fetchUnreadCount()
      fetchNotifications(1)
    }
    const handleUnreadUpdate = (count) => {
      setUnreadCount(count)
    }

    on('notification:new', handleNewNotif)
    on('notification:unread_count', handleUnreadUpdate)

    return () => {
      off('notification:new', handleNewNotif)
      off('notification:unread_count', handleUnreadUpdate)
    }
  }, [on, off, fetchUnreadCount, fetchNotifications])

  const markAsRead = useCallback(async (id) => {
    try {
      await notifService.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* */ }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notifService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
      setUnreadCount(0)
    } catch { /* */ }
  }, [])

  const removeNotification = useCallback(async (id) => {
    try {
      await notifService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (!notifications.find(n => n.id === id)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch { /* */ }
  }, [notifications])

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    hasMore,
    total,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    removeNotification,
    fetchUnreadCount,
  }), [notifications, unreadCount, loading, hasMore, total, fetchNotifications, loadMore, markAsRead, markAllAsRead, removeNotification, fetchUnreadCount])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}
