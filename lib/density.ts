'use client'

export type Density = 'comfortable' | 'compact'
const KEY = 'pv-density'

export function getDensity(): Density {
  if (typeof window === 'undefined') return 'comfortable'
  const v = localStorage.getItem(KEY)
  return v === 'compact' ? 'compact' : 'comfortable'
}

export function saveDensity(d: Density) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, d)
  document.documentElement.setAttribute('data-density', d)
}

export function applyDensityOnMount() {
  if (typeof document === 'undefined') return
  const d = getDensity()
  document.documentElement.setAttribute('data-density', d)
}
