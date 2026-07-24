const PRIORITY_COLORS = {
  urgent: { badge: 'border-red-300 bg-red-100 text-red-700', dot: 'bg-red-500' },
  high: { badge: 'border-orange-300 bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  medium: { badge: 'border-blue-300 bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  low: { badge: 'border-emerald-300 bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  none: { badge: 'border-slate-300 bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

export default function TaskCard({ task, onClick }) {
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.none
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
  const labels = task.labels || []
  const commentCount = task.commentCount || 0

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.priority !== 'none'

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border-2 border-slate-900 bg-white p-3 transition-all hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
    >
      {/* Title */}
      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{task.title}</h4>

      {/* Priority Badge */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${priorityColor.badge}`}>
          {task.priority}
        </span>
      </div>

      {/* Assignee & Due Date */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-900 bg-slate-200 text-[9px] font-black text-slate-900">
            {task.assigneeName?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-[10px] font-medium text-slate-600 truncate max-w-[80px]">
            {task.assigneeName || 'Unassigned'}
          </span>
        </div>
        {dueDate && (
          <span className={`text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
            {dueDate}
          </span>
        )}
      </div>

      {/* Labels & Comment Count */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {labels.slice(0, 2).map((label, idx) => (
            <span
              key={idx}
              className="rounded-full border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
            >
              {label}
            </span>
          ))}
          {labels.length > 2 && (
            <span className="text-[9px] font-medium text-slate-400">+{labels.length - 2}</span>
          )}
        </div>
        {commentCount > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-slate-400">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            {commentCount}
          </span>
        )}
      </div>
    </div>
  )
}