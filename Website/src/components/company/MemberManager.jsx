import { useState } from 'react'

const ROLES = ['recruiter', 'manager', 'admin']
const STATUS_LABELS = { pending: 'Pending', active: 'Active', declined: 'Declined' }
const STATUS_COLORS = { pending: 'bg-amber-100 text-amber-700 border-amber-300', active: 'bg-emerald-100 text-emerald-700 border-emerald-300', declined: 'bg-red-100 text-red-700 border-red-300' }

export default function MemberManager({ members = [], onInvite, onUpdate, onRemove }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('recruiter')
  const [inviteName, setInviteName] = useState('')
  const [showInvite, setShowInvite] = useState(false)

  async function handleInvite(e) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    await onInvite({ email: inviteEmail.trim(), role: inviteRole, name: inviteName.trim() })
    setInviteEmail('')
    setInviteName('')
    setShowInvite(false)
  }

  const isOwner = (m) => m.role === 'admin' && m.userId

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {members.length} Member{members.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => setShowInvite(!showInvite)}
          className="rounded-xl border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          + Invite
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="rounded-xl border-2 border-slate-900 bg-white p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
          <h4 className="mb-3 text-sm font-bold text-slate-900">Invite Member</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="Full name"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
            />
            <input
              className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              placeholder="Email address *"
              type="email"
              required
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
            <select
              className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
            >
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" disabled={!inviteEmail.trim()} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50">Send Invite</button>
              <button type="button" onClick={() => setShowInvite(false)} className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-3 transition-all hover:border-slate-300"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 text-xs font-bold ${
                isOwner(m) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-slate-100 text-slate-600'
              }`}>
                {(m.name?.[0] || m.email?.[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{m.name || 'Pending User'}</p>
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {isOwner(m) ? (
                <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">Owner</span>
              ) : (
                <>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${STATUS_COLORS[m.status] || STATUS_COLORS.pending}`}>
                    {STATUS_LABELS[m.status] || m.status}
                  </span>
                  <select
                    className="rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-bold text-slate-600"
                    value={m.role}
                    onChange={e => onUpdate(m.id, { role: e.target.value })}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => onRemove(m.id)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <p className="text-center text-xs text-slate-400 italic">No members yet. Invite recruiters to join your organization.</p>
      )}
    </div>
  )
}
