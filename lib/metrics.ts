import type { Registro, Evento, TipoEvento } from './supabase'

export type Totais = {
  empresas_encontradas: number
  leads_qualificados: number
  leads_enviados_crm: number
  leads_contatados: number
  respostas: number
  interessados: number
  reunioes_marcadas: number
  reunioes_realizadas: number
  oportunidades: number
  follow_ups: number
  ligacoes_feitas: number
  ligacoes_sucesso: number
  ligacoes_falha: number
}

export const TOTAIS_ZERO: Totais = {
  empresas_encontradas: 0,
  leads_qualificados: 0,
  leads_enviados_crm: 0,
  leads_contatados: 0,
  respostas: 0,
  interessados: 0,
  reunioes_marcadas: 0,
  reunioes_realizadas: 0,
  oportunidades: 0,
  follow_ups: 0,
  ligacoes_feitas: 0,
  ligacoes_sucesso: 0,
  ligacoes_falha: 0,
}

export function somarRegistros(registros: Registro[]): Totais {
  return registros.reduce(
    (acc, r) => ({
      empresas_encontradas: acc.empresas_encontradas + (r.empresas_encontradas ?? 0),
      leads_qualificados:   acc.leads_qualificados   + (r.leads_qualificados   ?? 0),
      leads_enviados_crm:   acc.leads_enviados_crm   + (r.leads_enviados_crm   ?? 0),
      leads_contatados:     acc.leads_contatados     + (r.leads_contatados     ?? 0),
      respostas:            acc.respostas            + (r.respostas            ?? 0),
      interessados:         acc.interessados         + (r.interessados         ?? 0),
      reunioes_marcadas:    acc.reunioes_marcadas    + (r.reunioes_marcadas    ?? 0),
      reunioes_realizadas:  acc.reunioes_realizadas  + (r.reunioes_realizadas  ?? 0),
      oportunidades:        acc.oportunidades        + (r.oportunidades        ?? 0),
      follow_ups:           acc.follow_ups           + (r.follow_ups           ?? 0),
      ligacoes_feitas:      acc.ligacoes_feitas      + (r.ligacoes_feitas      ?? 0),
      ligacoes_sucesso:     acc.ligacoes_sucesso     + (r.ligacoes_sucesso     ?? 0),
      ligacoes_falha:       acc.ligacoes_falha       + (r.ligacoes_falha       ?? 0),
    }),
    {
      empresas_encontradas: 0, leads_qualificados: 0, leads_enviados_crm: 0,
      leads_contatados: 0, respostas: 0, interessados: 0, reunioes_marcadas: 0, reunioes_realizadas: 0,
      oportunidades: 0, follow_ups: 0, ligacoes_feitas: 0, ligacoes_sucesso: 0, ligacoes_falha: 0,
    }
  )
}

export function pct(num: number, den: number): string {
  if (!den || den === 0) return '—'
  return `${Math.round((num / den) * 100)}%`
}

export function diasUteis(inicio: Date, fim: Date): number {
  let count = 0
  const d = new Date(inicio)
  while (d <= fim) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return Math.max(count, 1)
}

export function porDia(valor: number, dias: number): string {
  if (!dias) return '—'
  return Math.round(valor / dias).toString()
}

export type FunilEtapa = {
  label: string
  valor: number
  taxa?: string
}

export function buildFunil(t: Totais): FunilEtapa[] {
  return [
    { label: 'Empresas Encontradas', valor: t.empresas_encontradas },
    { label: 'Leads Qualificados',   valor: t.leads_qualificados,   taxa: pct(t.leads_qualificados, t.empresas_encontradas) },
    { label: 'Enviados ao CRM',      valor: t.leads_enviados_crm,   taxa: pct(t.leads_enviados_crm, t.leads_qualificados) },
    { label: 'Leads Contatados',     valor: t.leads_contatados,     taxa: pct(t.leads_contatados, t.leads_enviados_crm) },
    { label: 'Respostas',            valor: t.respostas,            taxa: pct(t.respostas, t.leads_contatados) },
    { label: 'Interessados',         valor: t.interessados,         taxa: pct(t.interessados, t.respostas) },
    { label: 'Reunioes Marcadas',    valor: t.reunioes_marcadas,    taxa: pct(t.reunioes_marcadas, t.interessados) },
    { label: 'Oportunidades',        valor: t.oportunidades,        taxa: pct(t.oportunidades, t.reunioes_marcadas) },
  ]
}

