const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
  accepted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  withdrawn: 'bg-slate-100 text-slate-600 border-slate-300',
}

const STATUS_LABELS = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  rejected: 'Not Selected',
  withdrawn: 'Withdrawn',
}

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending
  const label = STATUS_LABELS[status] || status

  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold ${style} ${className}`}>
      {label}
    </span>
  )
}
