import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'

const STATUS_COLORS = {
  active: 'border-emerald-300 bg-emerald-50',
  archived: 'border-slate-300 bg-slate-50',
  disabled: 'border-red-300 bg-red-50',
}

export default function TeamCard({ team }) {
  const memberCount = team.members?.length || 0
  const activeMembers = team.members?.filter(m => m.status === 'active').length || 0
  const pendingMembers = team.members?.filter(m => m.status === 'pending').length || 0
  const colorClass = STATUS_COLORS[team.status] || STATUS_COLORS.active

  return (
    <Link
      to={`${ROUTES.teams}/${team.id}`}
      className={`block rounded-2xl border-2 p-5 transition-all hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${colorClass}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-900 bg-white text-sm font-black text-slate-900">
          {team.name?.[0]?.toUpperCase() || '?'}
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${
          team.status === 'active' ? 'border-emerald-300 bg-emerald-100 text-emerald-700' :
          team.status === 'archived' ? 'border-slate-300 bg-slate-100 text-slate-600' :
          'border-red-300 bg-red-100 text-red-700'
        }`}>
          {team.status}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-bold text-slate-900 truncate">{team.name}</h3>
      {team.description && (
        <p className="mt-1 text-xs text-slate-600 line-clamp-2">{team.description}</p>
      )}

      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </span>
        {pendingMembers > 0 && (
          <span className="flex items-center gap-1 text-amber-600">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pendingMembers} pending
          </span>
        )}
      </div>
    </Link>
  )
}
