import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import JobCard, { JobCardSkeleton } from '../../components/jobs/JobCard.jsx'
import { useBookmarkContext } from '../../context/BookmarkContext.jsx'
import * as jobService from '../../services/jobService.js'

const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'volunteer']
const EXP_LEVELS = ['entry', 'junior', 'mid', 'senior', 'expert']
const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'HR', 'Legal', 'Other']

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ query: '', location: '', jobType: '', experienceLevel: '', category: '', remote: '', sortBy: 'createdAt', sortOrder: 'desc' })
  const { toggleSave } = useBookmarkContext()

  const fetchJobs = useCallback(async (pageNum = 1) => {
    setLoading(true); setError('')
    try {
      const params = { ...filters, page: pageNum, limit: 12 }
      if (params.remote === 'true') params.remote = true; else delete params.remote
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== false) delete params[k] })
      const r = await jobService.searchJobs(params)
      const d = r?.data
      setJobs(prev => pageNum === 1 ? (d?.jobs || []) : [...prev, ...(d?.jobs || [])])
      setHasMore(d?.hasMore || d?.jobs?.length >= 12)
    } catch (e) { setError(e.message || 'Failed to load') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { setPage(1); fetchJobs(1) }, [fetchJobs])

  useEffect(() => {
    jobService.getFeaturedJobs().then(r => setFeatured(r?.data?.jobs || [])).catch(() => {})
  }, [])

  function handleToggleBookmark(jobId) {
    toggleSave('job', jobId)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div><h1 className="text-3xl font-black tracking-tight text-slate-900">Find Jobs</h1><p className="mt-1 text-sm text-slate-600">{jobs.length} jobs found</p></div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none lg:hidden">{showFilters ? 'Hide' : 'Show'} Filters</button>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-sm font-bold text-slate-900">&#9733; Featured Jobs</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {featured.slice(0, 3).map(j => (
                <div key={j.id} className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                  <p className="text-sm font-bold text-slate-900">{j.title}</p>
                  <p className="text-xs text-slate-600">{j.companyName}</p>
                  <Link to={`/jobs/${j.id}`} className="mt-2 inline-block text-[10px] font-bold text-amber-700 underline">View &rarr;</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filters */}
          <div className={`w-56 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-24 space-y-4 rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="text-xs font-bold text-slate-900">Filters</h3>
              <div><label className="mb-1 block text-[9px] font-bold text-slate-500 uppercase">Search</label><input className="w-full rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-none" placeholder="Job title..." value={filters.query} onChange={e => setFilters({ ...filters, query: e.target.value })} /></div>
              <div><label className="mb-1 block text-[9px] font-bold text-slate-500 uppercase">Location</label><input className="w-full rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-none" placeholder="Anywhere" value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} /></div>
              <div><label className="mb-1 block text-[9px] font-bold text-slate-500 uppercase">Type</label>
                <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-none" value={filters.jobType} onChange={e => setFilters({ ...filters, jobType: e.target.value })}>
                  <option value="">All</option>{JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div><label className="mb-1 block text-[9px] font-bold text-slate-500 uppercase">Level</label>
                <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-none" value={filters.experienceLevel} onChange={e => setFilters({ ...filters, experienceLevel: e.target.value })}>
                  <option value="">All</option>{EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div><label className="mb-1 block text-[9px] font-bold text-slate-500 uppercase">Category</label>
                <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-none" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="mb-1 block text-[9px] font-bold text-slate-500 uppercase">Remote</label>
                <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-none" value={filters.remote} onChange={e => setFilters({ ...filters, remote: e.target.value })}>
                  <option value="">Any</option><option value="true">Remote Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {error && <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3"><p className="text-sm text-red-700">{error}</p></div>}
            {loading && jobs.length === 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">{[1,2,3,4,5,6].map(i => <JobCardSkeleton key={i} />)}</div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center">
                <svg className="mx-auto mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
                <h3 className="text-lg font-bold text-slate-900">No jobs found</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  {jobs.map(j => (
                    <JobCard key={j.id} job={j}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
                {hasMore && <div className="mt-8 text-center"><button onClick={() => { const np = page + 1; setPage(np); fetchJobs(np) }} disabled={loading} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50">{loading ? 'Loading...' : 'Load More'}</button></div>}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
