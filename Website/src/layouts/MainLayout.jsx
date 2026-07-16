export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold">AfriWork</p>
            <p className="text-sm text-slate-500">Digital Talent Infrastructure</p>
          </div>
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            <a href="#platform" className="hover:text-slate-900">Platform</a>
            <a href="#opportunities" className="hover:text-slate-900">Opportunities</a>
            <a href="#about" className="hover:text-slate-900">About</a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
