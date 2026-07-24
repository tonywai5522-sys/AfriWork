import { useState, useEffect, useCallback } from 'react'
import { getActivityLogs } from '../services/adminService.js'
import { Pagination } from '../components/DataTable.jsx'
import StatCard from '../components/StatCard.jsx'

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await getActivityLogs({ page: p, limit, action: actionFilter || undefined, entityType: entityFilter || undefined })
      setLogs(res.data?.logs || [])
      setTotal(res.data?.total || 0)
      setPage(p)
    } catch (e) { /* */ }
    setLoading(false)
  }, [actionFilter, entityFilter, limit])

  useEffect(() => { load(1) }, [load])

  const actionColors = {
    create: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    update: 'border-blue-300 bg-blue-50 text-blue-700',
    delete: 'border-red-300 bg-red-50 text-red-700',
    suspend: 'border-amber-300 bg-amber-50 text-amber-700',
    activate: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    login: 'border-purple-300 bg-purple-50 text-purple-700',
    flag: 'border-red-300 bg-red-50 text-red-700',
    moderate: 'border-amber-300 bg-amber-50 text-amber-700',
  }

  const summary = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Activity Log</h1>
        <p className="mt-1 text-sm text-slate-500">{total} recorded events</p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-5 mb-6">
        {Object.entries(summary).slice(0, 5).map(([action, count]) => (
          <div key={action} className="rounded-xl border-2 border-slate-200 bg-white p-3 text-center">
            <p className="text-lg font-black capitalize">{count}</p>
            <p className="text-[10px] font-medium text-slate-500 capitalize">{action}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="suspend">Suspend</option>
          <option value="activate">Activate</option>
          <option value="login">Login</option>
          <option value="flag">Flag</option>
        </select>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Types</option>
          <option value="user">User</option>
          <option value="job">Job</option>
          <option value="project">Project</option>
          <option value="organization">Organization</option>
          <option value="review">Review</option>
          <option value="comment">Comment</option>
          <option value="application">Application</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 rounded-xl border-2 border-slate-200 bg-white animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-sm font-bold text-slate-500">No activity logs</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map(log => (
            <div key={log.id} className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5">
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold capitalize ${actionColors[log.action] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  {log.action}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{log.action}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {log.entityType && `${log.entityType} #${log.entityId?.slice(0, 12)}`}
                    {log.userId && ` by ${log.userId.slice(0, 12)}`}
                    {log.ipAddress && ` [${log.ipAddress}]`}
                  </p>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 ml-3 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} total={total} limit={limit} onPageChange={load} />
    </div>
  )
}
