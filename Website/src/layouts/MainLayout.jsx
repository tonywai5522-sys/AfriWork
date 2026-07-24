import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.js'
import { ROUTES, getDefaultDashboard } from '../constants/routes.js'
import Button from '../components/common/Button.jsx'
import Avatar from '../components/common/Avatar.jsx'
import Dropdown, { DropdownItem, DropdownDivider } from '../components/common/Dropdown.jsx'
import NotificationBell from '../components/notifications/NotificationBell.jsx'

const NAV_LINKS = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Find Work', path: ROUTES.jobs },
  { label: 'For Employers', path: '/for-employers' },
  { label: 'Learning', path: '/learning' },
  { label: 'About', path: '/about' },
]

const FOOTER_LINKS = {
  Platform: [
    { label: 'Find Work', path: ROUTES.jobs },
    { label: 'Browse Talent', path: '/talent' },
    { label: 'Projects', path: ROUTES.projects },
    { label: 'Learning', path: '/learning' },
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Careers', path: '/careers' },
    { label: 'Press', path: '/press' },
  ],
  Resources: [
    { label: 'Help Center', path: ROUTES.help },
    { label: 'Community', path: '/community' },
    { label: 'Developer API', path: '/api' },
    { label: 'Status', path: '/status' },
  ],
  Legal: [
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
    { label: 'Security', path: '/security' },
    { label: 'Cookies', path: '/cookies' },
  ],
}

export default function MainLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashboardPath = user?.role ? getDefaultDashboard(user.role) : ROUTES.dashboard

  return (
    <div className="min-h-screen bg-[#fafafa] text-aw-900 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-aw-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex items-center gap-1.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-aw-900">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-aw-900">AfriWork</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'text-aw-900 bg-aw-50' : 'text-aw-500 hover:text-aw-900 hover:bg-aw-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-2 rounded-xl border border-aw-200 bg-white px-3 py-1.5 hover:bg-aw-50 transition-colors">
                      <Avatar name={user?.name} size="sm" />
                      <span className="hidden sm:inline text-sm font-medium text-aw-700 max-w-[120px] truncate">
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
                  <DropdownItem onClick={() => {}} icon={
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" /></svg>
                  }>
                    <Link to={dashboardPath}>Dashboard</Link>
                  </DropdownItem>
                  <DropdownItem onClick={() => {}} icon={
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  }>
                    <Link to={ROUTES.profile}>Profile</Link>
                  </DropdownItem>
                  <DropdownItem onClick={() => {}} icon={
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127" /></svg>
                  }>
                    <Link to={ROUTES.settings}>Settings</Link>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={logout} danger icon={
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                  }>Sign Out</DropdownItem>
                </Dropdown>
              </>
            ) : (
              <>
                <Link to={ROUTES.login}>
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to={ROUTES.register}>
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-aw-200 text-aw-500 hover:bg-aw-50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-aw-950/30 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 z-40 h-full w-72 bg-white border-l border-aw-100 shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-aw-100">
              <span className="text-sm font-bold text-aw-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="h-8 w-8 rounded-lg text-aw-400 hover:bg-aw-50 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-aw-50 text-aw-900' : 'text-aw-500 hover:bg-aw-50 hover:text-aw-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            {!isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-aw-100 bg-white space-y-2">
                <Link to={ROUTES.login} onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 rounded-xl border border-aw-200 text-sm font-medium text-aw-700 hover:bg-aw-50">Sign In</Link>
                <Link to={ROUTES.register} onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 rounded-xl bg-aw-900 text-sm font-semibold text-white hover:bg-aw-800">Get Started</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-aw-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to={ROUTES.home} className="flex items-center gap-1.5 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aw-900">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
                </div>
                <span className="text-base font-bold text-aw-900">AfriWork</span>
              </Link>
              <p className="text-sm text-aw-400 leading-relaxed max-w-xs">
                Africa's digital talent infrastructure — connecting skilled professionals with opportunities that build the future.
              </p>
            </div>

            {/* Link Columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-semibold text-aw-400 uppercase tracking-wider mb-3">{title}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <a href={link.href} className="text-sm text-aw-600 hover:text-aw-900 transition-colors">{link.label}</a>
                      ) : (
                        <Link to={link.path} className="text-sm text-aw-600 hover:text-aw-900 transition-colors">{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-aw-100">
            <p className="text-xs text-aw-400">
              &copy; {new Date().getFullYear()} AfriWork. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-aw-400 hover:text-aw-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-aw-400 hover:text-aw-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" /></svg>
              </a>
              <a href="#" className="text-aw-400 hover:text-aw-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
              </a>
              <a href="#" className="text-aw-400 hover:text-aw-600 transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
