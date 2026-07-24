import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext.jsx'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export default function NotificationsPage() {
  const { notifications, loading, hasMore, total, unreadCount, markAsRead, markAllAsRead, loadMore, fetchNotifications } = useNotifications()

  useEffect(() => {
    fetchNotifications(1)
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">{total} total · {unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-slate-900" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-slate-400">No notifications</h3>
            <p className="mt-1 text-sm text-slate-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  {notif.link ? (
                    <Link
                      to={notif.link}
                      onClick={() => { if (!notif.isRead) markAsRead(notif.id) }}
                      className="block"
                    >
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      <p className="mt-0.5 text-sm text-slate-500">{notif.body}</p>
                    </Link>
                  ) : (
                    <>
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      <p className="mt-0.5 text-sm text-slate-500">{notif.body}</p>
                    </>
                  )}
                  <p className="mt-1 text-xs text-slate-400">{timeAgo(notif.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!notif.isRead && (
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  )}
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Mark as read"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="border-t-2 border-slate-100 p-4 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="rounded-xl border-2 border-slate-200 px-6 py-2 text-sm font-bold text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
