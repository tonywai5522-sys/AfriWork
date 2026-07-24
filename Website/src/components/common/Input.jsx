import { useState } from 'react'

export default function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const [focused, setFocused] = useState(false)
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-aw-800"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-aw-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className={`
            w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-aw-900
            placeholder:text-aw-400 transition-all duration-150
            ${focused ? 'border-aw-900 ring-1 ring-aw-900/10' : 'border-aw-200 hover:border-aw-300'}
            ${error ? '!border-red-500 !ring-1 !ring-red-500/20' : ''}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${className}
          `}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-aw-400">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-xs text-aw-400">
          {helperText}
        </p>
      )}
    </div>
  )
}