export type AtividadePorHora = { hora: number; label: string; total: number }

export function atividadePorHora(eventos: Evento[]): AtividadePorHora[] {
  const contagem: Record<number, number> = {}
  for (const ev of eventos) {
    const hora = new Date(ev.criado_em).getHours()
    contagem[hora] = (contagem[hora] ?? 0) + 1
  }
  return Object.entries(contagem)
    .map(([h, total]) => ({
      hora: parseInt(h),
      label: h.padStart(2, '0') + 'h',
      total,
    }))
    .sort((a, b) => a.hora - b.hora)
}

export function contarEventosPorTipo(eventos: Evento[]): Partial<Record<TipoEvento, number>> {
  const resultado: Partial<Record<TipoEvento, number>> = {}
  for (const ev of eventos) {
    resultado[ev.tipo] = (resultado[ev.tipo] ?? 0) + 1
  }
  return resultado
}

export type SequenciaLigacao = 'cold1' | 'cold2' | 'cold3' | 'fup'

export const LABEL_SEQUENCIA: Record<SequenciaLigacao, string> = {
  cold1: '1ª Cold Call',
  cold2: '2ª Cold Call',
  cold3: '3ª Cold Call',
  fup:   'Follow-up',
}

export type CellStats = {
  total: number
  sucesso: number
  falha: number
  taxa: string
}

export type TierMatrix = Record<1 | 2 | 3 | 4, Record<SequenciaLigacao, CellStats>>

function cellZero(): CellStats {
  return { total: 0, sucesso: 0, falha: 0, taxa: '—' }
}

export function agruparLigacoesPorTier(eventos: Evento[]): TierMatrix {
  const tiers = [1, 2, 3, 4] as const
  const seqs: SequenciaLigacao[] = ['cold1', 'cold2', 'cold3', 'fup']

  const matrix = Object.fromEntries(
    tiers.map((t) => [t, Object.fromEntries(seqs.map((s) => [s, cellZero()]))])
  ) as TierMatrix

  for (const ev of eventos) {
    if (!ev.tier || !ev.sequencia_ligacao) continue
    const tier = ev.tier as 1 | 2 | 3 | 4
    const seq = ev.sequencia_ligacao as SequenciaLigacao
    if (!matrix[tier]?.[seq]) continue

    const cell = matrix[tier][seq]
    if (ev.tipo === 'ligacoes_feitas' || ev.tipo === 'ligacoes_sucesso' || ev.tipo === 'ligacoes_falha') {
      cell.total++
    }
    if (ev.tipo === 'ligacoes_sucesso') cell.sucesso++
    if (ev.tipo === 'ligacoes_falha')   cell.falha++
  }

  // calculate taxa for each cell
  for (const t of tiers) {
    for (const s of seqs) {
      const cell = matrix[t][s]
      const den = cell.sucesso + cell.falha
      cell.taxa = den > 0 ? `${Math.round((cell.sucesso / den) * 100)}%` : '—'
    }
  }

  return matrix
}

export function agruparNegociosPorTier(eventos: Evento[]): Record<1 | 2 | 3 | 4, number> {
  const result = { 1: 0, 2: 0, 3: 0, 4: 0 }
  for (const ev of eventos) {
    if (ev.tipo === 'negocio_fechado' && ev.tier) {
      result[ev.tier as 1 | 2 | 3 | 4]++
    }
  }
  return result
}

export function motivosFalha(eventos: Evento[]): { motivo: string; count: number }[] {
  const falhas = eventos.filter((e) => e.tipo === 'ligacoes_falha' && e.motivo_falha)
  const contagem: Record<string, number> = {}
  for (const ev of falhas) {
    const m = ev.motivo_falha!
    contagem[m] = (contagem[m] ?? 0) + 1
  }
  return Object.entries(contagem)
    .map(([motivo, count]) => ({ motivo, count }))
    .sort((a, b) => b.count - a.count)
}

export type NivelDesempenho = 'excepcional' | 'otimo' | 'bom' | 'moderado' | 'fraco'

export type Diagnostico = {
  nivel: NivelDesempenho
  texto: string
  percentualVsMedia: number | null
  percentualVsMeta: number | null
  horasPico: AtividadePorHora[]
  motivosFalha: { motivo: string; count: number }[]
  totalEventos: number
}

