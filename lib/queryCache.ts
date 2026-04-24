/**
 * queryCache.ts
 * Cache simples de queries de `registros` em sessionStorage com TTL 5 min.
 * Usado pelas páginas que leem registros de João Pedro.
 *
 * Sem warmup automático (era desperdício de queries no startup) e sem
 * referências a rotas removidas. Prefetch on-hover continua disponível.
 */

import { supabase } from '@/lib/supabase'
import type { Registro } from '@/lib/supabase'
import { periodoParaDatas, periodoAnteriorDatas } from '@/components/filtro-periodo'

const TTL_MS = 5 * 60 * 1000

interface CacheEntry {
  data: Registro[]
  ts: number
}

function cacheKey(inicio: string, fim: string, usuario?: string): string {
  return `qc:registros:${inicio}:${fim}:${usuario ?? 'all'}`
}

function readCache(key: string): Registro[] | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.ts > TTL_MS) {
      sessionStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function writeCache(key: string, data: Registro[]): void {
  try {
    const entry: CacheEntry = { data, ts: Date.now() }
    sessionStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // sessionStorage indisponível (SSR / modo privado) — ignorar
  }
}

export async function fetchRegistros(
  inicio: string,
  fim: string,
  usuario?: 'joao_pedro' | 'atanael'
): Promise<Registro[]> {
  const key = cacheKey(inicio, fim, usuario)
  const cached = readCache(key)
  if (cached) return cached

  let query = supabase
    .from('registros')
    .select('*')
    .gte('data', inicio)
    .lte('data', fim)
    .order('data')

  if (usuario) query = query.eq('usuario', usuario) as typeof query

  const { data, error } = await query
  if (error) throw error

  const result = (data as Registro[]) ?? []
  writeCache(key, result)
  return result
}

export function invalidateRegistrosCache(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k?.startsWith('qc:registros:')) keys.push(k)
    }
    keys.forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // ignorar
  }
}

/**
 * Prefetch on-hover dos links da navbar.
 * Chamado quando o mouse entra num link, ~100-200ms antes do clique.
 * Mapeia rotas existentes hoje para a query que cada uma vai precisar.
 */
export function prefetchPage(href: string): void {
  const { inicio, fim } = periodoParaDatas('30d')
  const { inicio: pI, fim: pF } = periodoAnteriorDatas('30d')

  if (href === '/' || href === '/captacao') {
    fetchRegistros(inicio, fim, 'joao_pedro').catch(() => {})
    fetchRegistros(pI, pF, 'joao_pedro').catch(() => {})
  }
  // /contato, /historico, /metas, /metricas-tier, /diagnostico, /registrar:
  // não dependem de cache de registros JP (leem atividades direto ou usam localStorage).
}
