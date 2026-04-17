'use client'

import { useEffect } from 'react'
import { warmupCache } from '@/lib/queryCache'

/**
 * Componente invisível que aquece o cache Supabase logo no startup.
 * Dispara fetchRegistros() em background para todos os períodos padrão,
 * de modo que qualquer página carregue instantaneamente após a primeira.
 */
export default function CacheWarmer() {
  useEffect(() => {
    // Pequeno delay para não competir com a query da página atual
    const t = setTimeout(warmupCache, 300)
    return () => clearTimeout(t)
  }, [])

  return null
}
