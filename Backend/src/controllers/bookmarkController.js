import * as bookmarkService from '../services/bookmarkService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'

export async function toggleBookmark(req, res) {
  try {
    const { targetType, targetId } = req.body
    if (!targetType || !targetId) return sendError(res, 'targetType and targetId required', 400)
    const result = await bookmarkService.toggleBookmark(req.user.id, targetType, targetId)
    return sendSuccess(res, result, result.bookmarked ? 'Bookmarked' : 'Bookmark removed')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function isBookmarked(req, res) {
  try {
    const { targetType, targetId } = req.params
    const bookmarked = await bookmarkService.isBookmarked(req.user.id, targetType, targetId)
    return sendSuccess(res, { bookmarked })
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getBookmarkedIds(req, res) {
  try {
    const { targetType } = req.params
    const ids = await bookmarkService.getBookmarkedIds(req.user.id, targetType)
    return sendSuccess(res, { ids })
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getUserBookmarks(req, res) {
  try {
    const targetType = req.query.type || ''
    const page = parseInt(req.query.page) || 1
    const populated = req.query.populated !== 'false'
    if (populated) {
      const result = await bookmarkService.getPopulatedBookmarks(req.user.id, { targetType, page })
      return sendSuccess(res, { ...result, bookmarks: result.items })
    }
    const result = await bookmarkService.getUserBookmarks(req.user.id, { targetType, page })
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getBookmarkIdsByType(req, res) {
  try {
    const result = await bookmarkService.getBookmarkIdsByType(req.user.id)
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function removeBookmark(req, res) {
  try {
    const { targetType, targetId } = req.params
    await bookmarkService.removeBookmark(req.user.id, targetType, targetId)
    return sendSuccess(res, null, 'Bookmark removed')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getAllBookmarkIds(req, res) {
  try {
    const result = await bookmarkService.getBookmarkIdsByType(req.user.id)
    return sendSuccess(res, result)
  } catch (e) { return sendError(res, e.message, 500) }
}
