import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  const [localActive, setLocalActive] = useState(0)
  const current = activeTab !== undefined ? activeTab : localActive

  const handleChange = (index) => {
    if (onChange) onChange(index)
    else setLocalActive(index)
  }

  return (
    <div className={`border-b border-aw-100 ${className}`}>
      <div className="flex gap-0 -mb-px" role="tablist">
        {tabs.map((tab, index) => {
          const isActive = current === index
          return (
            <button
              key={tab.id || index}
              id={`tab-${index}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${index}`}
              onClick={() => handleChange(index)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'text-aw-900' : 'text-aw-400 hover:text-aw-600'}`}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-aw-900 text-white' : 'bg-aw-100 text-aw-500'}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-aw-900 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
