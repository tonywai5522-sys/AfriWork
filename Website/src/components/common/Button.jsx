import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-aw-900 text-white border-aw-900 hover:bg-aw-800 active:bg-aw-950 shadow-sm',
  secondary: 'bg-white text-aw-900 border-aw-300 hover:bg-aw-50 hover:border-aw-400 active:bg-aw-100',
  ghost: 'bg-transparent text-aw-700 border-transparent hover:bg-aw-50 hover:text-aw-900 active:bg-aw-100',
  danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm',
  tertiary: 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl border
        transition-all duration-150 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${loading ? 'relative !text-transparent' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      )}
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </motion.button>
  )
}
