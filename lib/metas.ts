export type Metas = {
  empresas_encontradas: number
  leads_qualificados: number
  leads_enviados_crm: number
  leads_contatados: number
  respostas: number
  interessados: number
  reunioes_marcadas: number
  oportunidades: number
  follow_ups: number
  ligacoes_feitas: number
  ligacoes_sucesso: number
  ligacoes_falha: number
}

const STORAGE_KEY = 'prospectview_metas'

export const defaultMetas: Metas = {
  empresas_encontradas: 10,
  leads_qualificados: 5,
  leads_enviados_crm: 3,
  leads_contatados: 20,
  respostas: 5,
  interessados: 2,
  reunioes_marcadas: 1,
  oportunidades: 1,
  follow_ups: 5,
  ligacoes_feitas: 10,
  ligacoes_sucesso: 3,
  ligacoes_falha: 7,
}

export function getMetas(): Metas {
  if (typeof window === 'undefined') return defaultMetas
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaultMetas, ...JSON.parse(stored) }
  } catch {}
  return defaultMetas
}

export function saveMetas(metas: Metas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metas))
}
