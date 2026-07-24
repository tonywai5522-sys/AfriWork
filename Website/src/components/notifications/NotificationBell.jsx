import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext.jsx'
import { ROUTES } from '../../constants/routes.js'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return `${Math.floor(diff / 86400000)}d`
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleToggle() {
    if (!open) {
      fetchNotifications(1)
    }
    setOpen(!open)
  }

  const recent = (notifications || []).slice(0, 5)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-300 text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center justify-between border-b-2 border-slate-200 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[10px] font-bold text-slate-500 hover:text-slate-900">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {recent.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p className="mt-2 text-xs font-medium text-slate-400">No notifications yet</p>
              </div>
            ) : (
              recent.map(notif => (
                <div
                  key={notif.id}
                  className={`relative rounded-xl px-3 py-2.5 text-xs transition-colors hover:bg-slate-50 ${!notif.isRead ? 'bg-slate-50' : ''}`}
                >
                  <Link
                    to={notif.link || ROUTES.notifications}
                    onClick={() => { if (!notif.isRead) markAsRead(notif.id); setOpen(false) }}
                    className="block"
                  >
                    <div className="flex items-start gap-2">
                      {!notif.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                      <div className={`min-w-0 flex-1 ${notif.isRead ? 'ml-4' : ''}`}>
                        <p className="font-bold text-slate-900">{notif.title}</p>
                        <p className="mt-0.5 text-slate-500 line-clamp-2">{notif.body}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(notif.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="border-t-2 border-slate-200 p-2">
            <Link
              to={ROUTES.notifications}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
