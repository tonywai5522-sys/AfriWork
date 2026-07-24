import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../constants/routes.js'
import SearchBar from '../../components/search/SearchBar.jsx'
import NotificationBell from '../../components/notifications/NotificationBell.jsx'
import Dropdown, { DropdownItem, DropdownDivider } from '../../components/common/Dropdown.jsx'
import Avatar from '../../components/common/Avatar.jsx'

export default function Topbar({ onMenuToggle }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-aw-100 bg-white/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-aw-200 text-aw-500 hover:bg-aw-50 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Logo */}
      <Link to={ROUTES.home} className="flex items-center gap-1.5 shrink-0 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aw-900">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
          </svg>
        </div>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <SearchBar
          onSearch={(q, t) => navigate(`${ROUTES.search}?q=${encodeURIComponent(q)}&type=${t || 'all'}`)}
          placeholder="Search users, jobs, projects..."
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <NotificationBell />

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-xl border border-aw-200 bg-white px-2.5 py-1.5 hover:bg-aw-50 transition-colors">
              <Avatar name={user?.name} size="sm" />
              <span className="hidden sm:inline text-sm font-medium text-aw-700 max-w-[100px] truncate">
                {user?.name || user?.email}
              </span>
              <svg className="h-3 w-3 text-aw-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          }
          align="right"
        >
          <div className="px-4 py-2 border-b border-aw-100">
            <p className="text-sm font-semibold text-aw-900">{user?.name || 'User'}</p>
            <p className="text-xs text-aw-400 capitalize">{user?.role}</p>
          </div>
          <DropdownItem onClick={() => navigate(ROUTES.profile)} icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
          }>Profile</DropdownItem>
          <DropdownItem onClick={() => navigate(ROUTES.settings)} icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94" /></svg>
          }>Settings</DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={logout} danger icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
          }>Sign Out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}
