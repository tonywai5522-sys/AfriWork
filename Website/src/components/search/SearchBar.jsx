import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { globalSearch, getRecentSearches, deleteRecentSearch } from '../../services/searchService.js'
import { ROUTES } from '../../constants/routes.js'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'users', label: 'Users' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'projects', label: 'Projects' },
  { value: 'organizations', label: 'Organizations' },
  { value: 'teams', label: 'Teams' },
  { value: 'skills', label: 'Skills' },
]

export default function SearchBar({ onSearch, placeholder = 'Search anything...', className = '' }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
        setTypeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch recent searches on focus
  const handleFocus = useCallback(async () => {
    try {
      const res = await getRecentSearches()
      if (res.success) {
        setRecentSearches(res.data?.results || [])
      }
    } catch {
      // ignore
    }
    setIsOpen(true)
  }, [])

  // Debounced search
  const handleQueryChange = useCallback((e) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await globalSearch({ query: val, type, page: 1, limit: 5 })
        if (res.success) {
          setResults(res.data?.results || [])
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [type])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSubmit = useCallback((q, t) => {
    const searchQuery = q ?? query
    const searchType = t ?? type
    if (!searchQuery.trim()) return
    setIsOpen(false)
    setResults([])
    if (onSearch) {
      onSearch(searchQuery, searchType)
    } else {
      navigate(`${ROUTES.search}?q=${encodeURIComponent(searchQuery)}&type=${searchType}`)
    }
  }, [query, type, onSearch, navigate])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }, [handleSubmit])

  const handleRecentClick = useCallback((recent) => {
    setQuery(recent.query)
    setType(recent.type || 'all')
    handleSubmit(recent.query, recent.type || 'all')
  }, [handleSubmit])

  const handleDeleteRecent = useCallback(async (e, searchId) => {
    e.stopPropagation()
    try {
      await deleteRecentSearch(searchId)
      setRecentSearches((prev) => prev.filter((s) => s.$id !== searchId && s.id !== searchId))
    } catch {
      // ignore
    }
  }, [])

  const handleResultClick = useCallback((result) => {
    setIsOpen(false)
    setResults([])
    if (result.url) {
      navigate(result.url)
    }
  }, [navigate])

  const getTypeIcon = (entityType) => {
    switch (entityType) {
      case 'users': return '👤'
      case 'jobs': return '💼'
      case 'projects': return '📁'
      case 'organizations': return '🏢'
      case 'teams': return '👥'
      case 'skills': return '⭐'
      default: return '🔍'
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Search input row */}
      <div className="flex items-center rounded-2xl border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        {/* Type filter dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
            className="flex items-center gap-1 border-r-2 border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {TYPE_OPTIONS.find((o) => o.value === type)?.label || 'All'}
            <svg className={`h-3 w-3 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {typeDropdownOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-44 rounded-2xl border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-1">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setType(opt.value); setTypeDropdownOpen(false) }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${
                    type === opt.value ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); handleQueryChange(e) }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none min-w-0"
        />

        {/* Search button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="flex items-center justify-center bg-slate-900 px-3 py-2 text-white transition-all hover:bg-slate-800"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
        </button>
      </div>

      {/* Dropdown: recent searches + autocomplete results */}
      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-2xl border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((recent) => (
                  <div key={recent.$id || recent.id} className="group flex items-center gap-1">
                    <button
                      onClick={() => handleRecentClick(recent)}
                      className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition-all hover:border-slate-900 hover:bg-white"
                    >
                      {getTypeIcon(recent.type)} {recent.query}
                    </button>
                    <button
                      onClick={(e) => handleDeleteRecent(e, recent.$id || recent.id)}
                      className="hidden h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:text-red-500 group-hover:flex"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Autocomplete results */}
          {query && results.length > 0 && (
            <div className="max-h-72 overflow-y-auto p-2">
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggestions</p>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-50 text-sm">
                    {getTypeIcon(result.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{result.title}</p>
                    <p className="truncate text-xs text-slate-500">{result.subtitle || result.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results state */}
          {query && !loading && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400">No results found</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="px-4 py-6 text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            </div>
          )}

          {/* Search all results link */}
          {query && results.length > 0 && (
            <div className="border-t-2 border-slate-200 p-2">
              <button
                onClick={() => handleSubmit()}
                className="block w-full rounded-xl py-2 text-center text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                See all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}