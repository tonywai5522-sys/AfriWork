import { motion } from 'framer-motion'

export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-aw-50 border border-aw-100 text-aw-400">
          {icon}
        </div>
      )}
      {title && <h3 className="text-lg font-semibold text-aw-900 mb-1">{title}</h3>}
      {description && <p className="text-sm text-aw-400 max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </motion.div>
  )
}
