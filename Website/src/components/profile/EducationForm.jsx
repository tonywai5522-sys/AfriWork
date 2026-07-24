import { useState } from 'react'

const emptyEdu = () => ({
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  gpa: '',
  description: '',
})

export default function EducationForm({ education = [], onChange }) {
  const [items, setItems] = useState(education)
  const [editing, setEditing] = useState(null)

  function handleAdd() {
    setEditing({ ...emptyEdu(), id: `new_${Date.now()}` })
  }

  function handleSave() {
    if (!editing.institution.trim() || !editing.degree.trim() || !editing.field.trim()) return
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

  return (
    <div className="space-y-4">
      {items.map((edu) => (
        <div key={edu.id} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{edu.degree} in {edu.field}</p>
              <p className="text-xs text-slate-600">{edu.institution}</p>
              <p className="text-xs text-slate-400">
                {edu.startDate} — {edu.endDate || 'Present'}
                {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
              </p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => handleEdit(edu)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-200">Edit</button>
              <button type="button" onClick={() => handleDelete(edu.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Del</button>
            </div>
          </div>
        </div>
      ))}

      {editing && (
        <div className="rounded-xl border-2 border-slate-900 bg-white p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
          <h4 className="mb-3 text-sm font-bold text-slate-900">
            {editing.id.startsWith('new_') ? 'Add Education' : 'Edit Education'}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <input className="col-span-2 rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" placeholder="Institution *" value={editing.institution} onChange={e => setEditing({ ...editing, institution: e.target.value })} />
            <input className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" placeholder="Degree *" value={editing.degree} onChange={e => setEditing({ ...editing, degree: e.target.value })} />
            <input className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" placeholder="Field of Study *" value={editing.field} onChange={e => setEditing({ ...editing, field: e.target.value })} />
            <input type="date" className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" value={editing.startDate} onChange={e => setEditing({ ...editing, startDate: e.target.value })} />
            <input type="date" className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" value={editing.endDate} onChange={e => setEditing({ ...editing, endDate: e.target.value })} />
            <input className="rounded-xl border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-900 focus:outline-none" placeholder="GPA (optional)" value={editing.gpa} onChange={e => setEditing({ ...editing, gpa: e.target.value })} />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={handleSave} className="rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Save</button>
            <button type="button" onClick={handleCancel} className="rounded-xl border-2 border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      )}

      {!editing && (
        <button type="button" onClick={handleAdd} className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-xs font-bold text-slate-500 transition-all hover:border-slate-900 hover:text-slate-900">
          + Add Education
        </button>
      )}

      {items.length === 0 && !editing && (
        <p className="text-xs text-slate-400 italic">No education added yet.</p>
      )}
    </div>
  )
}
