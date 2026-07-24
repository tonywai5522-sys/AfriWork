import { motion } from 'framer-motion'

const accentMap = {
  slate: 'from-aw-50 to-aw-100 text-aw-700',
  emerald: 'from-emerald-50 to-emerald-100 text-emerald-700',
  blue: 'from-blue-50 to-blue-100 text-blue-700',
  amber: 'from-amber-50 to-amber-100 text-amber-700',
  purple: 'from-purple-50 to-purple-100 text-purple-700',
  red: 'from-red-50 to-red-100 text-red-700',
}

const iconBgMap = {
  slate: 'bg-aw-900 text-white',
  emerald: 'bg-emerald-600 text-white',
  blue: 'bg-blue-600 text-white',
  amber: 'bg-amber-500 text-white',
  purple: 'bg-purple-600 text-white',
  red: 'bg-red-600 text-white',
}

export default function StatCard({ label, value, change, icon, color = 'slate', className = '' }) {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-aw-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-aw-400 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBgMap[color] || iconBgMap.slate}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-aw-900">{value}</span>
        {change !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            <svg className={`h-3 w-3 ${isPositive ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-aw-100 bg-white p-5">
      <div className="mb-3 h-3 w-20 rounded bg-aw-100" />
      <div className="h-7 w-16 rounded bg-aw-100" />
    </div>
  )
}
