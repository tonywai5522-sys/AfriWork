import * as settingsService from '../services/settingsService.js'
import * as authService from '../services/authService.js'
import { sendSuccess, sendError } from '../utils/responseFormatter.js'
import { validateAccountSettings, validateSecuritySettings, validatePrivacySettings, validateNotificationSettings, validateConnectedAccount } from '../validators/settingsValidator.js'

export async function getAccount(req, res) {
  try {
    const settings = await settingsService.getAccountSettings(req.user.id)
    return sendSuccess(res, settings)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function updateAccount(req, res) {
  try {
    const validation = validateAccountSettings(req.body)
    if (!validation.isValid) return sendError(res, validation.errors.join('; '), 400)
    const settings = await settingsService.updateAccountSettings(req.user.id, req.body)
    return sendSuccess(res, settings, 'Account settings updated')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getSecurity(req, res) {
  try {
    const settings = await settingsService.getSecuritySettings(req.user.id)
    return sendSuccess(res, settings)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function updateSecurity(req, res) {
  try {
    const validation = validateSecuritySettings(req.body)
    if (!validation.isValid) return sendError(res, validation.errors.join('; '), 400)
    const settings = await settingsService.updateSecuritySettings(req.user.id, req.body)
    return sendSuccess(res, settings, 'Security settings updated')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body
    const validation = validateSecuritySettings({ currentPassword, newPassword, confirmNewPassword })
    if (!validation.isValid) return sendError(res, validation.errors.join('; '), 400)

    // Verify current password by attempting to create a session
    await authService.createEmailSession(req.user.email, currentPassword)

    // Send password recovery email to complete the change
    await authService.sendPasswordRecovery(req.user.email)

    return sendSuccess(res, null, 'A password reset link has been sent to your email to complete the change.')
  } catch (e) {
    const msg = e.message?.includes('Invalid') ? 'Current password is incorrect' : e.message
    return sendError(res, msg, 400)
  }
}

export async function getPrivacy(req, res) {
  try {
    const settings = await settingsService.getPrivacySettings(req.user.id)
    return sendSuccess(res, settings)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function updatePrivacy(req, res) {
  try {
    const validation = validatePrivacySettings(req.body)
    if (!validation.isValid) return sendError(res, validation.errors.join('; '), 400)
    const settings = await settingsService.updatePrivacySettings(req.user.id, req.body)
    return sendSuccess(res, settings, 'Privacy settings updated')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getNotifications(req, res) {
  try {
    const settings = await settingsService.getNotificationPreferences(req.user.id)
    return sendSuccess(res, settings)
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function updateNotifications(req, res) {
  try {
    const validation = validateNotificationSettings(req.body)
    if (!validation.isValid) return sendError(res, validation.errors.join('; '), 400)
    const settings = await settingsService.updateNotificationPreferences(req.user.id, req.body)
    return sendSuccess(res, settings, 'Notification preferences updated')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getConnectedAccounts(req, res) {
  try {
    const accounts = await settingsService.getConnectedAccounts(req.user.id)
    return sendSuccess(res, { accounts })
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function connectAccount(req, res) {
  try {
    const validation = validateConnectedAccount(req.body)
    if (!validation.isValid) return sendError(res, validation.errors.join('; '), 400)
    const { provider, providerAccountId, accessToken, providerEmail, displayName, avatarUrl } = req.body
    const result = await settingsService.connectAccount(req.user.id, {
      provider, providerAccountId, accessToken, providerEmail, displayName, avatarUrl,
    })
    return sendSuccess(res, result, 'Account connected')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function disconnectAccount(req, res) {
  try {
    const { accountId } = req.params
    await settingsService.disconnectAccount(req.user.id, accountId)
    return sendSuccess(res, null, 'Account disconnected')
  } catch (e) { return sendError(res, e.message, 500) }
}

export async function getFullSettings(req, res) {
  try {
    const [account, security, privacy, notifications, connectedAccounts] = await Promise.all([
      settingsService.getAccountSettings(req.user.id),
      settingsService.getSecuritySettings(req.user.id),
      settingsService.getPrivacySettings(req.user.id),
      settingsService.getNotificationPreferences(req.user.id),
      settingsService.getConnectedAccounts(req.user.id),
    ])
    return sendSuccess(res, { account, security, privacy, notifications, connectedAccounts })
  } catch (e) { return sendError(res, e.message, 500) }
}
