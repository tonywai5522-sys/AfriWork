import { useState } from 'react'
import TaskForm from './TaskForm.jsx'

const PRIORITY_CLASSES = {
  urgent: 'border-red-300 bg-red-100 text-red-700',
  high: 'border-orange-300 bg-orange-100 text-orange-700',
  medium: 'border-blue-300 bg-blue-100 text-blue-700',
  low: 'border-emerald-300 bg-emerald-100 text-emerald-700',
  none: 'border-slate-300 bg-slate-100 text-slate-600',
}

const STATUS_CLASSES = {
  backlog: 'border-amber-300 bg-amber-100 text-amber-700',
  todo: 'border-blue-300 bg-blue-100 text-blue-700',
  in_progress: 'border-emerald-300 bg-emerald-100 text-emerald-700',
  review: 'border-purple-300 bg-purple-100 text-purple-700',
  done: 'border-slate-300 bg-slate-100 text-slate-600',
}

export default function TaskDetail({ open, onClose, task, onUpdate, onDelete }) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!open || !task) return null

  const priorityClass = PRIORITY_CLASSES[task.priority] || PRIORITY_CLASSES.none
  const statusClass = STATUS_CLASSES[task.status] || STATUS_CLASSES.backlog
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : null
  const createdAt = task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
  const updatedAt = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
  const labels = task.labels || []
  const commentCount = task.commentCount || 0

  if (showEditForm) {
    return (
      <TaskForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={(data) => {
          onUpdate && onUpdate(data)
          setShowEditForm(false)
        }}
        initialData={task}
      />
    )
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete && onDelete(task.id)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 line-clamp-1">{task.title}</h2>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass}`}>
              {task.status?.replace('_', ' ') || 'backlog'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-slate-900 bg-red-100 text-xs font-bold text-slate-900 hover:bg-red-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="space-y-5">
            {/* Priority & Assignee Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-500">Priority:</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${priorityClass}`}>
                  {task.priority || 'none'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-500">Assignee:</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-900 bg-slate-200 text-[10px] font-black text-slate-900">
                    {task.assigneeName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{task.assigneeName || 'Unassigned'}</span>
                </div>
              </div>
              {commentCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  {commentCount}
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <h4 className="mb-1.5 text-[10px] font-bold uppercase text-slate-500">Description</h4>
                <p className="rounded-lg border-2 border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              {dueDate && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Due Date</span>
                  <p className="text-sm font-bold text-slate-900">{dueDate}</p>
                </div>
              )}
              {createdAt && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Created</span>
                  <p className="text-sm font-medium text-slate-700">{createdAt}</p>
                </div>
              )}
              {updatedAt && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Updated</span>
                  <p className="text-sm font-medium text-slate-700">{updatedAt}</p>
                </div>
              )}
            </div>

            {/* Progress & Hours */}
            {task.progress !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Progress</span>
                  <span className="text-[11px] font-bold text-slate-600">{task.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min(task.progress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {task.estimatedHours !== undefined && task.estimatedHours !== null && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Estimated Hours</span>
                  <p className="text-sm font-bold text-slate-900">{task.estimatedHours}h</p>
                </div>
              )}
              {task.loggedHours !== undefined && task.loggedHours !== null && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Logged Hours</span>
                  <p className="text-sm font-bold text-slate-900">{task.loggedHours}h</p>
                </div>
              )}
            </div>

            {/* Labels */}
            {labels.length > 0 && (
              <div>
                <h4 className="mb-1.5 text-[10px] font-bold uppercase text-slate-500">Labels</h4>
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((label, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t-2 border-slate-900 px-5 py-3">
          <button
            onClick={handleDelete}
            className={`rounded-lg border-2 px-4 py-2 text-xs font-bold transition-all ${
              confirmDelete
                ? 'border-red-500 bg-red-500 text-white'
                : 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {confirmDelete ? 'Confirm Delete?' : 'Delete'}
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-lg border-2 border-slate-900 bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100">
              Close
            </button>
            <button
              onClick={() => setShowEditForm(true)}
              className="rounded-lg border-2 border-slate-900 bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}