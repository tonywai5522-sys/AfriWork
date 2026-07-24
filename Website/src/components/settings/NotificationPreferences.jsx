import { useState, useEffect } from 'react'

const NOTIFICATION_CATEGORIES = [
  { key: 'application_updates', label: 'Application Updates' },
  { key: 'message_alerts', label: 'Message Alerts' },
  { key: 'project_updates', label: 'Project Updates' },
  { key: 'team_invites', label: 'Team Invites' },
  { key: 'job_alerts', label: 'Job Alerts' },
  { key: 'milestone_updates', label: 'Milestone Updates' },
  { key: 'payment_alerts', label: 'Payment Alerts' },
  { key: 'review_reminders', label: 'Review Reminders' },
  { key: 'marketing_emails', label: 'Marketing Emails' },
]

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-10 shrink-0 rounded-full border-2 transition-all ${
        enabled ? 'border-slate-900 bg-slate-900' : 'border-slate-300 bg-slate-100'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-all ${
        enabled ? 'translate-x-4' : 'translate-x-0'
      }`} />
    </button>
  )
}

export default function NotificationPreferences({ settings, onSave, saving }) {
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    push_notifications: true,
    in_app_notifications: true,
    application_updates: true,
    message_alerts: true,
    project_updates: true,
    team_invites: true,
    job_alerts: true,
    milestone_updates: true,
    payment_alerts: true,
    review_reminders: true,
    marketing_emails: false,
    digest_frequency: 'instant',
    quiet_hours_start: '',
    quiet_hours_end: '',
  })

  useEffect(() => {
    if (settings) {
      setPrefs(prev => ({ ...prev, ...settings }))
    }
  }, [settings])

  function toggle(key) {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSave() {
    onSave(prefs)
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-bold text-slate-900">Notification Preferences</h2>

      <div className="space-y-8">
        {/* Delivery Channels */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">Delivery Channels</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive notifications via email</p>
              </div>
              <Toggle enabled={prefs.email_notifications} onChange={() => toggle('email_notifications')} />
            </div>
            <div className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Push Notifications</p>
                <p className="text-xs text-slate-500">Receive push notifications on your device</p>
              </div>
              <Toggle enabled={prefs.push_notifications} onChange={() => toggle('push_notifications')} />
            </div>
            <div className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">In-App Notifications</p>
                <p className="text-xs text-slate-500">Show notifications within the app</p>
              </div>
              <Toggle enabled={prefs.in_app_notifications} onChange={() => toggle('in_app_notifications')} />
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="border-t-2 border-slate-200 pt-6">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Notification Types</h3>
          <div className="space-y-2">
            {NOTIFICATION_CATEGORIES.map(cat => (
              <div key={cat.key} className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-bold text-slate-900">{cat.label}</p>
                <Toggle enabled={prefs[cat.key]} onChange={() => toggle(cat.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Digest Frequency */}
        <div className="border-t-2 border-slate-200 pt-6">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Digest Frequency</h3>
          <div className="flex gap-4">
            {[
              { value: 'instant', label: 'Instant' },
              { value: 'daily', label: 'Daily Digest' },
              { value: 'weekly', label: 'Weekly Digest' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrefs(prev => ({ ...prev, digest_frequency: opt.value }))}
                className={`rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition-all ${
                  prefs.digest_frequency === opt.value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 text-slate-600 hover:border-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="border-t-2 border-slate-200 pt-6">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Quiet Hours</h3>
          <p className="mb-3 text-xs text-slate-500">Mute notifications during these hours</p>
          <div className="flex items-center gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Start</label>
              <input
                type="time"
                className="rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                value={prefs.quiet_hours_start}
                onChange={e => setPrefs(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
              />
            </div>
            <span className="text-slate-400 mt-6">to</span>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">End</label>
              <input
                type="time"
                className="rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                value={prefs.quiet_hours_end}
                onChange={e => setPrefs(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t-2 border-slate-200 pt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl border-2 border-slate-900 bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Notification Preferences'}
        </button>
      </div>
    </div>
  )
}
