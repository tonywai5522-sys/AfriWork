import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import StatusBadge from '../../components/applications/StatusBadge.jsx'
import * as applicationService from '../../services/applicationService.js'
import { formatDate } from '../../utils/formatDate.js'

const STATUS_FILTERS = ['', 'pending', 'reviewed', 'accepted', 'rejected', 'withdrawn']

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 10

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await applicationService.getMyApplications({
        status: statusFilter || undefined,
        page,
        limit: perPage,
      })
      setApplications(res.data.applications || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      setError(err.message || 'Failed to load applications')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  async function handleWithdraw(id) {
    if (!window.confirm('Withdraw this application?')) return
    try {
      await applicationService.withdrawApplication(id)
      fetchApplications()
    } catch (err) {
      setError(err.message || 'Failed to withdraw')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this application permanently?')) return
    try {
      await applicationService.deleteApplication(id)
      fetchApplications()
    } catch (err) {
      setError(err.message || 'Failed to delete')
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">My Applications</h1>
            <p className="mt-1 text-sm text-slate-500">{total} applications total</p>
          </div>
          <Link
            to="/jobs"
            className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Browse Jobs
          </Link>
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
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border-2 border-slate-200 bg-slate-50" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-12 text-center">
            <div className="mx-auto mb-3 text-3xl">📋</div>
            <p className="text-lg font-bold text-slate-900">No applications yet</p>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter ? `No ${statusFilter} applications found.` : 'Start applying to jobs that match your skills.'}
            </p>
            <Link
              to="/jobs"
              className="mt-4 inline-block rounded-xl border-2 border-slate-900 bg-white px-5 py-2 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        {/* Application List */}
        {!loading && applications.length > 0 && (
          <div className="space-y-4">
            {applications.map(app => (
              <div
                key={app.id}
                className="rounded-2xl border-2 border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-black text-slate-900">{app.jobTitle}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Applied {formatDate(app.createdAt)}
                      {app.proposedRate > 0 && ` · ${app.currency} ${app.proposedRate}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      to={`/applications/${app.id}`}
                      className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-400"
                    >
                      View
                    </Link>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="rounded-lg border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition-colors hover:border-amber-400"
                        >
                          Withdraw
                        </button>
                        <Link
                          to={`/applications/${app.id}/edit`}
                          className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-400"
                        >
                          Edit
                        </Link>
                      </>
                    )}
                    {(app.status === 'withdrawn' || app.status === 'rejected') && (
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="rounded-lg border-2 border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:border-red-400"
                      >
                        Delete
                      </button>
                    )}
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
