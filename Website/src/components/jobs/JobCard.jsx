import { Link } from 'react-router-dom'
import { useBookmarkContext } from '../../context/BookmarkContext.jsx'

export default function JobCard({ job }) {
  const { isSaved, toggleSave } = useBookmarkContext()
  const bookmarked = isSaved('job', job.id)

  const typeColors = {
    full_time: 'bg-blue-100 text-blue-700 border-blue-300',
    part_time: 'bg-purple-100 text-purple-700 border-purple-300',
    contract: 'bg-amber-100 text-amber-700 border-amber-300',
    internship: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    volunteer: 'bg-pink-100 text-pink-700 border-pink-300',
  }
  const levelColors = {
    entry: 'bg-slate-100 text-slate-600 border-slate-300',
    junior: 'bg-blue-50 text-blue-600 border-blue-200',
    mid: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    senior: 'bg-amber-50 text-amber-600 border-amber-200',
    expert: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  function handleBookmark(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleSave('job', job.id)
  }

  return (
    <div className={`rounded-2xl border-2 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] ${job.isFeatured ? 'border-amber-400 bg-amber-50' : 'border-slate-900 bg-white'}`}>
      {job.isFeatured && <p className="mb-2 text-[10px] font-bold text-amber-700">&#9733; Featured</p>}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link to={`/jobs/${job.id}`} className="text-sm font-bold text-slate-900 hover:underline">{job.title}</Link>
          <p className="mt-0.5 text-xs text-slate-600">{job.companyName || 'Company'}{job.location ? ` · ${job.location}` : ''}{job.remote ? ' · Remote' : ''}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {job.jobType && <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${typeColors[job.jobType] || typeColors.full_time}`}>{job.jobType.replace('_', ' ')}</span>}
            {job.experienceLevel && <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${levelColors[job.experienceLevel] || levelColors.mid}`}>{job.experienceLevel}</span>}
            {job.salaryRange && <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600">{job.salaryRange}</span>}
          </div>
        </div>
        <button onClick={handleBookmark} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${bookmarked ? 'border-red-300 bg-red-50 text-red-500' : 'border-slate-300 text-slate-400 hover:border-slate-900 hover:text-slate-900'}`}>
          <svg className="h-3.5 w-3.5" fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
        </button>
      </div>
      {job.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {job.skills.slice(0, 4).map((s, i) => <span key={i} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-500">{s}</span>)}
          {job.skills.length > 4 && <span className="text-[9px] text-slate-400">+{job.skills.length - 4}</span>}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Link to={`/jobs/${job.id}`} className="flex-1 rounded-xl border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-center text-[10px] font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">View Details</Link>
        <button className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 active:translate-x-[2px] active:translate-y-[2px]">Apply Now</button>
      </div>
    </div>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)]">
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mb-3 h-3 w-1/2 rounded bg-slate-100" />
      <div className="mb-3 flex gap-1"><div className="h-5 w-16 rounded-full bg-slate-100" /><div className="h-5 w-14 rounded-full bg-slate-100" /></div>
      <div className="flex gap-2"><div className="h-8 flex-1 rounded-xl bg-slate-200" /><div className="h-8 flex-1 rounded-xl bg-slate-100" /></div>
    </div>
  )
}
