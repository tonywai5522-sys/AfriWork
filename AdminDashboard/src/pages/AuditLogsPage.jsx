import { useState, useEffect, useCallback } from 'react'
import { queryAuditLogs, getAuditStats, getAdminAuditLogs } from '../services/adminService.js'
import DataTable, { Pagination } from '../components/DataTable.jsx'
import StatCard from '../components/StatCard.jsx'
import Modal from '../components/Modal.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SEVERITY_COLORS = {
  low: 'border-slate-300 bg-slate-50 text-slate-600',
  medium: 'border-amber-300 bg-amber-50 text-amber-700',
  high: 'border-red-300 bg-red-50 text-red-700',
  critical: 'border-purple-300 bg-purple-50 text-purple-700',
}

const SENSITIVE_BADGE = 'border-rose-300 bg-rose-50 text-rose-700'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [showSensitiveOnly, setShowSensitiveOnly] = useState(false)
  const [tab, setTab] = useState('all') // 'all' | 'admin' | 'user'

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      let res
      if (tab === 'admin') {
        res = await getAdminAuditLogs({ page: p, limit })
      } else if (tab === 'user' && userIdFilter) {
        res = await queryAuditLogs({ page: p, limit, userId: userIdFilter })
      } else {
        res = await queryAuditLogs({
          page: p, limit, action: actionFilter || undefined,
          entityType: entityFilter || undefined, severity: severityFilter || undefined,
          search: search || undefined, isSensitive: showSensitiveOnly || undefined,
        })
      }
      setLogs(res.data?.logs || [])
      setTotal(res.data?.total || 0)
      setPage(p)
    } catch (e) { /* */ }
    setLoading(false)
  }, [search, actionFilter, entityFilter, severityFilter, userIdFilter, showSensitiveOnly, tab, limit])

  useEffect(() => { load(1) }, [load])

  useEffect(() => {
    getAuditStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const statData = stats ? [
    { name: 'Total', value: stats.total || 0 },
    { name: 'Sensitive', value: stats.sensitiveCount || 0 },
    { name: 'Low', value: stats.bySeverity?.low || 0 },
    { name: 'Medium', value: stats.bySeverity?.medium || 0 },
    { name: 'High', value: stats.bySeverity?.high || 0 },
    { name: 'Critical', value: stats.bySeverity?.critical || 0 },
  ] : []

  const columns = [
    {
      key: 'timestamp', label: 'Time',
      render: (l) => (
        <span className="text-[10px] text-slate-500 whitespace-nowrap">
          {new Date(l.timestamp || l.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'action', label: 'Action',
      render: (l) => (
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border-2 border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold">{l.action}</span>
          {l.isSensitive && <span className="text-[9px] font-bold text-rose-600">🔒</span>}
        </div>
      ),
    },
    {
      key: 'description', label: 'Description',
      render: (l) => (
        <div className="min-w-0 max-w-[250px]">
          <p className="text-xs font-medium truncate">{l.description}</p>
          {l.entityType && <p className="text-[9px] text-slate-400">{l.entityType}/{l.entityId?.slice(0, 12)}</p>}
        </div>
      ),
    },
    {
      key: 'user', label: 'User',
      render: (l) => (
        <div className="text-[11px]">
          <p className="font-bold">{l.userName || l.userEmail?.split('@')[0] || '—'}</p>
          <p className="text-[9px] text-slate-400 capitalize">{l.userRole}</p>
        </div>
      ),
    },
    {
      key: 'severity', label: 'Severity',
      render: (l) => (
        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold capitalize ${SEVERITY_COLORS[l.severity] || SEVERITY_COLORS.low}`}>
          {l.severity}
        </span>
      ),
    },
    {
      key: 'ip', label: 'IP',
      render: (l) => (
        <span className="text-[9px] text-slate-400 font-mono">{l.ipAddress || '—'}</span>
      ),
    },
    {
      key: 'actions', label: '',
      render: (l) => (
        <button onClick={() => setSelectedLog(l)} className="rounded-lg border-2 border-slate-200 px-2 py-1 text-[9px] font-bold hover:bg-slate-50">View</button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">{total} total audit events · Security monitoring</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-6 mb-6">
          {statData.map(s => (
            <div key={s.name} className="rounded-xl border-2 border-slate-200 bg-white p-3 text-center">
              <p className="text-lg font-black">{s.value}</p>
              <p className="text-[9px] font-medium text-slate-500">{s.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'admin', label: 'Admin Actions' },
          { id: 'user', label: 'User History' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-colors ${tab === t.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search descriptions..."
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs outline-none focus:border-slate-900 w-44"
        />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Actions</option>
          <option value="user.create">User Create</option>
          <option value="user.login">User Login</option>
          <option value="user.delete">User Delete</option>
          <option value="user.suspend">User Suspend</option>
          <option value="user.activate">User Activate</option>
          <option value="user.role_change">Role Change</option>
          <option value="admin.login">Admin Login</option>
          <option value="content.flag">Content Flag</option>
          <option value="content.approve">Content Approve</option>
          <option value="content.remove">Content Remove</option>
          <option value="verification.approve">Verif Approve</option>
          <option value="verification.reject">Verif Reject</option>
        </select>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Entities</option>
          <option value="user">User</option>
          <option value="job">Job</option>
          <option value="project">Project</option>
          <option value="organization">Organization</option>
          <option value="review">Review</option>
          <option value="comment">Comment</option>
          <option value="application">Application</option>
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        {tab === 'user' && (
          <input
            value={userIdFilter}
            onChange={e => setUserIdFilter(e.target.value)}
            placeholder="User ID..."
            className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs outline-none focus:border-slate-900 w-36"
          />
        )}
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input type="checkbox" checked={showSensitiveOnly} onChange={e => setShowSensitiveOnly(e.target.checked)} className="rounded border-slate-300" />
          Sensitive only
        </label>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="No audit logs found matching filters."
        sortKey="timestamp"
        sortOrder="desc"
      />
      <Pagination page={page} total={total} limit={limit} onPageChange={load} />

      {/* Detail Modal */}
      <Modal open={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Log Detail" size="lg">
        {selectedLog && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${SEVERITY_COLORS[selectedLog.severity]}`}>
                {selectedLog.severity}
              </span>
              <span className="rounded-full border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold">{selectedLog.action}</span>
              {selectedLog.isSensitive && <span className="text-xs font-bold text-rose-600">🔒 Sensitive Action</span>}
            </div>
            <div className="rounded-xl border-2 border-slate-200 p-4">
              <p className="text-sm">{selectedLog.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase">User</p>
                <p className="font-bold">{selectedLog.userName || '—'}</p>
                <p className="text-xs text-slate-500">{selectedLog.userEmail}</p>
                <p className="text-[10px] text-slate-400 capitalize">Role: {selectedLog.userRole}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Timestamp</p>
                <p className="font-bold">{new Date(selectedLog.timestamp || selectedLog.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Entity</p>
                <p className="font-bold">{selectedLog.entityType || '—'} / {selectedLog.entityId?.slice(0, 16) || '—'}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Network</p>
                <p className="font-mono text-xs">{selectedLog.ipAddress || '—'}</p>
                <p className="text-[9px] text-slate-400 truncate">{selectedLog.userAgent?.slice(0, 60)}</p>
              </div>
            </div>
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Metadata</p>
                <pre className="text-[10px] text-slate-600 overflow-x-auto">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
