import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBookmarkContext } from '../../context/BookmarkContext.jsx'
import BookmarkButton from '../../components/bookmarks/BookmarkButton.jsx'
import * as learningService from '../../services/learningService.js'

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced']
const SORT_OPTIONS = [
  { value: 'date', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
]

export default function CourseListing() {
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [filters, setFilters] = useState({ categoryId: '', level: '', search: '', sortBy: 'date' })

  useEffect(() => {
    learningService.getCategories().then(r => setCategories(r.data?.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true); setPage(1)
    learningService.listCourses({ ...filters, page: 1 }).then(r => {
      setCourses(r.data?.courses || []); setHasMore(r.data?.hasMore || false)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [filters])

  async function loadMore() {
    const np = page + 1; setPage(np)
    const r = await learningService.listCourses({ ...filters, page: np })
    setCourses(prev => [...prev, ...(r.data?.courses || [])]); setHasMore(r.data?.hasMore || false)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-2 text-3xl font-black text-slate-900">Learning Hub</h1>
      <p className="mb-8 text-sm text-slate-500">Expand your skills with courses</p>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Search courses..." value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900 w-64" />
        <select value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}
          className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.level} onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}
          className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          {LEVELS.map(l => <option key={l} value={l === 'all' ? '' : l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
        <select value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
          className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100 border-2 border-slate-200" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center">
          <p className="text-lg font-bold text-slate-400">No courses found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div key={course.id} className="relative group rounded-2xl border-2 border-slate-200 bg-white overflow-hidden transition-all hover:border-slate-900 hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                <Link to={`/learning/${course.id}`} className="block">
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl">
                    {course.isFree ? '📚' : '💰'}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">{course.level}</span>
                      {course.isFree && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Free</span>}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-700">{course.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{course.shortDescription || course.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{course.lessonCount || 0} lessons</span>
                      <span>{course.duration || 0} min</span>
                      {course.rating > 0 && <span>★ {course.rating.toFixed(1)}</span>}
                    </div>
                  </div>
                </Link>
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton targetType="course" targetId={course.id} size="xs" />
                </div>
              </div>
            ))}
          </div>
          {hasMore && <div className="mt-8 text-center"><button onClick={loadMore} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-slate-700">Load More</button></div>}
        </>
      )}
    </div>
  )
}
