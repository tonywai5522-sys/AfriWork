import { motion } from 'framer-motion'

export default function DashboardCard({ title, action, children, className = '', padding = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-aw-200 bg-white shadow-sm ${padding ? 'p-5' : ''} ${className}`}
    >
      {(title || action) && (
        <div className={`flex items-center justify-between ${padding ? 'mb-4' : 'mb-0'}`}>
          {title && <h3 className="text-sm font-semibold text-aw-900">{title}</h3>}
          {action && <div className="text-xs">{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  )
}

export function DashboardCardSkeleton({ lines = 3 }) {
  return (
    <div className="animate-pulse rounded-2xl border border-aw-100 bg-white p-5">
      <div className="mb-4 h-4 w-32 rounded bg-aw-100" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="mb-2 h-3 rounded bg-aw-50" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  )
}
