import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Registro = {
  id: string
  data: string
  usuario: 'joao_pedro' | 'atanael'
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
  created_at: string
}

export type Evento = {
  id: string
  data: string
  usuario: 'joao_pedro' | 'atanael'
  tipo: TipoEvento
  criado_em: string
  motivo_falha: string | null
  tier: number | null
  sequencia_ligacao: 'cold1' | 'cold2' | 'cold3' | 'fup' | null
}

export type TipoEvento =
  | 'empresas_encontradas'
  | 'leads_qualificados'
  | 'leads_enviados_crm'
  | 'leads_contatados'
  | 'respostas'
  | 'interessados'
  | 'reunioes_marcadas'
  | 'oportunidades'
  | 'follow_ups'
  | 'ligacoes_feitas'
  | 'ligacoes_sucesso'
  | 'ligacoes_falha'
  | 'reunioes_realizadas'
  | 'negocio_fechado'

export const LABEL_EVENTO: Record<TipoEvento, string> = {
  empresas_encontradas: 'Empresa encontrada',
  leads_qualificados:   'Lead qualificado',
  leads_enviados_crm:   'Lead enviado ao CRM',
  leads_contatados:     'Lead contatado',
  respostas:            'Resposta recebida',
  interessados:         'Lead interessado',
  reunioes_marcadas:    'Reunião marcada',
  oportunidades:        'Oportunidade gerada',
  follow_ups:           'Follow-up realizado',
  ligacoes_feitas:      'Ligação feita',
  ligacoes_sucesso:     'Ligação com sucesso',
  ligacoes_falha:       'Ligação sem sucesso',
  reunioes_realizadas:  'Reunião realizada',
  negocio_fechado:      'Negócio fechado',
}

export const COR_EVENTO: Record<TipoEvento, string> = {
  empresas_encontradas: '#60A5FA',
  leads_qualificados:   '#34D399',
  leads_enviados_crm:   '#2DD4BF',
  leads_contatados:     '#FBBF24',
  respostas:            '#F59E0B',
  interessados:         '#F472B6',
  reunioes_marcadas:    '#E879F9',
  oportunidades:        '#A78BFA',
  follow_ups:           '#94A3B8',
  ligacoes_feitas:      '#60A5FA',
  ligacoes_sucesso:     '#34D399',
  ligacoes_falha:       '#F87171',
  reunioes_realizadas:  '#7C3AED',
  negocio_fechado:      '#059669',
}
