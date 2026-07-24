import { useState, useEffect } from 'react'

export default function MilestoneForm({ open, onClose, onSubmit, initialData, projectId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('pending')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : '')
      setBudget(initialData.budget || '')
      setCurrency(initialData.currency || 'USD')
      setStatus(initialData.status || 'pending')
    } else {
      setTitle('')
      setDescription('')
      setDueDate('')
      setBudget('')
      setCurrency('USD')
      setStatus('pending')
    }
    setErrors({})
  }, [initialData, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      budget: budget ? parseFloat(budget) : null,
      currency,
      status,
      projectId,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl border-2 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center justify-between border-b-2 border-slate-900 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">
            {initialData ? 'Edit Milestone' : 'Create Milestone'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-slate-900 bg-red-100 text-xs font-bold text-slate-900 hover:bg-red-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors({...errors, title: undefined}) }}
              className={`w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 ${
                errors.title ? 'border-red-500' : ''
              }`}
              placeholder="Milestone title"
            />
            {errors.title && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
              rows={3}
              placeholder="Describe this milestone..."
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Budget</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="XAF">XAF</option>
                <option value="NGN">NGN</option>
                <option value="KES">KES</option>
                <option value="ZAR">ZAR</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-slate-900 bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg border-2 border-slate-900 bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600"
            >
              {initialData ? 'Update Milestone' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}