import { useState, useEffect } from 'react'

const SESSION_TIMEOUTS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 1440, label: '24 hours' },
]

export default function SecuritySettings({ settings, onSave, onChangePassword, onLogoutAll, saving }) {
  const [sessionTimeout, setSessionTimeout] = useState(60)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [pwErrors, setPwErrors] = useState([])
  const [showPwForm, setShowPwForm] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    if (settings) {
      setSessionTimeout(settings.sessionTimeout || 60)
      setSessions(settings.activeSessions || [])
    }
  }, [settings])

  function validatePassword() {
    const errors = []
    if (!pwForm.currentPassword) errors.push('Current password is required')
    if (pwForm.newPassword.length < 8) errors.push('New password must be at least 8 characters')
    if (!/[A-Z]/.test(pwForm.newPassword)) errors.push('Include an uppercase letter')
    if (!/[a-z]/.test(pwForm.newPassword)) errors.push('Include a lowercase letter')
    if (!/[0-9]/.test(pwForm.newPassword)) errors.push('Include a number')
    if (!/[^A-Za-z0-9]/.test(pwForm.newPassword)) errors.push('Include a special character')
    if (pwForm.newPassword !== pwForm.confirmNewPassword) errors.push('Passwords do not match')
    setPwErrors(errors)
    return errors.length === 0
  }

  async function handleChangePw(e) {
    e.preventDefault()
    if (!validatePassword()) return
    setChangingPw(true)
    await onChangePassword(pwForm.currentPassword, pwForm.newPassword, pwForm.confirmNewPassword)
    setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    setShowPwForm(false)
    setChangingPw(false)
  }

  function handleSaveTimeout() {
    onSave({ sessionTimeout })
  }

  function formatDate(d) {
    if (!d) return 'N/A'
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-bold text-slate-900">Security Settings</h2>

      <div className="space-y-8">
        {/* Session Timeout */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-900">Session Timeout</h3>
          <p className="mb-3 text-xs text-slate-500">Automatically log out after inactivity</p>
          <div className="flex items-center gap-3">
            <select
              className="rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
              value={sessionTimeout}
              onChange={e => setSessionTimeout(parseInt(e.target.value))}
            >
              {SESSION_TIMEOUTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button
              onClick={handleSaveTimeout}
              disabled={saving}
              className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="border-t-2 border-slate-200 pt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Password</h3>
          {!showPwForm ? (
            <button
              onClick={() => setShowPwForm(true)}
              className="rounded-xl border-2 border-slate-900 px-5 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePw} className="space-y-4 max-w-md">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-900">Current Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-900">New Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-900">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                  value={pwForm.confirmNewPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmNewPassword: e.target.value })}
                />
              </div>

              {pwErrors.length > 0 && (
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold text-amber-800 mb-1">Password requirements:</p>
                  <ul className="space-y-0.5">
                    {pwErrors.map((err, i) => <li key={i} className="text-[10px] text-amber-700">• {err}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={changingPw}
                  className="rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {changingPw ? 'Sending...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPwForm(false); setPwErrors([]) }}
                  className="rounded-xl border-2 border-slate-300 px-6 py-2.5 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Active Sessions */}
        <div className="border-t-2 border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Sessions</h3>
              <p className="text-xs text-slate-500">{sessions.length} active session{sessions.length !== 1 ? 's' : ''}</p>
            </div>
            {sessions.length > 1 && (
              <button
                onClick={onLogoutAll}
                className="rounded-xl border-2 border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:border-red-400 hover:bg-red-50"
              >
                Logout All
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No session data available</p>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${
                  s.current ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                }`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {s.osName || s.clientName || 'Unknown Device'}
                      </p>
                      {s.current && (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {s.countryName || 'Unknown location'}
                      {s.ipAddress ? ` · ${s.ipAddress}` : ''}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Created: {formatDate(s.createdAt)}
                      {s.expireAt ? ` · Expires: ${formatDate(s.expireAt)}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
