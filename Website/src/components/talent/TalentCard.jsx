import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { useBookmarkContext } from '../../context/BookmarkContext.jsx'

export default function TalentCard({ talent }) {
  const { isSaved, toggleSave } = useBookmarkContext()
  const saved = isSaved('talent', talent.id)
  const profile = talent.profile || {}

  const levelColors = {
    entry: 'bg-slate-100 text-slate-700 border-slate-300',
    junior: 'bg-blue-100 text-blue-700 border-blue-300',
    mid: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    senior: 'bg-amber-100 text-amber-700 border-amber-300',
    expert: 'bg-purple-100 text-purple-700 border-purple-300',
  }
  const levelColor = levelColors[profile.experienceLevel] || levelColors.entry

  const avatarInitials = talent.name
    ? talent.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const avatarUrl = profile.avatarUrl

  function handleToggleSave(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleSave('talent', talent.id)
  }

  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-slate-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-slate-600">{avatarInitials}</span>
            )}
          </div>
          <div className="min-w-0">
            <Link to={`/talent/${talent.id}`} className="text-sm font-bold text-slate-900 hover:underline">
              {talent.name}
            </Link>
            {profile.headline && (
              <p className="text-xs text-slate-600 truncate max-w-[200px]">{profile.headline}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {profile.experienceLevel && (
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${levelColor}`}>
                  {profile.experienceLevel}
                </span>
              )}
              {profile.availability === 'available' && (
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  Available
                </span>
              )}
              {profile.hourlyRate > 0 && (
                <span className="text-[9px] font-bold text-slate-500">
                  ${profile.hourlyRate}/{profile.currency === 'USD' ? 'hr' : profile.currency}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleToggleSave}
          className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 transition-all ${
            saved
              ? 'border-red-400 bg-red-50 text-red-500 hover:bg-red-100'
              : 'border-slate-300 text-slate-400 hover:border-slate-900 hover:text-slate-900'
          }`}
        >
          <svg className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {profile.skills && profile.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {profile.skills.slice(0, 5).map((skill, i) => (
            <span key={i} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-medium text-slate-600">
              {skill.name}
            </span>
          ))}
          {profile.skills.length > 5 && (
            <span className="text-[9px] font-bold text-slate-400">+{profile.skills.length - 5}</span>
          )}
        </div>
      )}

      {profile.location && (
        <p className="mt-3 text-[10px] text-slate-400">
          <svg className="mr-1 inline h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {profile.location}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Link
          to={`/talent/${talent.id}`}
          className="flex-1 rounded-xl border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-center text-[10px] font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          View Profile
        </Link>
        <button
          className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900 active:translate-x-[2px] active:translate-y-[2px]"
        >
          Contact
        </button>
      </div>
    </div>
  )
}

export function TalentCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)]">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-3 w-48 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 flex gap-1">
        <div className="h-5 w-16 rounded bg-slate-100" />
        <div className="h-5 w-20 rounded bg-slate-100" />
        <div className="h-5 w-14 rounded bg-slate-100" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 flex-1 rounded-xl bg-slate-200" />
        <div className="h-8 flex-1 rounded-xl bg-slate-100" />
      </div>
    </div>
  )
}
