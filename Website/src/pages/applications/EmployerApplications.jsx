import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import StatusBadge from '../../components/applications/StatusBadge.jsx'
import * as applicationService from '../../services/applicationService.js'
import { formatDate } from '../../utils/formatDate.js'

const STATUS_FILTERS = ['', 'pending', 'reviewed', 'accepted', 'rejected']

export default function EmployerApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 15

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await applicationService.getEmployerApplications({
        status: statusFilter || undefined,
        page,
        limit: perPage,
      })
      setApplications(res.data.applications || [])
      setTotal(res.data.total || 0)
      setSelectedIds(new Set())
    } catch (err) {
      setError(err.message || 'Failed to load applications')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(applications.map(a => a.id)))
    }
  }

  async function handleBulkStatus(status) {
    if (selectedIds.size === 0) return
    const label = { accepted: 'accept', rejected: 'reject', reviewed: 'mark as reviewed' }
    if (!window.confirm(`${label[status] || status} ${selectedIds.size} application(s)?`)) return
    try {
      await applicationService.bulkReviewApplications({ applicationIds: [...selectedIds], status })
      fetchApplications()
    } catch (err) {
      setError(err.message || 'Bulk action failed')
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Applications Received</h1>
            <p className="mt-1 text-sm text-slate-500">{total} total applications</p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`rounded-full border-2 px-4 py-1 text-xs font-bold transition-all ${
                statusFilter === s
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs font-bold text-slate-700">{selectedIds.size} selected</span>
            <button
              onClick={() => handleBulkStatus('reviewed')}
              className="rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:border-blue-400"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => handleBulkStatus('accepted')}
              className="rounded-lg border-2 border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:border-emerald-400"
            >
              Accept
            </button>
            <button
              onClick={() => handleBulkStatus('rejected')}
              className="rounded-lg border-2 border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:border-red-400"
            >
              Reject
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
            <button onClick={fetchApplications} className="ml-3 underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border-2 border-slate-200 bg-slate-50" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-12 text-center">
            <div className="mx-auto mb-3 text-3xl">📭</div>
            <p className="text-lg font-bold text-slate-900">No applications yet</p>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter ? `No ${statusFilter} applications.` : 'Applications from talents will appear here.'}
            </p>
            <Link
              to="/dashboard/employer"
              className="mt-4 inline-block rounded-xl border-2 border-slate-900 bg-white px-5 py-2 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* Application List */}
        {!loading && applications.length > 0 && (
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden items-center gap-4 rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-2 text-xs font-bold text-slate-500 md:flex">
              <label className="flex w-8 items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size === applications.length && applications.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-2 border-slate-300"
                />
              </label>
              <span className="flex-1">Applicant</span>
              <span className="w-32">Job</span>
              <span className="w-24">Status</span>
              <span className="w-24">Date</span>
              <span className="w-24">Rate</span>
              <span className="w-20 text-right">Action</span>
            </div>

            {applications.map(app => (
              <div
                key={app.id}
                className={`rounded-2xl border-2 px-5 py-4 transition-colors ${
                  selectedIds.has(app.id) ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex w-8 items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleSelect(app.id)}
                      className="h-4 w-4 rounded border-2 border-slate-300"
                    />
                  </label>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{app.applicantName || 'Anonymous'}</p>
                    <p className="text-xs text-slate-500 truncate">{app.applicantEmail}</p>
                  </div>
                  <span className="w-32 text-sm text-slate-700 truncate">{app.jobTitle}</span>
                  <div className="w-24">
                    <StatusBadge status={app.status} />
                  </div>
                  <span className="w-24 text-xs text-slate-500">{formatDate(app.createdAt)}</span>
                  <span className="w-24 text-xs font-bold text-slate-700">
                    {app.proposedRate > 0 ? `${app.currency} ${app.proposedRate}` : '-'}
                  </span>
                  <div className="w-20 text-right">
                    <Link
                      to={`/employer/applications/${app.id}`}
                      className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-400"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
