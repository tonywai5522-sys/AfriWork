import { useState, useEffect } from 'react'

const TIMEZONES = [
  'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5',
  'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3',
  'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12',
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'ar', label: 'العربية' },
  { value: 'pt', label: 'Português' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'ha', label: 'Hausa' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'ig', label: 'Igbo' },
  { value: 'am', label: 'Amharic' },
]

const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'sw-KE', label: 'Swahili (Kenya)' },
]

export default function AccountSettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', username: '', timezone: '', language: 'en', locale: 'en-US' })

  useEffect(() => {
    if (settings) {
      setForm({
        fullName: settings.fullName || '',
        email: settings.email || '',
        phone: settings.phone || '',
        username: settings.username || '',
        timezone: settings.timezone || '',
        language: settings.language || 'en',
        locale: settings.locale || 'en-US',
      })
    }
  }, [settings])

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      fullName: form.fullName,
      phone: form.phone,
      username: form.username,
      timezone: form.timezone,
      language: form.language,
      locale: form.locale,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-6 text-lg font-bold text-slate-900">Account Settings</h2>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-900">Full Name</label>
            <input
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-900">Email</label>
            <input
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              value={form.email}
              disabled
            />
            {settings?.emailVerified ? (
              <span className="mt-1 inline-block text-[10px] font-bold text-emerald-600">✓ Verified</span>
            ) : (
              <span className="mt-1 inline-block text-[10px] font-bold text-amber-600">Pending verification</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-900">Phone</label>
            <input
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+254 712 345 678"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-900">Username</label>
            <input
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="your_username"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-900">Timezone</label>
            <select
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
              value={form.timezone}
              onChange={e => setForm({ ...form, timezone: e.target.value })}
            >
              <option value="">Select</option>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-900">Language</label>
            <select
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
              value={form.language}
              onChange={e => setForm({ ...form, language: e.target.value })}
            >
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-900">Locale</label>
            <select
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
              value={form.locale}
              onChange={e => setForm({ ...form, locale: e.target.value })}
            >
              {LOCALES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t-2 border-slate-200 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl border-2 border-slate-900 bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Account Settings'}
        </button>
      </div>
    </form>
  )
}
