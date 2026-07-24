import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'
import * as authService from '../../services/authService.js'

export default function DashboardPage() {
  const { user, logout, sendVerification } = useAuth()
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    async function loadSessions() {
      setSessionsLoading(true)
      try {
        const response = await authService.listSessions()
        setSessions(response?.data?.sessions || [])
      } catch {
        // Silently fail
      } finally {
        setSessionsLoading(false)
      }
    }
    loadSessions()
  }, [])

  async function handleRevokeSession(sessionId) {
    setActionError('')
    setActionMessage('')
    try {
      await authService.revokeSession(sessionId)
      setSessions(prev => prev.filter(s => s.$id !== sessionId))
      setActionMessage('Session revoked')
    } catch (err) {
      setActionError(err.message || 'Failed to revoke session')
    }
  }

  async function handleResendVerification() {
    setActionError('')
    setActionMessage('')
    try {
      await sendVerification()
      setActionMessage('Verification email sent!')
    } catch (err) {
      setActionError(err.message || 'Failed to send verification')
    }
  }

  async function handleLogout() {
    await logout()
  }

  const roleBadgeColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-300',
    employer: 'bg-blue-100 text-blue-800 border-blue-300',
    moderator: 'bg-orange-100 text-orange-800 border-orange-300',
    partner: 'bg-teal-100 text-teal-800 border-teal-300',
    talent: 'bg-green-100 text-green-800 border-green-300',
  }

  const roleColor = roleBadgeColors[user?.role] || roleBadgeColors.talent

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Welcome back, {user?.name || user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-xl border-2 border-slate-900 bg-white px-5 py-2 text-sm font-bold text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          Sign Out
        </button>
      </div>

      {/* Action Messages */}
      {actionMessage && (
        <div className="mb-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">{actionMessage}</p>
        </div>
      )}
      {actionError && (
        <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{actionError}</p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Profile</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Name</span>
                <span className="text-sm font-medium text-slate-900">{user?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Email</span>
                <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  {user?.email}
                  {user?.emailVerified ? (
                    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={handleResendVerification}
                      className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 hover:bg-amber-100"
                    >
                      Verify
                    </button>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Role</span>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${roleColor}`}>
                  {user?.role || 'talent'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">User ID</span>
                <span className="font-mono text-xs text-slate-400">{user?.id}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to={ROUTES.profile}
                className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                Edit Profile
              </Link>
              <Link
                to={ROUTES.settings}
                className="rounded-xl border-2 border-slate-900 bg-white px-5 py-2 text-sm font-bold text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Quick Stats</h2>
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-black text-slate-900">{sessions.length}</p>
                <p className="text-xs text-slate-500">Active Sessions</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-black text-slate-900">
                  {user?.emailVerified ? '1' : '0'}
                </p>
                <p className="text-xs text-slate-500">Verifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="mt-8">
        <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Active Sessions</h2>
            <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-600">
              {sessions.length} active
            </span>
          </div>

          {sessionsLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No active sessions</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.$id}
                  className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {session.osName || session.clientName || 'Unknown Device'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {session.countryName || 'Unknown location'}
                      {session.ipAddress ? ` · ${session.ipAddress}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      Created: {formatDate(session.$createdAt)}
                      {session.$expireAt ? ` · Expires: ${formatDate(session.$expireAt)}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session.$id)}
                    className="ml-4 shrink-0 rounded-lg border-2 border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 hover:border-red-300"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Section */}
      {user?.role === 'admin' && (
        <div className="mt-8">
          <div className="rounded-2xl border-2 border-purple-500 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="mb-2 text-lg font-bold text-purple-900">Admin Panel</h2>
            <p className="mb-4 text-sm text-slate-600">You have administrator privileges.</p>
            <Link
              to={ROUTES.admin}
              className="inline-block rounded-xl border-2 border-purple-600 bg-purple-600 px-5 py-2 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-purple-700 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              Go to Admin
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
