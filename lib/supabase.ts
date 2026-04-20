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

// ─── Atividades (novo modelo — página Contato) ────────────────────────────────

export type TipoAtividade =
  | 'cold_call'
  | 'whatsapp'
  | 'agendamento_reuniao'
  | 'follow_up'
  | 'proposta'
  | 'negocio_fechado'
  | 'reuniao_realizada'
  | 'reuniao_furada'

export type StatusContato =
  | 'atendeu_normal'
  | 'atendeu_ocupado'
  | 'nao_atendeu'

export type Atividade = {
  id: string
  data: string
  usuario: string
  tier: number
  tipo_atividade: TipoAtividade
  status_contato: StatusContato | null
  tentativa: number | null
  criado_em: string
}

export const LABEL_ATIVIDADE: Record<TipoAtividade, string> = {
  cold_call:           'Cold Call',
  whatsapp:            'Mensagem WhatsApp',
  agendamento_reuniao: 'Agendamento de Reunião',
  follow_up:           'Follow-up Comercial',
  proposta:            'Emissão de Proposta',
  negocio_fechado:     'Fechamento de Negócio',
  reuniao_realizada:   'Reunião Realizada',
  reuniao_furada:      'Reunião Furada',
}

export const COR_ATIVIDADE: Record<TipoAtividade, string> = {
  cold_call:           '#4DA3F7',
  whatsapp:            '#25D366',
  agendamento_reuniao: '#FBBF24',
  follow_up:           '#A78BFA',
  proposta:            '#F472B6',
  negocio_fechado:     '#34D399',
  reuniao_realizada:   '#2DD4BF',
  reuniao_furada:      '#F87171',
}

export const LABEL_STATUS: Record<StatusContato, string> = {
  atendeu_normal:  'Atendeu — conversa normal',
  atendeu_ocupado: 'Atendeu — não podia falar',
  nao_atendeu:     'Não atendeu',
}
