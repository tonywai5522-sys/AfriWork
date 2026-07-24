const COLORS = {
  purple: 'border-purple-400 bg-purple-50',
  blue: 'border-blue-400 bg-blue-50',
  emerald: 'border-emerald-400 bg-emerald-50',
  amber: 'border-amber-400 bg-amber-50',
  red: 'border-red-400 bg-red-50',
  cyan: 'border-cyan-400 bg-cyan-50',
  pink: 'border-pink-400 bg-pink-50',
  indigo: 'border-indigo-400 bg-indigo-50',
}

export default function StatCard({ label, value, change, color, icon, subtitle }) {
  const c = COLORS[color] || COLORS.blue
  return (
    <div className={`rounded-2xl border-2 p-5 ${c}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-black tracking-tight">{value ?? '—'}</p>
          <p className="text-xs mt-1 font-medium opacity-70">{label}</p>
        </div>
        {icon && <span className="text-xl opacity-50">{icon}</span>}
      </div>
      {change !== undefined && (
        <p className={`text-[10px] font-bold mt-1 ${change >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% {subtitle || 'vs last month'}
        </p>
      )}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 animate-pulse">
      <div className="h-8 w-20 rounded bg-slate-200 mb-2" />
      <div className="h-3 w-28 rounded bg-slate-200" />
    </div>
  )
}
