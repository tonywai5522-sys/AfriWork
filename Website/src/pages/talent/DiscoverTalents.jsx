import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import TalentCard, { TalentCardSkeleton } from '../../components/talent/TalentCard.jsx'
import TalentFilters from '../../components/talent/TalentFilters.jsx'
import { useBookmarkContext } from '../../context/BookmarkContext.jsx'
import * as talentService from '../../services/talentService.js'

export default function DiscoverTalents() {
  const [talents, setTalents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    query: '',
    skills: [],
    experienceLevel: '',
    availability: '',
    location: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
  })
  const [stats, setStats] = useState({ totalTalent: 0, recentActive: 0 })
  const { toggleSave } = useBookmarkContext()

  const fetchTalents = useCallback(async (pageNum = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = { ...filters, page: pageNum, limit: 12 }
      if (params.hourlyRateMin) params.hourlyRateMin = parseFloat(params.hourlyRateMin)
      if (params.hourlyRateMax) params.hourlyRateMax = parseFloat(params.hourlyRateMax)
      const response = await talentService.searchTalents(params)
      const data = response?.data
      if (pageNum === 1) {
        setTalents(data?.talents || [])
      } else {
        setTalents(prev => [...prev, ...(data?.talents || [])])
      }
      setHasMore(data?.hasMore || false)
    } catch (err) {
      setError(err.message || 'Failed to load talents')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    setPage(1)
    fetchTalents(1)
  }, [fetchTalents])

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await talentService.getTalentStats()
        setStats(response?.data || { totalTalent: 0, recentActive: 0 })
      } catch {}
    }
    loadStats()
  }, [])

  function handleToggleSave(talentId) {
    toggleSave('talent', talentId)
  }

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchTalents(nextPage)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Discover Talent</h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse {stats.totalTalent.toLocaleString() || '...'} professionals on AfriWork
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-2 border-slate-200 bg-white px-5 py-4">
            <p className="text-2xl font-black text-slate-900">{stats.totalTalent.toLocaleString() || '—'}</p>
            <p className="text-xs text-slate-500">Total Talent</p>
          </div>
          <div className="rounded-xl border-2 border-slate-200 bg-white px-5 py-4">
            <p className="text-2xl font-black text-emerald-600">{stats.recentActive.toLocaleString() || '—'}</p>
            <p className="text-xs text-slate-500">Active this month</p>
          </div>
          <div className="rounded-xl border-2 border-slate-200 bg-white px-5 py-4">
            <p className="text-2xl font-black text-slate-900">{talents.length}</p>
            <p className="text-xs text-slate-500">Showing now</p>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mb-6 flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none lg:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="flex gap-8">
          {/* Filters - Desktop sidebar, Mobile toggle */}
          <div className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-24 rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <TalentFilters filters={filters} onChange={setFilters} />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {loading && talents.length === 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map(i => <TalentCardSkeleton key={i} />)}
              </div>
            ) : talents.length === 0 ? (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center">
                <svg className="mx-auto mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <h3 className="text-lg font-bold text-slate-900">No talents found</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Showing {talents.length} talent{hasMore ? '+' : ''}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {talents.map(talent => (
                    <TalentCard
                      key={talent.id}
                      talent={talent}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="rounded-xl border-2 border-slate-900 bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
