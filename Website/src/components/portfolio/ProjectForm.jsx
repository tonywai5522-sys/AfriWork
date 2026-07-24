import { useState } from 'react'
import * as portfolioService from '../../services/portfolioService.js'

const CATEGORIES = [
  { value: 'web_app', label: 'Web Application' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'api', label: 'API / Backend' },
  { value: 'design', label: 'UI/UX Design' },
  { value: 'data', label: 'Data / Analytics' },
  { value: 'ai', label: 'AI / Machine Learning' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'devops', label: 'DevOps / Infrastructure' },
  { value: 'open_source', label: 'Open Source' },
  { value: 'freelance', label: 'Freelance Project' },
  { value: 'other', label: 'Other' },
]

const emptyProject = {
  title: '',
  description: '',
  category: 'web_app',
  tags: [],
  technologies: [],
  liveUrl: '',
  githubUrl: '',
  demoUrl: '',
  startDate: '',
  endDate: '',
  isOngoing: false,
  highlights: [],
  role: '',
  teamSize: 1,
  outcome: '',
  visibility: 'public',
  status: 'published',
}

export default function ProjectForm({ project, onSave, onCancel }) {
  const isEditing = !!project?.id
  const [form, setForm] = useState(project ? { ...emptyProject, ...project } : { ...emptyProject })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [highlightInput, setHighlightInput] = useState('')

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    else if (form.title.length > 200) e.title = 'Title must be 200 characters or less'
    if (form.description && form.description.length > 8000) e.description = 'Description must be 8000 characters or less'
    if (form.liveUrl && !/^https?:\/\/.+/.test(form.liveUrl)) e.liveUrl = 'Must be a valid URL'
    if (form.githubUrl && !/^https?:\/\/.+/.test(form.githubUrl)) e.githubUrl = 'Must be a valid URL'
    if (form.demoUrl && !/^https?:\/\/.+/.test(form.demoUrl)) e.demoUrl = 'Must be a valid URL'
    if (form.teamSize < 1) e.teamSize = 'Team size must be at least 1'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSaving(true)
    try {
      const result = isEditing
        ? await portfolioService.updateProject(project.id, form)
        : await portfolioService.createProject(form)
      onSave?.(result)
    } catch (err) {
      setServerError(err.message || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  function addListItem(field, value) {
    if (!value.trim()) return
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), value.trim()] }))
  }

  function removeListItem(field, index) {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  function handleAddTag() {
    addListItem('tags', tagInput)
    setTagInput('')
  }

  function handleAddTech() {
    addListItem('technologies', techInput)
    setTechInput('')
  }

  function handleAddHighlight() {
    addListItem('highlights', highlightInput)
    setHighlightInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{serverError}</div>
      )}

      {/* Title */}
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">Project Title *</label>
        <input
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
          placeholder="My Awesome Project"
        />
        {errors.title && <p className="mt-1 text-xs font-bold text-red-600">{errors.title}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">Category</label>
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">Description</label>
        <textarea
          rows={5}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.description ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
          placeholder="Describe your project, what problem it solves, and your contribution..."
        />
        <p className="mt-1 text-right text-[10px] text-slate-400">{form.description.length}/8000</p>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">Tags</label>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
            className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Type and press Enter"
          />
          <button type="button" onClick={handleAddTag} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white">Add</button>
        </div>
        {form.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.tags.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700">
                {t}
                <button type="button" onClick={() => removeListItem('tags', i)} className="text-slate-400 hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Technologies */}
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">Technologies Used</label>
        <div className="flex gap-2">
          <input
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech() } }}
            className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="React, Node.js, Python..."
          />
          <button type="button" onClick={handleAddTech} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white">Add</button>
        </div>
        {form.technologies?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.technologies.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full border-2 border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                {t}
                <button type="button" onClick={() => removeListItem('technologies', i)} className="text-blue-400 hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* URLs */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Live URL</label>
          <input
            value={form.liveUrl}
            onChange={e => setForm({ ...form, liveUrl: e.target.value })}
            className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.liveUrl ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
            placeholder="https://myapp.com"
          />
          {errors.liveUrl && <p className="mt-1 text-xs font-bold text-red-600">{errors.liveUrl}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">GitHub URL</label>
          <input
            value={form.githubUrl}
            onChange={e => setForm({ ...form, githubUrl: e.target.value })}
            className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.githubUrl ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
            placeholder="https://github.com/..."
          />
          {errors.githubUrl && <p className="mt-1 text-xs font-bold text-red-600">{errors.githubUrl}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Demo URL</label>
          <input
            value={form.demoUrl}
            onChange={e => setForm({ ...form, demoUrl: e.target.value })}
            className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${errors.demoUrl ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
            placeholder="https://demo.com"
          />
          {errors.demoUrl && <p className="mt-1 text-xs font-bold text-red-600">{errors.demoUrl}</p>}
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Start Date</label>
          <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">End Date</label>
          <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
            disabled={form.isOngoing}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-40" />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <input type="checkbox" checked={form.isOngoing} onChange={e => setForm({ ...form, isOngoing: e.target.checked, endDate: e.target.checked ? '' : form.endDate })}
              className="h-4 w-4 rounded border-2 border-slate-300" />
            Ongoing
          </label>
        </div>
      </div>

      {/* Role & Team Size */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Your Role</label>
          <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Lead Developer, Designer, etc." />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Team Size</label>
          <input type="number" min="1" value={form.teamSize} onChange={e => setForm({ ...form, teamSize: parseInt(e.target.value) || 1 })}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
      </div>

      {/* Highlights */}
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">Key Highlights</label>
        <div className="flex gap-2">
          <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddHighlight() } }}
            className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="e.g. Increased performance by 40%" />
          <button type="button" onClick={handleAddHighlight} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white">Add</button>
        </div>
        {form.highlights?.length > 0 && (
          <ul className="mt-2 space-y-1">
            {form.highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                <span>✦</span>
                <span className="flex-1">{h}</span>
                <button type="button" onClick={() => removeListItem('highlights', i)} className="text-slate-400 hover:text-red-500">&times;</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Outcome */}
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-700">Outcome / Impact</label>
        <textarea rows={3} value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })}
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="What was the result? Any metrics or achievements?" />
      </div>

      {/* Visibility & Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Visibility</label>
          <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
        <button type="submit" disabled={saving}
          className="flex-1 rounded-xl border-2 border-slate-900 bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50">
          {saving ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:border-slate-400">
          Cancel
        </button>
      </div>
    </form>
  )
}
