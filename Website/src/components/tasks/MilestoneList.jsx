const STATUS_COLORS = {
  pending: 'border-slate-300 bg-slate-100 text-slate-700',
  in_progress: 'border-blue-300 bg-blue-100 text-blue-700',
  completed: 'border-emerald-300 bg-emerald-100 text-emerald-700',
  cancelled: 'border-red-300 bg-red-100 text-red-700',
}

export default function MilestoneList({ milestones, onMilestoneClick, onAddMilestone }) {
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
      <div className="flex items-center justify-between border-b-2 border-slate-900 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-900">Milestones</h3>
        {onAddMilestone && (
          <button
            onClick={onAddMilestone}
            className="flex items-center gap-1 rounded-lg border-2 border-slate-900 bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Milestone
          </button>
        )}
      </div>

      <div className="divide-y-2 divide-slate-200">
        {milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="mt-2 text-xs font-medium text-slate-400">No milestones yet</p>
          </div>
        ) : (
          milestones.map((milestone) => {
            const statusColor = STATUS_COLORS[milestone.status] || STATUS_COLORS.pending
            const daysRemaining = getDaysRemaining(milestone.dueDate)
            const isOverdue = daysRemaining !== null && daysRemaining < 0

            return (
              <div
                key={milestone.id}
                onClick={() => onMilestoneClick?.(milestone)}
                className="cursor-pointer px-5 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{milestone.title}</h4>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold capitalize ${statusColor}`}>
                        {milestone.status?.replace('_', ' ')}
                      </span>
                    </div>
                    {milestone.description && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">{milestone.description}</p>
                    )}
                  </div>
                  {milestone.dueDate && (
                    <span className={`shrink-0 text-[10px] font-bold ${isOverdue ? 'text-red-500' : daysRemaining <= 7 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        milestone.status === 'completed' ? 'bg-emerald-500' :
                        milestone.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(milestone.progress || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">{milestone.progress || 0}%</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}