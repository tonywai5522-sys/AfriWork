import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import TeamCard from '../../components/teams/TeamCard.jsx'
import * as teamService from '../../services/teamService.js'

export default function MyTeams() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teams, setTeams] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const loadTeams = useCallback(async () => {
    setLoading(true)
    try {
      const response = await teamService.getMyTeams()
      setTeams(response?.data?.teams || [])
    } catch (err) {
      setError(err.message || 'Failed to load teams')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTeams() }, [loadTeams])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    setError('')
    try {
      const response = await teamService.createTeam(form)
      const team = response?.data?.team
      if (team) {
        navigate(`${ROUTES.teams}/${team.id}`)
      } else {
        await loadTeams()
        setShowCreate(false)
        setForm({ name: '', description: '' })
      }
    } catch (err) {
      setError(err.message || 'Failed to create team')
    } finally {
      setCreating(false)
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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Teams</h1>
            <p className="text-sm text-slate-600">Create and manage collaborative teams</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            {showCreate ? 'Cancel' : '+ New Team'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Create Team Form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="mb-8 rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Create New Team</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-900">Team Name *</label>
                <input
                  className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                  placeholder="e.g. Design Team, Backend Squad"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-900">Description</label>
                <textarea
                  className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none"
                  rows={3}
                  placeholder="What will this team work on?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={creating || !form.name.trim()}
                className="rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        )}

        {/* Teams Grid */}
        {teams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-50">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-900">No teams yet</h3>
            <p className="mt-1 text-xs text-slate-500">Create your first team to start collaborating.</p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-4 rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Create Team
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
