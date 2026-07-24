import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import AccountSettings from '../../components/settings/AccountSettings.jsx'
import SecuritySettings from '../../components/settings/SecuritySettings.jsx'
import NotificationPreferences from '../../components/settings/NotificationPreferences.jsx'
import PrivacySettings from '../../components/settings/PrivacySettings.jsx'
import ConnectedAccounts from '../../components/settings/ConnectedAccounts.jsx'
import * as settingsService from '../../services/settingsService.js'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { ROUTES } from '../../constants/routes.js'

const TABS = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'connected', label: 'Connected Accounts' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('account')

  const [account, setAccount] = useState(null)
  const [security, setSecurity] = useState(null)
  const [notifications, setNotifications] = useState(null)
  const [privacy, setPrivacy] = useState(null)
  const [connectedAccounts, setConnectedAccounts] = useState([])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await settingsService.getFullSettings()
      const d = res.data
      if (d) {
        setAccount(d.account)
        setSecurity(d.security)
        setNotifications(d.notifications)
        setPrivacy(d.privacy)
        setConnectedAccounts(d.connectedAccounts || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load settings')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function handleSave(tab, serviceFn, data, successMsg) {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await serviceFn(data)
      if (res.data) {
        if (tab === 'account') setAccount(res.data)
        else if (tab === 'security') setSecurity(res.data)
        else if (tab === 'notifications') setNotifications(res.data)
        else if (tab === 'privacy') setPrivacy(res.data)
      }
      setSuccess(successMsg || 'Settings saved')
      if (tab === 'account') refreshUser()
    } catch (err) {
      setError(err.message || 'Failed to save')
    }
    setSaving(false)
  }

  async function handleChangePassword(currentPassword, newPassword, confirmNewPassword) {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await settingsService.changePassword(currentPassword, newPassword, confirmNewPassword)
      setSuccess(res.message || 'Password reset link sent to your email')
    } catch (err) {
      setError(err.message || 'Failed to change password')
    }
    setSaving(false)
  }

  async function handleLogoutAll() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const authService = await import('../../services/authService.js')
      await authService.logoutAll()
      navigate(ROUTES.login)
    } catch (err) {
      setError(err.message || 'Failed to logout all sessions')
    }
    setSaving(false)
  }

  async function handleConnectAccount() {
    setConnecting(true)
    setError('')
    setSuccess('')
    try {
      // Simulate OAuth flow — in production this would redirect to provider
      const res = await settingsService.connectAccount({
        provider: 'google',
        providerAccountId: `google_${Date.now()}`,
        providerEmail: 'user@gmail.com',
        displayName: 'Google User',
        accessToken: 'mock_token',
      })
      setSuccess('Account connected')
      await loadAll()
    } catch (err) {
      setError(err.message || 'Failed to connect account')
    }
    setConnecting(false)
  }

  async function handleDisconnectAccount(accountId) {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await settingsService.disconnectAccount(accountId)
      setSuccess('Account disconnected')
      setConnectedAccounts(prev => prev.filter(a => a.id !== accountId))
    } catch (err) {
      setError(err.message || 'Failed to disconnect account')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your account, security, and preferences</p>
          </div>
          <button onClick={() => navigate(-1)} className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900">
            &larr; Back
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">{success}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b-2 border-slate-200 pb-4 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
          {activeTab === 'account' && (
            <AccountSettings
              settings={account}
              onSave={(data) => handleSave('account',
                (d) => settingsService.updateAccountSettings(d), data, 'Account settings updated')}
              saving={saving}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettings
              settings={security}
              onSave={(data) => handleSave('security',
                (d) => settingsService.updateSecuritySettings(d), data, 'Security settings updated')}
              onChangePassword={handleChangePassword}
              onLogoutAll={handleLogoutAll}
              saving={saving}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationPreferences
              settings={notifications}
              onSave={(data) => handleSave('notifications',
                (d) => settingsService.updateNotificationSettings(d), data, 'Notification preferences updated')}
              saving={saving}
            />
          )}

          {activeTab === 'privacy' && (
            <PrivacySettings
              settings={privacy}
              onSave={(data) => handleSave('privacy',
                (d) => settingsService.updatePrivacySettings(d), data, 'Privacy settings updated')}
              saving={saving}
            />
          )}

          {activeTab === 'connected' && (
            <ConnectedAccounts
              accounts={connectedAccounts}
              onConnect={handleConnectAccount}
              onDisconnect={handleDisconnectAccount}
              connecting={connecting}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
