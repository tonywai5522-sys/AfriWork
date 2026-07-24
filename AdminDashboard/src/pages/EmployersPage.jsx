import { useState, useEffect, useCallback } from 'react'
import { listEmployers } from '../services/adminService.js'
import DataTable, { Pagination } from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'

export default function EmployersPage() {
  const [employers, setEmployers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await listEmployers({ page: p, limit, query: search })
      setEmployers(res.data?.employers || [])
      setTotal(res.data?.total || 0)
      setPage(p)
    } catch (e) { /* toast handled in service */ }
    setLoading(false)
  }, [search, limit])

  useEffect(() => { load(1) }, [load])

  const verifColors = {
    verified: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    pending: 'border-amber-300 bg-amber-50 text-amber-700',
    rejected: 'border-red-300 bg-red-50 text-red-700',
    unverified: 'border-slate-300 bg-slate-50 text-slate-600',
  }

  const columns = [
    {
      key: 'name', label: 'Employer',
      render: (e) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            {e.name?.charAt(0)}
          </div>
          <div>
            <button onClick={() => setSelected(e)} className="text-sm font-bold text-slate-900 hover:text-purple-700">{e.name}</button>
            <p className="text-[10px] text-slate-400">{e.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'organization', label: 'Company',
      render: (e) => (
        <span className="text-sm">{e.organization?.name || '—'}</span>
      ),
    },
    {
      key: 'verification', label: 'Verification',
      render: (e) => (
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${verifColors[e.organization?.verificationStatus] || verifColors.unverified}`}>
          {e.organization?.verificationStatus || 'unverified'}
        </span>
      ),
    },
    {
      key: 'emailVerified', label: 'Email',
      render: (e) => (
        <span className={`text-[10px] font-bold ${e.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
          {e.emailVerified ? 'Verified' : 'Unverified'}
        </span>
      ),
    },
    {
      key: 'registration', label: 'Registered',
      render: (e) => (
        <span className="text-[11px] text-slate-500">
          {e.registration ? new Date(e.registration).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Employer Management</h1>
        <p className="mt-1 text-sm text-slate-500">{total} employer accounts</p>
      </div>

      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employers..." className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs outline-none focus:border-slate-900 w-48" />
      </div>

      <DataTable columns={columns} data={employers} loading={loading} emptyMessage="No employers found." />
      <Pagination page={page} total={total} limit={limit} onPageChange={load} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Employer Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center text-xl font-bold">E</div>
              <div>
                <h3 className="text-lg font-bold">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
            </div>
            {selected.organization && (
              <div className="rounded-xl border-2 border-slate-200 p-4 space-y-2">
                <p className="text-sm font-bold">{selected.organization.name}</p>
                <p className="text-xs text-slate-500">{selected.organization.industry || ''} {selected.organization.location ? `· ${selected.organization.location}` : ''}</p>
                <p className="text-xs text-slate-500">{selected.organization.description?.slice(0, 200)}</p>
                {selected.organization.website && <a href={selected.organization.website} target="_blank" className="text-xs text-blue-600 underline">Website</a>}
                <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${verifColors[selected.organization.verificationStatus] || verifColors.unverified}`}>
                  {selected.organization.verificationStatus || 'unverified'}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
