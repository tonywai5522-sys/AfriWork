import { useState, useEffect, useCallback } from 'react'
import { getActivityLogs, moderateContent } from '../services/adminService.js'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import toast from 'react-hot-toast'

const ENTITY_COLORS = {
  review: 'border-purple-200 bg-purple-50 text-purple-700',
  comment: 'border-blue-200 bg-blue-50 text-blue-700',
  project: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  job: 'border-amber-200 bg-amber-50 text-amber-700',
  portfolio: 'border-cyan-200 bg-cyan-50 text-cyan-700',
}

export default function ContentModerationPage() {
  const [reports, setReports] = useState([])
  const [page, setPage] = useState(1)
  const [entityFilter, setEntityFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await getActivityLogs({ page: p, limit: 20, entityType: entityFilter || undefined })
      setReports(res.data?.logs || [])
      setPage(p)
    } catch (e) { /* */ }
    setLoading(false)
  }, [entityFilter])

  useEffect(() => { load(1) }, [load])

  async function handleModerate(entityType, entityId, action) {
    try {
      await moderateContent(entityType, entityId, action)
      toast.success(`Content ${action}d`)
      load(page)
    } catch (e) { toast.error(e.message) }
  }

  // Filter only moderation-relevant entries
  const flaggedItems = reports.filter(r => r.action?.toLowerCase().includes('flag') || r.action?.toLowerCase().includes('report') || r.entityType)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Content Moderation</h1>
        <p className="mt-1 text-sm text-slate-500">Review and moderate platform content</p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Flagged Reviews" value={reports.filter(r => r.entityType === 'review').length} color="purple" />
        <StatCard label="Flagged Comments" value={reports.filter(r => r.entityType === 'comment').length} color="blue" />
        <StatCard label="Flagged Projects" value={reports.filter(r => r.entityType === 'project').length} color="emerald" />
        <StatCard label="Flagged Jobs" value={reports.filter(r => r.entityType === 'job').length} color="amber" />
      </div>

      <div className="flex gap-3 mb-4">
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Types</option>
          <option value="review">Reviews</option>
          <option value="comment">Comments</option>
          <option value="project">Projects</option>
          <option value="job">Jobs</option>
          <option value="portfolio">Portfolio</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-xl border-2 border-slate-200 bg-white animate-pulse" />)}
        </div>
      ) : flaggedItems.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
          <span className="text-4xl">📝</span>
          <p className="mt-3 text-sm font-bold text-slate-500">No flagged content</p>
          <p className="mt-1 text-xs text-slate-400">All content is clean</p>
        </div>
      ) : (
        <div className="space-y-2">
          {flaggedItems.slice(0, 50).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold capitalize ${ENTITY_COLORS[item.entityType] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                    {item.entityType || 'unknown'}
                  </span>
                  <span className="text-xs font-bold">{item.action}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.entityId ? `ID: ${item.entityId.slice(0, 16)}...` : ''}
                  {item.userId ? ` · by ${item.userId.slice(0, 12)}...` : ''}
                  <span className="ml-2">{new Date(item.createdAt).toLocaleString()}</span>
                </p>
              </div>
              {item.entityType && item.entityId && (
                <div className="flex gap-1 ml-3">
                  <button onClick={() => handleModerate(item.entityType, item.entityId, 'approve')} className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">Approve</button>
                  <button onClick={() => handleModerate(item.entityType, item.entityId, 'flag')} className="rounded-lg border-2 border-red-300 bg-red-50 px-2 py-1 text-[9px] font-bold text-red-700">Flag</button>
                  <button onClick={() => handleModerate(item.entityType, item.entityId, 'remove')} className="rounded-lg border-2 border-slate-300 bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-700">Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
