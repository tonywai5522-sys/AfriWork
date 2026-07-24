import { useEffect, useState } from 'react'
const QUERY = '(prefers-reduced-motion: reduce)'
export default function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(QUERY).matches
  })
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const handler = (e) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return prefersReduced
}
