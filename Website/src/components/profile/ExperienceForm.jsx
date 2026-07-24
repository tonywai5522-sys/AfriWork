import { useState } from 'react'

const emptyExp = () => ({
  company: '',
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  technologies: [],
})

export default function ExperienceForm({ experience = [], onChange }) {
  const [items, setItems] = useState(experience)
  const [editing, setEditing] = useState(null)

  function handleAdd() {
    setEditing({ ...emptyExp(), id: `new_${Date.now()}` })
  }

  function handleSave() {
    if (!editing.company.trim() || !editing.title.trim() || !editing.startDate) return
    const updated = editing.id.startsWith('new_')
      ? [...items, editing]
      : items.map(e => e.id === editing.id ? editing : e)
    setItems(updated)
    onChange(updated)
    setEditing(null)
  }

  function handleEdit(item) {
    setEditing({ ...item })
  }

  function handleDelete(id) {
    const updated = items.filter(e => e.id !== id)
    setItems(updated)
    onChange(updated)
  }

  function handleCancel() {
    setEditing(null)
  }

  function handleTechInput(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      const tech = e.target.value.trim()
      setEditing(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), tech],
      }))
      e.target.value = ''
    }
  }

  function removeTech(idx) {
    setEditing(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== idx),
    }))
  }

  return (
    <div className="space-y-4">
      {items.map((exp) => (
        <div key={exp.id} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{exp.title}</p>
              <p className="text-xs text-slate-600">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
              <p className="text-xs text-slate-400">
                {exp.startDate} — {exp.current ? 'Present' : exp.endDate || 'N/A'}
              </p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => handleEdit(exp)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-200">Edit</button>
              <button type="button" onClick={() => handleDelete(exp.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Del</button>
            </div>
          </div>
          {exp.description && <p className="mt-2 text-xs text-slate-600">{exp.description}</p>}
        </div>
      ))}

      {editing && (
        <div className="rounded-xl border-2 border-slate-900 bg-white p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
          <h4 className="mb-3 text-sm font-bold text-slate-900">
            {editing.id.startsWith('new_') ? 'Add Experience' : 'Edit Experience'}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <input className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" placeholder="Company *" value={editing.company} onChange={e => setEditing({ ...editing, company: e.target.value })} />
            <input className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" placeholder="Title *" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            <input className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" placeholder="Location" value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} />
            <div className="flex items-center gap-2">
              <input type="date" className="flex-1 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" value={editing.startDate} onChange={e => setEditing({ ...editing, startDate: e.target.value })} />
              {!editing.current && (
                <input type="date" className="flex-1 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" value={editing.endDate} onChange={e => setEditing({ ...editing, endDate: e.target.value })} />
              )}
            </div>
            <label className="col-span-2 flex items-center gap-2 text-xs">
              <input type="checkbox" className="h-4 w-4 rounded border-2 border-slate-300" checked={editing.current} onChange={e => setEditing({ ...editing, current: e.target.checked, endDate: e.target.checked ? '' : editing.endDate })} />
              I currently work here
            </label>
            <textarea className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" rows={3} placeholder="Description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            <div className="col-span-2">
              <input className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" placeholder="Technologies (press Enter to add)" onKeyDown={handleTechInput} />
              <div className="mt-1 flex flex-wrap gap-1">
                {(editing.technologies || []).map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px]">
                    {t}
                    <button type="button" onClick={() => removeTech(i)} className="text-slate-400 hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={handleSave} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Save</button>
            <button type="button" onClick={handleCancel} className="rounded-xl border-2 border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      )}

      {!editing && (
        <button type="button" onClick={handleAdd} className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-xs font-bold text-slate-500 transition-all hover:border-slate-900 hover:text-slate-900">
          + Add Experience
        </button>
      )}

      {items.length === 0 && !editing && (
        <p className="text-xs text-slate-400 italic">No experience added yet.</p>
      )}
    </div>
  )
}
