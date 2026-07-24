import { useState, useEffect, useCallback } from 'react'
import { getPendingVerifications, approveVerification, rejectVerification } from '../services/adminService.js'
import Modal from '../components/Modal.jsx'
import toast from 'react-hot-toast'

export default function VerificationsPage() {
  const [verifs, setVerifs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await getPendingVerifications(p, 10)
      setVerifs(res.data?.verifications || [])
      setTotal(res.data?.total || 0)
      setPage(p)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }, [])

  useEffect(() => { load(1) }, [load])

  async function handleApprove(orgId) {
    try {
      await approveVerification(orgId)
      toast.success('Organization verified')
      load(page)
    } catch (e) { toast.error(e.message) }
  }

  async function handleReject(orgId) {
    const reason = prompt('Rejection reason:')
    if (!reason) return
    try {
      await rejectVerification(orgId, reason)
      toast.success('Verification rejected')
      load(page)
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Verification Management</h1>
        <p className="mt-1 text-sm text-slate-500">{total} pending organization verifications</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl border-2 border-slate-200 bg-white animate-pulse" />)}
        </div>
      ) : verifs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
          <span className="text-4xl">✅</span>
          <p className="mt-3 text-sm font-bold text-slate-500">No pending verifications</p>
          <p className="mt-1 text-xs text-slate-400">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifs.map(v => (
            <div key={v.id} className="rounded-xl border-2 border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(v)} className="text-base font-bold text-slate-900 hover:text-purple-700">{v.name}</button>
                    <span className="rounded-full border-2 border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">Pending</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {[v.industry, v.location].filter(Boolean).join(' · ')}
                  </p>
                  {v.description && (
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{v.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {v.website && (
                      <a href={v.website} target="_blank" className="text-[10px] text-blue-600 underline font-medium">Website</a>
                    )}
                    <span className="text-[10px] text-slate-400">
                      Requested {new Date(v.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleApprove(v.id)} className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-5 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                    ✓ Approve
                  </button>
                  <button onClick={() => handleReject(v.id)} className="rounded-xl border-2 border-red-400 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors">
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 10 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button onClick={() => load(Math.max(1, page - 1))} disabled={page === 1} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold disabled:opacity-40">← Prev</button>
          <span className="text-xs text-slate-500">Page {page} of {Math.ceil(total / 10)}</span>
          <button onClick={() => load(page + 1)} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold">Next →</button>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Verification Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">{selected.name}</h3>
              <p className="text-sm text-slate-500">{selected.industry || selected.location ? `${selected.industry || ''} · ${selected.location || ''}` : selected.slug}</p>
            </div>
            {selected.description && (
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Description</p>
                <p className="text-sm text-slate-700">{selected.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Industry</p>
                <p className="text-sm font-bold">{selected.industry || '—'}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                <p className="text-sm font-bold">{selected.location || '—'}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Company Size</p>
                <p className="text-sm font-bold">{selected.companySize || '—'}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Website</p>
                {selected.website ? (
                  <a href={selected.website} target="_blank" className="text-sm font-bold text-blue-600 underline">{selected.website}</a>
                ) : <p className="text-sm font-bold">—</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
