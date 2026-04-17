/**
 * queryCache.ts
 * Cache de queries Supabase em sessionStorage com TTL de 5 minutos.
 * Elimina re-fetches desnecessários ao navegar entre páginas.
 * Inclui warmup automático e prefetch por página.
 */

import { supabase } from '@/lib/supabase'
import type { Registro } from '@/lib/supabase'
import { periodoParaDatas, periodoAnteriorDatas } from '@/components/filtro-periodo'

const TTL_MS = 5 * 60 * 1000 // 5 minutos

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
    // sessionStorage pode estar indisponível (SSR, modo privado)
  }
}

/**
 * Busca registros do Supabase com cache automático.
 * Se o mesmo intervalo já foi buscado nos últimos 2 minutos, retorna do cache.
 */
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

/**
 * Invalida todo o cache de registros (usar após salvar novos dados).
 */
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

// ─── Prefetch por página ─────────────────────────────────────────────────────

/**
 * Mapeia cada rota para as queries que ela vai precisar.
 * Chamado no hover do link (100-200ms antes do clique).
 */
export function prefetchPage(href: string): void {
  const periodo = '30d'
  const { inicio, fim } = periodoParaDatas(periodo)
  const { inicio: pI, fim: pF } = periodoAnteriorDatas(periodo)

  if (href === '/') {
    // Dashboard: todos os usuários, período atual + anterior
    fetchRegistros(inicio, fim).catch(() => {})
    fetchRegistros(pI, pF).catch(() => {})
  } else if (href === '/captacao') {
    fetchRegistros(inicio, fim, 'joao_pedro').catch(() => {})
    fetchRegistros(pI, pF, 'joao_pedro').catch(() => {})
  } else if (href === '/contato') {
    fetchRegistros(inicio, fim, 'atanael').catch(() => {})
    fetchRegistros(pI, pF, 'atanael').catch(() => {})
  } else if (href === '/funil') {
    fetchRegistros(inicio, fim).catch(() => {})
  }
  // /historico, /metas, /registrar: sem queries de registros pesadas
}

/**
 * Aquece o cache para todas as páginas principais com o período padrão (30d).
 * Chamado silenciosamente no startup do app — dados prontos antes do primeiro clique.
 */
export function warmupCache(): void {
  const { inicio, fim } = periodoParaDatas('30d')
  const { inicio: pI, fim: pF } = periodoAnteriorDatas('30d')

  // Dispara em background, sem await, sem bloquear nada
  fetchRegistros(inicio, fim).catch(() => {})
  fetchRegistros(pI, pF).catch(() => {})
  fetchRegistros(inicio, fim, 'joao_pedro').catch(() => {})
  fetchRegistros(pI, pF, 'joao_pedro').catch(() => {})
  fetchRegistros(inicio, fim, 'atanael').catch(() => {})
  fetchRegistros(pI, pF, 'atanael').catch(() => {})
}
