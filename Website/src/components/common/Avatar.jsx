const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-xl' }
const statusMap = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3', xl: 'h-3.5 w-3.5' }
const statusColor = { online: 'bg-emerald-500', away: 'bg-amber-500', busy: 'bg-red-500', offline: 'bg-aw-300' }

const colors = [
  'bg-primary-100 text-primary-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
]

export default function Avatar({ src, alt = '', name, size = 'md', status, className = '' }) {
  const initials = name ? name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : '?'
  const colorIndex = name ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length : 0

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className={`rounded-full object-cover border-2 border-white ${sizeMap[size] || sizeMap.md}`} />
      ) : (
        <div className={`flex items-center justify-center rounded-full border-2 border-white font-semibold ${sizeMap[size] || sizeMap.md} ${colors[colorIndex]}`}>
          {initials}
        </div>
      )}
      {status && (
        <span className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${statusColor[status] || statusColor.offline} ${statusMap[size] || statusMap.md}`} />
      )}
    </div>
  )
}
