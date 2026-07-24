import { useState, useEffect, useCallback } from 'react'
import { listUsers, suspendUser, activateUser, updateUserRole, deleteUser } from '../services/adminService.js'
import DataTable, { Pagination } from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import toast from 'react-hot-toast'

const ROLE_COLORS = {
  talent: 'border-blue-200 bg-blue-50 text-blue-700',
  employer: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  admin: 'border-purple-200 bg-purple-50 text-purple-700',
  moderator: 'border-amber-200 bg-amber-50 text-amber-700',
  partner: 'border-cyan-200 bg-cyan-50 text-cyan-700',
}

const STATUS_COLORS = {
  active: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  suspended: 'border-red-300 bg-red-50 text-red-700',
  inactive: 'border-slate-300 bg-slate-50 text-slate-600',
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [sortKey, setSortKey] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await listUsers({ page: p, limit, query: search, role: roleFilter, status: statusFilter, sortBy: sortKey, sortOrder })
      setUsers(res.data?.users || [])
      setTotal(res.data?.total || 0)
      setPage(p)
    } catch (e) {
      toast.error(e.message)
    }
    setLoading(false)
  }, [search, roleFilter, statusFilter, limit, sortKey, sortOrder])

  useEffect(() => { load(1) }, [load])

  function handleSort(key, order) {
    setSortKey(key)
    setSortOrder(order)
  }

  async function handleSuspend(userId, reason) {
    try {
      await suspendUser(userId, reason)
      toast.success('User suspended')
      load(page)
    } catch (e) { toast.error(e.message) }
  }

  async function handleActivate(userId) {
    try {
      await activateUser(userId)
      toast.success('User activated')
      load(page)
    } catch (e) { toast.error(e.message) }
  }

  async function handleRoleChange(userId, role) {
    if (!role) return
    try {
      await updateUserRole(userId, role)
      toast.success(`Role updated to ${role}`)
      load(page)
    } catch (e) { toast.error(e.message) }
  }

  async function handleDelete(userId) {
    if (!confirm('Delete this user permanently? This cannot be undone.')) return
    try {
      await deleteUser(userId)
      toast.success('User deleted')
      load(page)
    } catch (e) { toast.error(e.message) }
  }

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            {u.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <button
              onClick={() => { setSelectedUser(u); setShowDetail(true) }}
              className="text-sm font-bold text-slate-900 hover:text-purple-700"
            >
              {u.name}
            </button>
            <p className="text-[10px] text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${ROLE_COLORS[u.role] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (u) => (
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${STATUS_COLORS[u.status] || STATUS_COLORS.active}`}>
          {u.status}
        </span>
      ),
    },
    {
      key: 'emailVerified',
      label: 'Email',
      render: (u) => (
        <span className={`text-[10px] font-bold ${u.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
          {u.emailVerified ? 'Verified' : 'Unverified'}
        </span>
      ),
    },
    {
      key: 'registration',
      label: 'Joined',
      sortable: true,
      render: (u) => (
        <span className="text-[11px] text-slate-500">
          {u.registration ? new Date(u.registration).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <div className="flex gap-1">
          {u.status === 'suspended' ? (
            <button onClick={() => handleActivate(u.id)} className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700 hover:bg-emerald-100">Activate</button>
          ) : (
            <button onClick={() => handleSuspend(u.id, prompt('Suspension reason:'))} className="rounded-lg border-2 border-amber-300 bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700 hover:bg-amber-100">Suspend</button>
          )}
          <select onChange={e => handleRoleChange(u.id, e.target.value)} className="rounded-lg border-2 border-slate-200 px-1 py-1 text-[9px] font-bold">
            <option value="">Role</option>
            <option value="talent">Talent</option>
            <option value="employer">Employer</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={() => handleDelete(u.id)} className="rounded-lg border-2 border-red-200 px-2 py-1 text-[9px] font-bold text-red-600 hover:bg-red-50">Del</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">{total} users on the platform</p>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs outline-none focus:border-slate-900 w-48 transition-colors"
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Roles</option>
          <option value="talent">Talent</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="partner">Partner</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-900">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found matching your filters."
        onSort={handleSort}
        sortKey={sortKey}
        sortOrder={sortOrder}
      />

      <Pagination page={page} total={total} limit={limit} onPageChange={load} />

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="User Details" size="lg">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600">
                {selectedUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Role</p>
                <p className="font-bold capitalize">{selectedUser.role}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                <p className="font-bold capitalize">{selectedUser.status}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Email Verified</p>
                <p className="font-bold">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Joined</p>
                <p className="font-bold">{selectedUser.registration ? new Date(selectedUser.registration).toLocaleDateString() : '—'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
