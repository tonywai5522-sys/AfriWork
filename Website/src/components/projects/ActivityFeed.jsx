const ACTION_ICONS = {
  project_created: 'plus-circle',
  project_updated: 'pencil',
  task_created: 'plus',
  task_updated: 'pencil',
  task_completed: 'check-circle',
  task_status_changed: 'arrow-right-circle',
  milestone_created: 'flag',
  milestone_completed: 'check-circle',
  comment_added: 'chat',
  member_added: 'user-plus',
  member_removed: 'user-minus',
  file_uploaded: 'paperclip',
}

const ICON_SVG = {
  'plus-circle': <><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></>,
  pencil: <><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></>,
  plus: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></>,
  'check-circle': <><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></>,
  'arrow-right-circle': <><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></>,
  flag: <><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></>,
  chat: <><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></>,
  'user-plus': <><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></>,
  'user-minus': <><path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></>,
  paperclip: <><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.122-2.122L16.5 6" /></>,
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ActivityFeed({ entries = [], onLoadMore, hasMore }) {
  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white">
      <div className="border-b-2 border-slate-900 px-5 py-3">
        <h3 className="text-sm font-bold text-slate-900">Activity Feed</h3>
      </div>
      <div className="divide-y-2 divide-slate-100">
        {entries.length === 0 && (
          <p className="p-5 text-center text-sm text-slate-500">No activity yet</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id || entry._id} className="flex items-start gap-3 px-5 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100 text-slate-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                {ICON_SVG[ACTION_ICONS[entry.action]] || ICON_SVG.pencil}
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-900">
                <span className="font-bold">
                  {entry.actorName || 'Someone'}
                </span>{' '}
                <span className="text-slate-600">{entry.description || entry.action?.replace(/_/g, ' ') || 'did something'}</span>
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(entry.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full border-t-2 border-slate-900 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          Load more activity
        </button>
      )}
    </div>
  )
}
