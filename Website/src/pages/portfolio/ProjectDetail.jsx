import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/dashboard/DashboardLayout.jsx'
import * as portfolioService from '../../services/portfolioService.js'
import { formatDate } from '../../utils/formatDate.js'

const CATEGORY_LABELS = {
  web_app: 'Web Application', mobile_app: 'Mobile App', api: 'API / Backend',
  design: 'UI/UX Design', data: 'Data / Analytics', ai: 'AI / Machine Learning',
  blockchain: 'Blockchain', devops: 'DevOps / Infrastructure',
  open_source: 'Open Source', freelance: 'Freelance Project', other: 'Other',
}

export default function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await portfolioService.getProjectById(projectId)
        setProject(res.data.project)
      } catch (err) {
        setError(err.message || 'Project not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-96 animate-pulse rounded-2xl border-2 border-slate-200 bg-slate-50" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8 text-center">
            <p className="text-lg font-bold text-red-700">{error || 'Project not found'}</p>
            <button onClick={() => navigate(-1)} className="mt-4 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700">
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <button onClick={() => navigate('/portfolio')} className="mb-6 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900">
          ← Back to Portfolio
        </button>

        {/* Hero Image */}
        {project.thumbnailUrl && (
          <div className="mb-8 overflow-hidden rounded-2xl border-2 border-slate-200">
            <img src={project.thumbnailUrl} alt={project.title} className="w-full object-cover" style={{ maxHeight: '400px' }} />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900">{project.title}</h1>
            <span className="rounded-full border-2 border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-bold text-blue-700">
              {CATEGORY_LABELS[project.category] || project.category}
            </span>
            {project.featured && (
              <span className="rounded-full border-2 border-amber-200 bg-amber-50 px-3 py-0.5 text-[11px] font-bold text-amber-700">
                Featured
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            {project.role && <span>Role: <strong>{project.role}</strong></span>}
            {project.teamSize > 1 && <span>Team: <strong>{project.teamSize} people</strong></span>}
            <span>{project.viewCount || 0} views</span>
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
        </div>

        {/* Action Links */}
        <div className="mb-8 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-5 py-2.5 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100 active:translate-x-[1px] active:translate-y-[1px]">
              🌐 Visit Live Site
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100">
              📂 View on GitHub
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-xl border-2 border-blue-300 bg-blue-50 px-5 py-2.5 text-xs font-bold text-blue-700 transition-all hover:bg-blue-100">
              ▶️ Watch Demo
            </a>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-sm font-black text-slate-900">Description</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {project.description || 'No description provided.'}
              </div>
            </div>

            {/* Highlights */}
            {project.highlights?.length > 0 && (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
                <h2 className="mb-3 text-sm font-black text-slate-900">Key Highlights</h2>
                <ul className="space-y-2">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Outcome */}
            {project.outcome && (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
                <h2 className="mb-3 text-sm font-black text-slate-900">Outcome & Impact</h2>
                <p className="whitespace-pre-wrap text-sm text-slate-700">{project.outcome}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Technologies */}
            {project.technologies?.length > 0 && (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-xs font-black text-slate-900 uppercase tracking-wider">Technologies</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((t, i) => (
                    <span key={i} className="rounded-full border-2 border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-xs font-black text-slate-900 uppercase tracking-wider">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((t, i) => (
                    <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-black text-slate-900 uppercase tracking-wider">Timeline</h3>
              <div className="space-y-2 text-xs">
                {project.startDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Started</span>
                    <span className="font-bold text-slate-700">{formatDate(project.startDate)}</span>
                  </div>
                )}
                {project.endDate && !project.isOngoing && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ended</span>
                    <span className="font-bold text-slate-700">{formatDate(project.endDate)}</span>
                  </div>
                )}
                {project.isOngoing && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold text-emerald-600">Ongoing</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span className="text-slate-500">Published</span>
                  <span className="font-bold text-slate-700">{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-xs font-black text-slate-900 uppercase tracking-wider">Visibility</h3>
              <span className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold ${
                project.visibility === 'public' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                project.visibility === 'private' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                {project.visibility}
              </span>
              <span className={`ml-2 inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold ${
                project.status === 'published' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                project.status === 'draft' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
