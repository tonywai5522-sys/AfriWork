import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [tab, setTab] = useState('general')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Settings saved')
    setSaving(false)
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'system', label: 'System' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Admin Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure platform administration</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-colors ${tab === t.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
        {tab === 'general' && (
          <div className="space-y-5">
            <h3 className="font-bold text-sm">General Settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Platform Name</label>
                <input defaultValue="AfriWork" className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Support Email</label>
                <input defaultValue="support@afriwork.com" type="email" className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Max Users</label>
                <input defaultValue="100000" type="number" className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Default User Role</label>
                <select className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900">
                  <option value="talent">Talent</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
              <span className="text-xs font-medium text-slate-600">Allow new user registrations</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
              <span className="text-xs font-medium text-slate-600">Require email verification</span>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-5">
            <h3 className="font-bold text-sm">Security Settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Session Timeout (minutes)</label>
                <input defaultValue="60" type="number" className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Max Login Attempts</label>
                <input defaultValue="5" type="number" className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
              <span className="text-xs font-medium text-slate-600">Two-factor authentication required for admins</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
              <span className="text-xs font-medium text-slate-600">Log all admin actions</span>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-5">
            <h3 className="font-bold text-sm">Notification Settings</h3>
            <div className="space-y-3">
              {[
                { label: 'New user registration alerts', checked: true },
                { label: 'New organization verification requests', checked: true },
                { label: 'Flagged content notifications', checked: true },
                { label: 'System error alerts', checked: true },
                { label: 'Daily summary emails', checked: false },
                { label: 'Weekly analytics report', checked: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked={item.checked} className="h-4 w-4 rounded border-slate-300" />
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div className="space-y-5">
            <h3 className="font-bold text-sm">System Configuration</h3>
            <div className="rounded-xl border-2 border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 mb-2">API Endpoint</p>
              <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg">http://localhost:5000/api/v1</code>
            </div>
            <div className="rounded-xl border-2 border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 mb-2">Appwrite Database ID</p>
              <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg">afriwork_db</code>
            </div>
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800">⚠️ System Config</p>
              <p className="text-[10px] text-amber-600 mt-1">Changing system settings may affect platform functionality. Proceed with caution.</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 pt-4 border-t-2 border-slate-200">
          <button type="submit" disabled={saving} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,0.3)] hover:bg-slate-800 disabled:opacity-50 transition-all">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button type="button" className="rounded-xl border-2 border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Reset Defaults
          </button>
        </div>
      </form>
    </div>
  )
}
