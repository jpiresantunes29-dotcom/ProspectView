'use client'

import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    setValue(0)
    if (target === 0) return
    let cancelled = false
    const start = performance.now()

    function update(now: number) {
      if (cancelled) return
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
    return () => { cancelled = true }
  }, [target, duration])

  return value
}