function mediaDiaria(registros: Registro[], campo: keyof Totais): number {
  if (registros.length === 0) return 0
  const soma = registros.reduce((s, r) => s + ((r as unknown as Record<string, number>)[campo] ?? 0), 0)
  return soma / registros.length
}

function scoreVsMedia(hoje: Totais, historico: Registro[], usuario: 'joao_pedro' | 'atanael'): number | null {
  const camposJP: (keyof Totais)[] = ['empresas_encontradas', 'leads_qualificados', 'leads_enviados_crm']
  const camposAT: (keyof Totais)[] = ['leads_contatados', 'respostas', 'interessados', 'reunioes_marcadas', 'oportunidades', 'ligacoes_feitas', 'follow_ups']
  const campos = usuario === 'joao_pedro' ? camposJP : camposAT
  let somaPct = 0
  let count = 0
  for (const campo of campos) {
    const media = mediaDiaria(historico, campo)
    if (media > 0) {
      somaPct += (hoje[campo] / media) * 100
      count++
    }
  }
  if (count === 0) return null
  return Math.round(somaPct / count)
}

function scoreVsMeta(hoje: Totais, metas: Totais, usuario: 'joao_pedro' | 'atanael'): number | null {
  const camposJP: (keyof Totais)[] = ['empresas_encontradas', 'leads_qualificados', 'leads_enviados_crm']
  const camposAT: (keyof Totais)[] = ['leads_contatados', 'respostas', 'interessados', 'reunioes_marcadas', 'oportunidades']
  const campos = usuario === 'joao_pedro' ? camposJP : camposAT
  let somaPct = 0
  let count = 0
  for (const campo of campos) {
    const meta = metas[campo]
    if (meta > 0) {
      somaPct += Math.min((hoje[campo] / meta) * 100, 200)
      count++
    }
  }
  if (count === 0) return null
  return Math.round(somaPct / count)
}

function textoDesempenho(
  nivel: NivelDesempenho,
  pctMedia: number | null,
  pctMeta: number | null,
  usuario: 'joao_pedro' | 'atanael'
): string {
  const nome = usuario === 'joao_pedro' ? 'de prospeccao' : 'de contato'
  if (pctMedia === null && pctMeta === null) return 'Primeiros registros do dia — continue assim!'
  if (nivel === 'excepcional') {
    const diff = pctMedia ? Math.round(pctMedia - 100) : null
    return diff ? `Dia excepcional ${nome} — ${diff}% acima da média` : `Dia excepcional ${nome}!`
  }
  if (nivel === 'otimo') {
    const diff = pctMedia ? Math.round(pctMedia - 100) : null
    return diff ? `Ótimo dia ${nome} — ${diff}% acima da média` : `Ótimo dia ${nome}!`
  }
  if (nivel === 'bom') return `Dia sólido ${nome} — performance dentro do esperado`
  if (nivel === 'moderado') {
    const diff = pctMedia ? Math.round(100 - pctMedia) : null
    return diff ? `Dia moderado — ${diff}% abaixo da média` : 'Dia moderado — abaixo da média'
  }
  if (pctMeta !== null && pctMeta < 40)
    return `Dia fraco em ${usuario === 'joao_pedro' ? 'qualificação' : 'contato'} — reforce o foco`
  return 'Dia abaixo da média — ajuste o ritmo no período da tarde'
}

export function gerarDiagnostico(
  hoje: Totais,
  historico: Registro[],
  metas: Totais,
  eventos: Evento[],
  usuario: 'joao_pedro' | 'atanael'
): Diagnostico {
  const pctMedia = scoreVsMedia(hoje, historico, usuario)
  const pctMeta  = scoreVsMeta(hoje, metas, usuario)
  let nivel: NivelDesempenho
  const score = pctMedia ?? pctMeta ?? 0
  if (score >= 130)      nivel = 'excepcional'
  else if (score >= 110) nivel = 'otimo'
  else if (score >= 85)  nivel = 'bom'
  else if (score >= 60)  nivel = 'moderado'
  else                   nivel = 'fraco'
  return {
    nivel,
    texto: textoDesempenho(nivel, pctMedia, pctMeta, usuario),
    percentualVsMedia: pctMedia,
    percentualVsMeta: pctMeta,
    horasPico: atividadePorHora(eventos),
    motivosFalha: motivosFalha(eventos),
    totalEventos: eventos.length,
  }
}
