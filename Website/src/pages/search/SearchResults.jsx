import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import SearchBar from '../../components/search/SearchBar.jsx'
import SearchResultCard, { SearchResultCardSkeleton } from '../../components/search/SearchResultCard.jsx'
import * as searchService from '../../services/searchService.js'

const TYPE_TABS = [
  { value: 'all', label: 'All' },
  { value: 'users', label: 'Users' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'projects', label: 'Projects' },
  { value: 'organizations', label: 'Organizations' },
  { value: 'teams', label: 'Teams' },
  { value: 'skills', label: 'Skills' },
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'planning', label: 'Planning' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'archived', label: 'Archived' },
]

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialQuery = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || 'all'

  const [query, setQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState(initialType)
  const [results, setResults] = useState([])
  const [facets, setFacets] = useState({ types: {}, statuses: {} })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchResults = useCallback(async (q, type, p, sort, status) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await searchService.globalSearch({
        query: q,
        type,
        filters: status ? { status } : {},
        page: p,
        limit: 10,
        sortBy: sort,
      })
      if (res.success) {
        setResults(res.data?.results || [])
        setFacets(res.data?.facets || { types: {}, statuses: {} })
        setTotal(res.data?.total || 0)
      } else {
        setError('Search failed')
      }
    } catch (err) {
      setError(err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchResults(initialQuery, initialType, 1, sortBy, statusFilter)
  }, [initialQuery, initialType, sortBy, statusFilter, fetchResults])

  function handleSearch(searchQuery, searchType) {
    setQuery(searchQuery)
    setActiveType(searchType || 'all')
    setPage(1)
    setSearchParams({ q: searchQuery, type: searchType || 'all', page: '1' })
    fetchResults(searchQuery, searchType || 'all', 1, sortBy, statusFilter)
  }

  function handleTypeChange(newType) {
    setActiveType(newType)
    setPage(1)
    setSearchParams({ q: query, type: newType, page: '1' })
    fetchResults(query, newType, 1, sortBy, statusFilter)
  }

  function handlePageChange(newPage) {
    setPage(newPage)
    setSearchParams({ q: query, type: activeType, page: String(newPage) })
    fetchResults(query, activeType, newPage, sortBy, statusFilter)
  }

  function handleSortChange(e) {
    setSortBy(e.target.value)
    setPage(1)
    fetchResults(query, activeType, 1, e.target.value, statusFilter)
  }

  function handleStatusFilterChange(e) {
    setStatusFilter(e.target.value)
    setPage(1)
    fetchResults(query, activeType, 1, sortBy, e.target.value)
  }

  const totalPages = Math.ceil(total / limit)
  const facetEntries = Object.entries(facets.types || {})
  const showFilters = activeType === 'all' || activeType === 'projects' || activeType === 'jobs'

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Search</h1>
          <p className="mt-1 text-sm text-slate-600">
            {total > 0 ? `Found ${total} result${total !== 1 ? 's' : ''}` : 'Search across users, jobs, projects, and more'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search users, jobs, projects..."
            className="w-full"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Type Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-slate-200 pb-4">
          {TYPE_TABS.map((tab) => {
            const count = tab.value === 'all' ? total : (facets.types[tab.value] || 0)
            return (
              <button
                key={tab.value}
                onClick={() => handleTypeChange(tab.value)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeType === tab.value
                    ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                    : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    activeType === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            {showFilters && (
              <div className="rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <h3 className="mb-3 text-xs font-bold text-slate-900">Filters</h3>

                {/* Sort */}
                <div className="mb-4">
                  <label className="mb-1 block text-[10px] font-bold text-slate-500">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs font-medium focus:border-slate-900 focus:outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status filter */}
                {(activeType === 'all' || activeType === 'projects' || activeType === 'jobs') && (
                  <div className="mb-4">
                    <label className="mb-1 block text-[10px] font-bold text-slate-500">Status</label>
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs font-medium focus:border-slate-900 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status facet counts */}
                {Object.keys(facets.statuses || {}).length > 0 && (
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500">Status Counts</label>
                    <div className="space-y-1">
                      {Object.entries(facets.statuses).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 capitalize">{status.replace('_', ' ')}</span>
                          <span className="font-bold text-slate-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <SearchResultCardSkeleton key={i} />)}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      disabled={page <= 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
                      const pageNum = startPage + i
                      if (pageNum > totalPages) return null
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all ${
                            page === pageNum
                              ? 'border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                              : 'border-slate-300 bg-white text-slate-600 hover:border-slate-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : query && !loading ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 p-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-50">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900">No results found</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search query or filters.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
