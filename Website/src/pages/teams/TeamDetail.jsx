import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import DashboardCard from '../../components/dashboard/DashboardCard.jsx'
import TeamMembers from '../../components/teams/TeamMembers.jsx'
import * as teamService from '../../services/teamService.js'

export default function TeamDetail() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [team, setTeam] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [showEdit, setShowEdit] = useState(false)

  const loadTeam = useCallback(async () => {
    setLoading(true)
    try {
      const response = await teamService.getTeamById(teamId)
      const t = response?.data?.team
      if (!t) { navigate(ROUTES.teams); return }
      setTeam(t)
      setEditForm({ name: t.name, description: t.description || '' })
    } catch {
      navigate(ROUTES.teams)
    } finally {
      setLoading(false)
    }
  }, [teamId, navigate])

  useEffect(() => { loadTeam() }, [loadTeam])

  const isOwner = team?.ownerId && true // All authenticated users can view

  async function handleUpdate(e) {
    e.preventDefault()
    if (!editForm.name.trim()) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await teamService.updateTeam(teamId, editForm)
      setTeam(response?.data?.team)
      setShowEdit(false)
      setSuccess('Team updated!')
    } catch (err) {
      setError(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this team? This cannot be undone.')) return
    try {
      await teamService.deleteTeam(teamId)
      navigate(ROUTES.teams)
    } catch (err) {
      setError(err.message || 'Failed to delete')
    }
  }

  async function handleInvite(data) {
    await teamService.addTeamMember(teamId, data)
    await loadTeam()
    setSuccess('Invitation sent!')
  }

  async function handleUpdateMember(memberId, data) {
    await teamService.updateTeamMember(teamId, memberId, data)
    await loadTeam()
  }

  async function handleRemoveMember(memberId) {
    await teamService.removeTeamMember(teamId, memberId)
    await loadTeam()
    setSuccess('Member removed')
  }

  async function handleAcceptInvite() {
    try {
      await teamService.acceptInvitation(teamId)
      setSuccess('Invitation accepted!')
      await loadTeam()
    } catch (err) {
      setError(err.message || 'Failed to accept')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      </DashboardLayout>
    )
  }

  if (!team) return null

  const isTeamOwner = team.ownerId
  const hasPending = team.members?.some(m => m.status === 'pending')
  const canEdit = isTeamOwner // Simplified: owner only

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: `Members (${team.members?.length || 0})` },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(ROUTES.teams)} className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900">&larr; Teams</button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">{team.name}</h1>
              <p className="text-sm text-slate-600">{team.description || 'No description'}</p>
            </div>
          </div>
          {canEdit && (
            <button type="button" onClick={handleDelete} className="rounded-xl border-2 border-red-400 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Delete Team</button>
          )}
        </div>

        {error && <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3"><p className="text-sm font-medium text-red-700">{error}</p></div>}
        {success && <div className="mb-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3"><p className="text-sm font-medium text-emerald-700">{success}</p></div>}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 text-center shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-100 text-3xl font-black text-slate-400">
                {team.name?.[0]?.toUpperCase() || '?'}
              </div>
              <p className="text-sm font-bold text-slate-900">{team.name}</p>
              <span className={`mt-1 inline-block rounded-full border px-3 py-0.5 text-[10px] font-bold capitalize ${
                team.status === 'active' ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-slate-300 bg-slate-100 text-slate-600'
              }`}>{team.status}</span>
            </div>

            <DashboardCard title="Team Info">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Members</span><span className="font-bold text-slate-900">{team.members?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Active</span><span className="font-bold text-slate-900">{team.members?.filter(m => m.status === 'active').length || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Pending</span><span className="font-bold text-amber-600">{team.members?.filter(m => m.status === 'pending').length || 0}</span></div>
              </div>
            </DashboardCard>

            {hasPending && (
              <DashboardCard title="Invitations">
                <div className="space-y-2">
                  {team.members?.filter(m => m.status === 'pending').map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate">{m.email}</span>
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pending</span>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-slate-200 pb-4">
              {tabs.map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
                    <p className="text-sm text-slate-600">{team.description || 'No description provided.'}</p>
                  </div>
                  {team.projectId && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2">Linked Project</h3>
                      <p className="text-sm text-slate-600">Project ID: {team.projectId}</p>
                    </div>
                  )}
                  {team.organizationId && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2">Organization</h3>
                      <p className="text-sm text-slate-600">Org ID: {team.organizationId}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Members</h3>
                    <div className="flex flex-wrap gap-2">
                      {team.members?.filter(m => m.status === 'active').map(m => (
                        <div key={m.id} className="flex items-center gap-2 rounded-full border-2 border-slate-200 bg-slate-50 px-3 py-1.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-bold text-slate-600">
                            {(m.name?.[0] || m.email?.[0] || '?').toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-slate-700">{m.name || m.email}</span>
                          <span className="text-[10px] text-slate-400">({m.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {showEdit ? (
                    <form onSubmit={handleUpdate} className="rounded-xl border-2 border-slate-200 p-4">
                      <h4 className="text-sm font-bold text-slate-900 mb-3">Edit Team</h4>
                      <div className="space-y-3">
                        <input className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Team name" />
                        <textarea className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                        <div className="flex gap-2">
                          <button type="submit" disabled={saving} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                          <button type="button" onClick={() => setShowEdit(false)} className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    canEdit && (
                      <button type="button" onClick={() => setShowEdit(true)} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                        Edit Team
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Members Tab */}
              {activeTab === 'members' && (
                <TeamMembers
                  members={team.members || []}
                  teamId={teamId}
                  isOwner={isTeamOwner}
                  onInvite={handleInvite}
                  onUpdate={handleUpdateMember}
                  onRemove={handleRemoveMember}
                />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Team Permissions</h3>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p><span className="font-bold text-slate-900">Owner:</span> Full control — invite, remove, edit, delete</p>
                      <p><span className="font-bold text-slate-900">Admin:</span> Can invite, remove, edit team details</p>
                      <p><span className="font-bold text-slate-900">Manager:</span> Can edit team details</p>
                      <p><span className="font-bold text-slate-900">Member:</span> Can view team content</p>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
                    <h4 className="text-sm font-bold text-red-700">Danger Zone</h4>
                    <p className="mb-3 text-xs text-red-600">Deleting this team will remove all member associations and data.</p>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="rounded-xl border-2 border-red-500 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] hover:bg-red-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      Delete Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
