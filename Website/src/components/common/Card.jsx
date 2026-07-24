import { motion } from 'framer-motion'

const variants = {
  default: 'bg-white border-aw-200 shadow-sm',
  interactive: 'bg-white border-aw-200 shadow-sm hover:shadow-md hover:border-aw-300 cursor-pointer',
  bordered: 'bg-white border-aw-100',
  elevated: 'bg-white border-aw-200 shadow-lg',
  muted: 'bg-aw-50 border-aw-100',
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  header,
  footer,
  onClick,
  hover = false,
  ...props
}) {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  }

  const Component = onClick ? motion.div : 'div'
  const motionProps = onClick
    ? {
        whileHover: { y: -2 },
        whileTap: { scale: 0.98 },
        onClick,
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e) },
      }
    : {}

  return (
    <Component
      className={`
        rounded-2xl border transition-all duration-200
        ${variants[variant] || variants.default}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {header && (
        <div className={`border-b border-aw-100 ${paddingMap[padding] || paddingMap.md} pb-0 mb-0`}>
          {header}
        </div>
      )}
      <div className={paddingMap[padding] || paddingMap.md}>
        {children}
      </div>
      {footer && (
        <div className={`border-t border-aw-100 ${paddingMap[padding] || paddingMap.md} pt-0 mt-0`}>
          {footer}
        </div>
      )}
    </Component>
  )
}
