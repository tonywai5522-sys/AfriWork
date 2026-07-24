import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import ProjectCard from '../../components/projects/ProjectCard.jsx'
import ProjectForm from '../../components/projects/ProjectForm.jsx'
import * as projectService from '../../services/projectService.js'

export default function WorkspacesList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState([])
  const [publicProjects, setPublicProjects] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('my')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await projectService.getMyProjects()
      setProjects(response?.data?.projects || [])
    } catch (err) {
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPublicProjects = useCallback(async () => {
    try {
      const response = await projectService.listProjects({ status: statusFilter || undefined })
      setPublicProjects(response?.data?.projects || [])
    } catch { /* ignore */ }
  }, [statusFilter])

  useEffect(() => {
    if (activeTab === 'my') loadProjects()
    else loadPublicProjects()
  }, [activeTab, loadProjects, loadPublicProjects])

  async function handleCreate(formData) {
    setCreating(true)
    setError('')
    try {
      const response = await projectService.createProject(formData)
      const project = response?.data?.project
      if (project) {
        navigate(ROUTES.projectDetail.replace(':projectId', project.id))
      } else {
        await loadProjects()
        setShowCreate(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const displayProjects = activeTab === 'my' ? projects : publicProjects
  const filtered = displayProjects.filter(p => {
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && p.status !== statusFilter) return false
    return true
  })

  const tabs = [
    { key: 'my', label: 'My Projects' },
    { key: 'public', label: 'Public Projects' },
  ]

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
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Workspaces</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your projects and collaborate with your team</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            {showCreate ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Create Form */}
        {showCreate && (
          <ProjectForm
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onSubmit={handleCreate}
            loading={creating}
          />
        )}

        {/* Tabs & Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex rounded-xl border-2 border-slate-900 overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border-2 border-slate-300 px-4 py-2 text-xs font-medium focus:border-slate-900 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 text-xs font-medium focus:border-slate-900 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Projects Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-50">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {activeTab === 'my' ? 'No projects yet' : 'No public projects found'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {activeTab === 'my' ? 'Create your first project to get started.' : 'Try adjusting your filters.'}
            </p>
            {activeTab === 'my' && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-4 rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Create Project
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
