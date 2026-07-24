import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'
import { useBookmarkContext } from '../context/BookmarkContext.jsx'
import * as bookmarkService from '../services/bookmarkService.js'

/** Single-item bookmark toggle hook — uses global BookmarkContext for state */
export function useBookmark(targetType, targetId) {
  const { isAuthenticated } = useAuthContext()
  const { isSaved, toggleSave } = useBookmarkContext()
  const [toggling, setToggling] = useState(false)

  const bookmarked = isSaved(targetType, targetId)

  const toggle = useCallback(async () => {
    if (!isAuthenticated || toggling) return
    setToggling(true)
    try {
      await toggleSave(targetType, targetId)
    } catch { /* */ }
    setToggling(false)
  }, [targetType, targetId, isAuthenticated, toggling, toggleSave])

  return { bookmarked, loading: false, toggling, toggle }
}

/** Batch bookmark map for lists */
export function useAllBookmarkIds() {
  const { bookmarkMap, loading, isSaved } = useBookmarkContext()

  const isSavedAny = useCallback((type, id) => isSaved(type, id), [isSaved])

  return { bookmarkMap, loading, isSaved: isSavedAny }
}
