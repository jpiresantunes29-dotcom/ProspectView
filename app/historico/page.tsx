'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Evento, Atividade } from '@/lib/supabase'
import { LABEL_ATIVIDADE, COR_ATIVIDADE } from '@/lib/supabase'
import AnimatedTitle from '@/components/animated-title'

const BORDER = '1px solid var(--border)'

function fmtData(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

type FiltroUsuario = 'todos' | 'joao_pedro' | 'atanael'

// Resumo de um dia por usuário, construído a partir de eventos
interface DiaResumo {
  data: string
  usuario: string
  contagens: Record<string, number>
  fonte: 'eventos' | 'atividades'
}

function agruparEventos(eventos: Evento[]): DiaResumo[] {
  const mapa = new Map<string, DiaResumo>()
  for (const ev of eventos) {
    const key = `${ev.data}::${ev.usuario}`
    if (!mapa.has(key)) {
      mapa.set(key, { data: ev.data, usuario: ev.usuario, contagens: {}, fonte: 'eventos' })
    }
    const dia = mapa.get(key)!
    dia.contagens[ev.tipo] = (dia.contagens[ev.tipo] ?? 0) + 1
  }
  return Array.from(mapa.values())
}

function agruparAtividades(atividades: Atividade[]): DiaResumo[] {
  const mapa = new Map<string, DiaResumo>()
  for (const a of atividades) {
    const key = `${a.data}::${a.usuario}`
    if (!mapa.has(key)) {
      mapa.set(key, { data: a.data, usuario: a.usuario, contagens: {}, fonte: 'atividades' })
    }
    const dia = mapa.get(key)!
    dia.contagens[a.tipo_atividade] = (dia.contagens[a.tipo_atividade] ?? 0) + 1
  }
  return Array.from(mapa.values())
}

// Labels curtos para chips
const LABEL_CURTO: Record<string, string> = {
  empresas_encontradas: 'Emp',
  leads_qualificados:   'Qual',
  leads_enviados_crm:   'CRM',
  leads_contatados:     'Cont',
  respostas:            'Resp',
  interessados:         'Inter',
  reunioes_marcadas:    'Reun',
  reunioes_realizadas:  'Reun ✓',
  oportunidades:        'Opor',
  ligacoes_feitas:      'Lig',
  ligacoes_sucesso:     'Lig ✓',
  ligacoes_falha:       'Lig ✗',
  follow_ups:           'FUP',
  negocio_fechado:      'Fechado',
  cold_call:            'Cold',
  whatsapp:             'WA',
  agendamento_reuniao:  'Agend',
  follow_up:            'FUP',
  proposta:             'Prop',
  reuniao_realizada:    'Reun ✓',
  reuniao_furada:       'Reun ✗',
}

const TOOLTIP: Record<string, string> = {
  empresas_encontradas: 'Empresas encontradas',
  leads_qualificados:   'Leads qualificados',
  leads_enviados_crm:   'Leads enviados ao CRM',
  leads_contatados:     'Leads contatados',
  respostas:            'Respostas recebidas',
  interessados:         'Leads interessados',
  reunioes_marcadas:    'Reuniões marcadas',
  reunioes_realizadas:  'Reuniões realizadas',
  oportunidades:        'Oportunidades',
  ligacoes_feitas:      'Ligações feitas',
  ligacoes_sucesso:     'Ligações com sucesso',
  ligacoes_falha:       'Ligações sem sucesso',
  follow_ups:           'Follow-ups',
  negocio_fechado:      'Negócio fechado',
  cold_call:            'Cold Call',
  whatsapp:             'WhatsApp',
  agendamento_reuniao:  'Agendamento de reunião',
  follow_up:            'Follow-up',
  proposta:             'Proposta',
  reuniao_realizada:    'Reunião realizada',
  reuniao_furada:       'Reunião furada',
}

export default function HistoricoPage() {
  const [dias,        setDias]        = useState<DiaResumo[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filtroUsuario, setFiltroUsuario] = useState<FiltroUsuario>('todos')
  const [ordemInversa,  setOrdemInversa]  = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('eventos').select('*').order('data', { ascending: false }),
      supabase.from('atividades').select('*').order('data', { ascending: false }),
    ]).then(([evRes, atRes]) => {
      const eventos   = (evRes.data  as Evento[])   ?? []
      const atividades = (atRes.data as Atividade[]) ?? []

      // Merge: atividades têm prioridade se mesma data+usuario
      const porEventos    = agruparEventos(eventos)
      const porAtividades = agruparAtividades(atividades)

      // Chaves únicas — atividades sobrescrevem eventos se mesma data+usuario
      const mapa = new Map<string, DiaResumo>()
      for (const d of porEventos)    mapa.set(`${d.data}::${d.usuario}`, d)
      for (const d of porAtividades) mapa.set(`${d.data}::${d.usuario}`, d)

      setDias(Array.from(mapa.values()))
      setLoading(false)
    })
  }, [])

  const exibidos = dias
    .filter(d => filtroUsuario === 'todos' || d.usuario === filtroUsuario)
    .slice()
    .sort((a, b) => ordemInversa
      ? (a.data > b.data ? 1 : -1)
      : (a.data > b.data ? -1 : 1)
    )

  const filtroLabels: { key: FiltroUsuario; label: string; color: string }[] = [
    { key: 'todos',      label: 'Todos',      color: 'var(--muted-foreground)' },
    { key: 'joao_pedro', label: 'João Pedro', color: '#4DA3F7' },
    { key: 'atanael',    label: 'Atanael',    color: '#2DB881' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: BORDER }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Todos os registros</p>
        <AnimatedTitle text="Histórico" />
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {filtroLabels.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFiltroUsuario(key)}
            style={{
              padding: '4px 12px',
              fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.03em',
              border: '1px solid', borderRadius: 'var(--radius)', cursor: 'pointer',
              transition: 'all 0.12s', fontFamily: "'Segoe UI', system-ui, sans-serif",
              borderColor: filtroUsuario === key ? color : 'var(--border)',
              background:  filtroUsuario === key ? `${color}14` : 'transparent',
              color:       filtroUsuario === key ? color : 'var(--muted-foreground)',
            }}
          >
            {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setOrdemInversa(v => !v)}
          style={{
            padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600,
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            cursor: 'pointer', background: 'transparent', color: 'var(--muted-foreground)',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          {ordemInversa ? '↑ Antigos' : '↓ Recentes'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: '52px', background: 'var(--surface)', border: BORDER, borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : exibidos.length === 0 ? (
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>Nenhum registro encontrado.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {exibidos.map((dia) => {
            const jp  = dia.usuario === 'joao_pedro'
            const cor = jp ? '#4DA3F7' : '#2DB881'
            const nome = jp ? 'João Pedro' : 'Atanael'
            const tipos = Object.entries(dia.contagens).sort((a, b) => b[1] - a[1])

            return (
              <div
                key={`${dia.data}::${dia.usuario}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.875rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{
                  fontSize: '0.72rem', color: 'var(--muted-foreground)',
                  fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: '72px',
                }}>
                  {fmtData(dia.data)}
                </span>

                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, color: cor,
                  flexShrink: 0, minWidth: '80px',
                }}>
                  {nome}
                </span>

                <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                  {tipos.map(([tipo, count]) => {
                    const corChip = jp ? cor : (COR_ATIVIDADE[tipo as keyof typeof COR_ATIVIDADE] ?? cor)
                    const labelCurto = LABEL_CURTO[tipo] ?? tipo
                    const tooltip    = TOOLTIP[tipo] ?? tipo
                    return (
                      <span key={tipo} title={tooltip} style={{
                        fontSize: '0.65rem', fontWeight: 600,
                        color: corChip,
                        background: `${corChip}14`,
                        border: `1px solid ${corChip}30`,
                        borderRadius: '3px', padding: '2px 7px',
                        fontVariantNumeric: 'tabular-nums',
                        fontFamily: "'Segoe UI', system-ui, sans-serif",
                        cursor: 'default',
                      }}>
                        {labelCurto} {count}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <p style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', marginTop: '0.75rem', opacity: 0.6 }}>
            {exibidos.length} dia{exibidos.length !== 1 ? 's' : ''} com atividade
          </p>
        </div>
      )}
    </div>
  )
}
