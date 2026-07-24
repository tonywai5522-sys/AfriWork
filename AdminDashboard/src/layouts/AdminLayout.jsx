import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/employers', label: 'Employers', icon: '🏢' },
  { path: '/projects', label: 'Projects', icon: '📋' },
  { path: '/verifications', label: 'Verifications', icon: '✅' },
  { path: '/content', label: 'Content', icon: '📝' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
  { path: '/activity', label: 'Activity Log', icon: '🔍' },
  { path: '/audit-logs', label: 'Audit Logs', icon: '🔒' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    localStorage.removeItem('admin_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 border-r-2 border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b-2 border-slate-200 px-6 py-5">
            <span className="text-2xl">🌍</span>
            <div>
              <h1 className="text-base font-black tracking-tight">AfriWork</h1>
              <p className="text-[10px] font-bold text-purple-600">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,0.3)]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="border-t-2 border-slate-200 px-3 py-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <span>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b-2 border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border-2 border-slate-200 px-3 py-1.5 text-sm font-bold lg:hidden"
              >
                ☰
              </button>
              <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
                <span className="font-bold text-slate-900">Admin</span>
                <span>/</span>
                <span>{NAV_ITEMS.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.label || 'Dashboard'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                System Online
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
