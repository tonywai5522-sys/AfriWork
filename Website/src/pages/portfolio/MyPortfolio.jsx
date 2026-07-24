import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import ProjectCard from '../../components/portfolio/ProjectCard.jsx'
import ProjectForm from '../../components/portfolio/ProjectForm.jsx'
import * as portfolioService from '../../services/portfolioService.js'

export default function MyPortfolio() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 12

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await portfolioService.getMyProjects({ page, limit: perPage })
      setProjects(res.data.projects || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  function handleNewProject() {
    setEditingProject(null)
    setShowForm(true)
  }

  function handleEdit(project, e) {
    e.preventDefault()
    e.stopPropagation()
    setEditingProject(project)
    setShowForm(true)
  }

  async function handleSave(result) {
    setShowForm(false)
    setEditingProject(null)
    fetchProjects()
  }

  async function handleDelete(projectId, e) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this project permanently?')) return
    try {
      await portfolioService.deleteProject(projectId)
      fetchProjects()
    } catch (err) {
      setError(err.message || 'Failed to delete')
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">My Portfolio</h1>
            <p className="mt-1 text-sm text-slate-500">{total} projects</p>
          </div>
          {!showForm && (
            <button
              onClick={handleNewProject}
              className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              + New Project
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
            <button onClick={fetchProjects} className="ml-3 underline">Retry</button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="mb-6 text-lg font-black text-slate-900">
              {editingProject ? 'Edit Project' : 'New Project'}
            </h2>
            <ProjectForm
              project={editingProject}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingProject(null) }}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border-2 border-slate-200 bg-slate-50" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && projects.length === 0 && !showForm && (
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-12 text-center">
            <div className="mx-auto mb-3 text-3xl">🎨</div>
            <p className="text-lg font-bold text-slate-900">No projects yet</p>
            <p className="mt-1 text-sm text-slate-500">Showcase your work to potential employers.</p>
            <button onClick={handleNewProject}
              className="mt-4 rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              Create Your First Project
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && projects.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => (
                <div key={project.id} className="relative group">
                  <ProjectCard project={project} />
                  <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => handleEdit(project, e)}
                      className="rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm hover:border-slate-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="rounded-lg border-2 border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 shadow-sm hover:border-red-400"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40">← Prev</button>
                <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
