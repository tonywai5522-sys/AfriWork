import { useState, useEffect } from 'react'

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

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
  { value: 'connections_only', label: 'Connections Only', desc: 'Only your connections can see your profile' },
  { value: 'private', label: 'Private', desc: 'Only you can see your profile' },
]

export default function PrivacySettings({ settings, onSave, saving }) {
  const [prefs, setPrefs] = useState({
    profileVisibility: 'public',
    searchIndexing: true,
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showRate: true,
    dataForPersonalization: true,
  })

  useEffect(() => {
    if (settings) {
      setPrefs(prev => ({ ...prev, ...settings }))
    }
  }, [settings])

  function handleSave() {
    onSave(prefs)
  }

  const toggles = [
    { key: 'searchIndexing', label: 'Search Indexing', desc: 'Allow search engines to index your profile' },
    { key: 'showEmail', label: 'Show Email', desc: 'Display your email address on your profile' },
    { key: 'showPhone', label: 'Show Phone', desc: 'Display your phone number on your profile' },
    { key: 'showLocation', label: 'Show Location', desc: 'Display your location on your profile' },
    { key: 'showRate', label: 'Show Rate', desc: 'Display your hourly rate on your profile' },
    { key: 'dataForPersonalization', label: 'Personalization', desc: 'Use your data for personalized recommendations' },
  ]

  return (
    <div>
      <h2 className="mb-6 text-lg font-bold text-slate-900">Privacy Settings</h2>

      <div className="space-y-8">
        {/* Profile Visibility */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">Profile Visibility</h3>
          <div className="space-y-3">
            {VISIBILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrefs(prev => ({ ...prev, profileVisibility: opt.value }))}
                className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  prefs.profileVisibility === opt.value
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  prefs.profileVisibility === opt.value ? 'border-slate-900' : 'border-slate-300'
                }`}>
                  {prefs.profileVisibility === opt.value && (
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="border-t-2 border-slate-200 pt-6">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Profile Visibility Settings</h3>
          <div className="space-y-2">
            {toggles.map(t => (
              <div key={t.key} className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.label}</p>
                  <p className="text-xs text-slate-500">{t.desc}</p>
                </div>
                <Toggle
                  enabled={prefs[t.key]}
                  onChange={() => setPrefs(prev => ({ ...prev, [t.key]: !prev[t.key] }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t-2 border-slate-200 pt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl border-2 border-slate-900 bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </button>
      </div>
    </div>
  )
}
