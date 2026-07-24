import { Link } from 'react-router-dom'

const TYPE_CONFIG = {
  users: {
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      </svg>
    ),
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    label: 'User',
  },
  jobs: {
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    label: 'Job',
  },
  projects: {
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    label: 'Project',
  },
  organizations: {
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    label: 'Organization',
  },
  teams: {
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    badge: 'bg-rose-100 text-rose-700 border-rose-300',
    label: 'Team',
  },
  skills: {
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    badge: 'bg-purple-100 text-purple-700 border-purple-300',
    label: 'Skill',
  },
}

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || {
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    label: type || 'Result',
  }
}

export default function SearchResultCard({ result, onClick }) {
  const typeConfig = getTypeConfig(result.type)
  const hasMetadata = result.metadata && (result.metadata.status || result.metadata.date || result.metadata.count !== undefined)

  const content = (
    <div className="group rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 cursor-pointer">
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600">
          {typeConfig.icon('h-5 w-5')}
        </div>

        <div className="min-w-0 flex-1">
          {/* Title + type badge */}
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900 group-hover:underline">
              {result.title}
            </h3>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${typeConfig.badge}`}>
              {typeConfig.label}
            </span>
          </div>

          {/* Description */}
          {result.description && (
            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
              {result.description}
            </p>
          )}

          {/* Subtitle */}
          {result.subtitle && (
            <p className="mt-1 text-[10px] text-slate-400">
              {result.subtitle}
            </p>
          )}

          {/* Metadata */}
          {hasMetadata && (
            <div className="mt-2 flex flex-wrap gap-2">
              {result.metadata.status && (
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                  {result.metadata.status}
                </span>
              )}
              {result.metadata.date && (
                <span className="text-[9px] text-slate-400">
                  {new Date(result.metadata.date).toLocaleDateString()}
                </span>
              )}
              {result.metadata.count !== undefined && (
                <span className="text-[9px] text-slate-400">
                  {result.metadata.count} items
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return <div onClick={() => onClick(result)}>{content}</div>
  }

  if (result.url) {
    return <Link to={result.url}>{content}</Link>
  }

  return content
}

export function SearchResultCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)]">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-12 rounded-full bg-slate-100" />
          </div>
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}