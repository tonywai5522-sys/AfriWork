import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'
import * as bookmarkService from '../services/bookmarkService.js'

const BookmarkContext = createContext(null)

export function BookmarkProvider({ children }) {
  const { isAuthenticated } = useAuthContext()
  const [bookmarkMap, setBookmarkMap] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarkMap({})
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await bookmarkService.getAllBookmarkIds()
      setBookmarkMap(res.data || {})
    } catch {
      setBookmarkMap({})
    }
    setLoading(false)
  }, [isAuthenticated])

  useEffect(() => { fetchAll() }, [fetchAll])

  const isSaved = useCallback((type, id) => {
    return !!bookmarkMap[type]?.includes(id)
  }, [bookmarkMap])

  const toggleSave = useCallback(async (targetType, targetId) => {
    const prev = isSaved(targetType, targetId)
    // Optimistic update
    setBookmarkMap(prev => {
      const next = { ...prev }
      const list = next[targetType] || []
      if (prev[targetType]?.includes(targetId)) {
        next[targetType] = list.filter(id => id !== targetId)
      } else {
        next[targetType] = [...list, targetId]
      }
      return next
    })
    try {
      await bookmarkService.toggleBookmark(targetType, targetId)
    } catch {
      // Revert on error
      setBookmarkMap(prev => {
        const next = { ...prev }
        const list = next[targetType] || []
        if (prev[targetType]?.includes(targetId)) {
          next[targetType] = list.filter(id => id !== targetId)
        } else {
          next[targetType] = [...list, targetId]
        }
        return next
      })
    }
  }, [isSaved])

  const count = Object.values(bookmarkMap).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <BookmarkContext.Provider value={{ bookmarkMap, loading, isSaved, toggleSave, fetchAll, count }}>
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarkContext() {
  const ctx = useContext(BookmarkContext)
  if (!ctx) throw new Error('useBookmarkContext must be used within BookmarkProvider')
  return ctx
}
