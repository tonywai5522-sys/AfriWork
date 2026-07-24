import { useState, useEffect } from 'react'

export default function TaskForm({ open, onClose, onSubmit, initialData, projectId, taskListId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [milestoneId, setMilestoneId] = useState('')
  const [labels, setLabels] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setPriority(initialData.priority || 'medium')
      setAssigneeId(initialData.assigneeId || '')
      setAssigneeName(initialData.assigneeName || '')
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : '')
      setEstimatedHours(initialData.estimatedHours || '')
      setMilestoneId(initialData.milestoneId || '')
      setLabels(initialData.labels ? initialData.labels.join(', ') : '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setAssigneeId('')
      setAssigneeName('')
      setDueDate('')
      setEstimatedHours('')
      setMilestoneId('')
      setLabels('')
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

    const parsedLabels = labels
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      assigneeId: assigneeId.trim() || null,
      assigneeName: assigneeName.trim() || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      milestoneId: milestoneId.trim() || null,
      labels: parsedLabels,
      projectId: initialData?.projectId || projectId,
      taskListId: initialData?.taskListId || taskListId,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl border-2 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center justify-between border-b-2 border-slate-900 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">
            {initialData ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-slate-900 bg-red-100 text-xs font-bold text-slate-900 hover:bg-red-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors({...errors, title: undefined}) }}
              className={`w-full rounded-lg border-2 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 ${
                errors.title ? 'border-red-500' : 'border-slate-900'
              }`}
              placeholder="Enter task title"
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
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Assignee ID</label>
              <input
                type="text"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                placeholder="User ID"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Assignee Name</label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                placeholder="Full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                placeholder="8"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Milestone ID</label>
              <input
                type="text"
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                placeholder="Milestone ID"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase text-slate-600">Labels</label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-900 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
              placeholder="bug, frontend, urgent (comma-separated)"
            />
            <p className="mt-1 text-[10px] text-slate-400">Separate labels with commas</p>
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
              {initialData ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}