import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import * as bookmarkService from '../../services/bookmarkService.js'
import { useBookmarkContext } from '../../context/BookmarkContext.jsx'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'job', label: 'Jobs' },
  { key: 'talent', label: 'Talents' },
  { key: 'project', label: 'Projects' },
  { key: 'organization', label: 'Companies' },
  { key: 'course', label: 'Courses' },
]

const TYPE_ROUTES = {
  job: '/jobs/',
  talent: '/network/',
  project: '/projects/',
  organization: '/company/',
  portfolio: '/portfolio/',
  course: '/learning/',
}

const TYPE_COLORS = {
  job: 'bg-blue-100 text-blue-700 border-blue-300',
  talent: 'bg-purple-100 text-purple-700 border-purple-300',
  project: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  organization: 'bg-amber-100 text-amber-700 border-amber-300',
  portfolio: 'bg-pink-100 text-pink-700 border-pink-300',
  course: 'bg-cyan-100 text-cyan-700 border-cyan-300',
}

export default function SavedItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const { bookmarkMap, toggleSave } = useBookmarkContext()

  useEffect(() => {
    loadItems(1)
  }, [tab])

  async function loadItems(pageNum = 1) {
    setLoading(true)
    try {
      const params = { page: pageNum, populated: true }
      if (tab !== 'all') params.type = tab
      const res = await bookmarkService.getUserBookmarks(params)
      const result = res.data?.bookmarks || []
      if (pageNum === 1) setItems(result)
      else setItems(prev => [...prev, ...result])
      setTotal(res.data?.total || 0)
      setHasMore(res.data?.hasMore || false)
      setPage(pageNum)
    } catch { /* */ }
    setLoading(false)
  }

  async function handleRemove(targetType, targetId) {
    await toggleSave(targetType, targetId)
    setItems(prev => prev.filter(b => !(b.targetType === targetType && b.targetId === targetId)))
    setTotal(prev => Math.max(0, prev - 1))
  }

  async function handleUnsaveAll(type) {
    const toRemove = type && type !== 'all'
      ? items.filter(b => b.targetType === type)
      : items
    for (const bm of toRemove) {
      await toggleSave(bm.targetType, bm.targetId)
    }
    setItems(type && type !== 'all' ? items.filter(b => b.targetType !== type) : [])
    setTotal(0)
  }

  function getLink(bookmark) {
    const base = TYPE_ROUTES[bookmark.targetType]
    return base ? `${base}${bookmark.targetId}` : '#'
  }

  function getTypeLabel(type) {
    return TABS.find(t => t.key === type)?.label || type
  }

  const typeCounts = {}
  for (const [type, ids] of Object.entries(bookmarkMap)) {
    if (ids?.length) typeCounts[type] = ids.length
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Saved Items</h1>
            <p className="mt-1 text-sm text-slate-500">{total} saved items</p>
          </div>
          {total > 0 && (
            <button onClick={() => handleUnsaveAll(tab === 'all' ? null : tab)}
              className="rounded-xl border-2 border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:border-red-400 hover:bg-red-50">
              Unsave {tab !== 'all' ? `All ${getTypeLabel(tab)}` : 'All'}
            </button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                tab === t.key
                  ? 'border-2 border-slate-900 bg-slate-900 text-white'
                  : 'border-2 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}>
              {t.label}
              {t.key !== 'all' && typeCounts[t.key] ? ` (${typeCounts[t.key]})` : ''}
            </button>
          ))}
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border-2 border-slate-200 bg-slate-50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <p className="mt-4 text-lg font-bold text-slate-400">No saved items</p>
            <p className="mt-1 text-sm text-slate-400">Bookmark jobs, talents, projects, and more to find them later</p>
            <Link to="/jobs" className="mt-4 inline-block rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {items.map(bm => {
                const item = bm.item
                const route = getLink(bm)
                return (
                  <div key={`${bm.targetType}-${bm.targetId}`}
                    className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-slate-300">
                    <Link to={route} className="flex min-w-0 flex-1 items-center gap-4">
                      {/* Thumbnail */}
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 overflow-hidden ${
                        TYPE_COLORS[bm.targetType] || 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}>
                        {item?.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold">{bm.targetType[0].toUpperCase()}</span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {item?.title || bm.targetId.slice(0, 20)}
                        </p>
                        <p className="text-xs text-slate-400">
                          <span className={`inline-block rounded border px-1.5 py-0.5 text-[9px] font-bold mr-2 ${
                            TYPE_COLORS[bm.targetType] || 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}>
                            {getTypeLabel(bm.targetType)}
                          </span>
                          {item?.subtitle && <span>{item.subtitle}</span>}
                          {bm.createdAt && !item?.subtitle && (
                            <span>Saved {new Date(bm.createdAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    </Link>
                    <button onClick={() => handleRemove(bm.targetType, bm.targetId)}
                      className="shrink-0 rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-red-300 hover:text-red-600">
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
            {hasMore && (
              <div className="mt-6 text-center">
                <button onClick={() => loadItems(page + 1)}
                  className="rounded-xl border-2 border-slate-300 px-6 py-2 text-xs font-bold text-slate-600 hover:border-slate-900">
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
