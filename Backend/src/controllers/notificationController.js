import * as notificationService from '../services/notificationService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'

export async function getNotifications(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const unreadOnly = req.query.unread === 'true'
    const result = await notificationService.getNotifications(req.user.id, { unreadOnly, page, limit })
    return sendSuccess(res, result, 'Notifications retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getUnreadCount(req, res) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id)
    return sendSuccess(res, { count }, 'Unread count retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function markAsRead(req, res) {
  try {
    const { notificationId } = req.params
    const notification = await notificationService.getNotificationById(notificationId)
    if (!notification) return sendError(res, 'Notification not found', 404)
    if (notification.recipientId !== req.user.id) return sendError(res, 'Access denied', 403)

    await notificationService.markAsRead(notificationId)
    return sendSuccess(res, null, 'Notification marked as read')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function markAllAsRead(req, res) {
  try {
    const count = await notificationService.markAllAsRead(req.user.id)
    return sendSuccess(res, { count }, `${count} notifications marked as read`)
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function deleteNotification(req, res) {
  try {
    const { notificationId } = req.params
    const notification = await notificationService.getNotificationById(notificationId)
    if (!notification) return sendError(res, 'Notification not found', 404)
    if (notification.recipientId !== req.user.id) return sendError(res, 'Access denied', 403)

    await notificationService.deleteNotification(notificationId)
    return sendSuccess(res, null, 'Notification deleted')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function getPreferences(req, res) {
  try {
    const prefs = await notificationService.getNotificationPreferences(req.user.id)
    return sendSuccess(res, { preferences: prefs }, 'Preferences retrieved')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}

export async function updatePreferences(req, res) {
  try {
    const prefs = await notificationService.updateNotificationPreferences(req.user.id, req.body)
    return sendSuccess(res, { preferences: prefs }, 'Preferences updated')
  } catch (err) {
    return sendError(res, err.message, 500)
  }
}
