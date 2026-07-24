import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'

const STATUS_COLORS = {
  active: 'border-emerald-300 bg-emerald-50',
  archived: 'border-slate-300 bg-slate-50',
  disabled: 'border-red-300 bg-red-50',
  completed: 'border-blue-300 bg-blue-50',
  on_hold: 'border-amber-300 bg-amber-50',
}

export default function ProjectCard({ project }) {
  const memberCount = project.members?.length || 0
  const colorClass = STATUS_COLORS[project.status] || STATUS_COLORS.active
  const progress = project.progress || 0
  const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
  const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null

  return (
    <Link
      to={ROUTES.workspaceDetail.replace(':workspaceId', project.id)}
      className={`block rounded-2xl border-2 p-5 transition-all hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${colorClass}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-900 bg-white text-sm font-black text-slate-900">
          {project.title?.[0]?.toUpperCase() || '?'}
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${
          project.status === 'active' ? 'border-emerald-300 bg-emerald-100 text-emerald-700' :
          project.status === 'completed' ? 'border-blue-300 bg-blue-100 text-blue-700' :
          project.status === 'on_hold' ? 'border-amber-300 bg-amber-100 text-amber-700' :
          project.status === 'archived' ? 'border-slate-300 bg-slate-100 text-slate-600' :
          'border-red-300 bg-red-100 text-red-700'
        }`}>
          {project.status?.replace('_', ' ')}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-bold text-slate-900 truncate">{project.title}</h3>
      {project.description && (
        <p className="mt-1 text-xs text-slate-600 line-clamp-2">{project.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-slate-600">{progress}%</span>
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </span>
        {project.visibility && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            {project.visibility}
          </span>
        )}
      </div>

      {(startDate || endDate) && (
        <div className="mt-2 text-[10px] text-slate-400">
          {startDate && <span>{startDate}</span>}
          {startDate && endDate && <span> → </span>}
          {endDate && <span>{endDate}</span>}
        </div>
      )}
    </Link>
  )
}