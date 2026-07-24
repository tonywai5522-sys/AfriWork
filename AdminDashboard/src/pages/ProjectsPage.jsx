import { useState, useEffect, useCallback } from 'react'
import { listAllProjects, moderateProject } from '../services/adminService.js'
import DataTable, { Pagination } from '../components/DataTable.jsx'
import StatCard from '../components/StatCard.jsx'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  draft: 'border-slate-300 bg-slate-50 text-slate-600',
  active: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  paused: 'border-amber-300 bg-amber-50 text-amber-700',
  completed: 'border-blue-300 bg-blue-50 text-blue-700',
  cancelled: 'border-red-300 bg-red-50 text-red-700',
  flagged: 'border-red-300 bg-red-50 text-red-700',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await listAllProjects({ page: p, limit, query: search, status: statusFilter })
      setProjects(res.data?.projects || [])
      setTotal(res.data?.total || 0)
      setPage(p)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }, [search, statusFilter, limit])

  useEffect(() => { load(1) }, [load])

  async function handleModerate(id, action) {
    try {
      await moderateProject(id, action)
      toast.success(`Project ${action}`)
      load(page)
    } catch (e) { toast.error(e.message) }
  }

  const statSummary = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const columns = [
    {
      key: 'title', label: 'Project',
      render: (p) => (
        <div>
          <p className="text-sm font-bold">{p.title}</p>
          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{p.description?.slice(0, 80)}</p>
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (p) => (
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_COLORS[p.status] || ''}`}>
          {p.status}
        </span>
      ),
    },
    {
      key: 'progress', label: 'Progress',
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 rounded-full bg-slate-200 overflow-hidden">
            <div className={`h-full rounded-full ${p.progress >= 80 ? 'bg-emerald-500' : p.progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${p.progress || 0}%` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{p.progress || 0}%</span>
        </div>
      ),
    },
    {
      key: 'visibility', label: 'Visibility',
      render: (p) => (
        <span className="text-[11px] capitalize text-slate-500">{p.visibility || 'public'}</span>
      ),
    },
    {
      key: 'createdAt', label: 'Created',
      render: (p) => (
        <span className="text-[11px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions', label: 'Moderate',
      render: (p) => (
        <div className="flex gap-1">
          {p.status !== 'active' && <button onClick={() => handleModerate(p.id, 'active')} className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">Active</button>}
          {p.status !== 'paused' && <button onClick={() => handleModerate(p.id, 'paused')} className="rounded-lg border-2 border-amber-300 bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">Pause</button>}
          {p.status !== 'flagged' && <button onClick={() => handleModerate(p.id, 'flagged')} className="rounded-lg border-2 border-red-300 bg-red-50 px-2 py-1 text-[9px] font-bold text-red-700">Flag</button>}
          {p.status !== 'completed' && <button onClick={() => handleModerate(p.id, 'completed')} className="rounded-lg border-2 border-blue-300 bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">Done</button>}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Project Moderation</h1>
        <p className="mt-1 text-sm text-slate-500">{total} projects on the platform</p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Total" value={total} color="purple" />
        <StatCard label="Active" value={statSummary.active || 0} color="emerald" />
        <StatCard label="Flagged" value={statSummary.flagged || 0} color="red" />
        <StatCard label="Completed" value={statSummary.completed || 0} color="blue" />
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs outline-none focus:border-slate-900 w-48" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <DataTable columns={columns} data={projects} loading={loading} emptyMessage="No projects found." />
      <Pagination page={page} total={total} limit={limit} onPageChange={load} />
    </div>
  )
}
