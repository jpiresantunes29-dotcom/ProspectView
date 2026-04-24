'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Evento, Atividade } from '@/lib/supabase'
import { COR_ATIVIDADE } from '@/lib/supabase'
import PageHeader from '@/components/ui/page-header'
import EmptyState from '@/components/ui/empty-state'

function fmtData(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

type FiltroUsuario = 'todos' | 'joao_pedro' | 'atanael'

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

const LABEL_CURTO: Record<string, string> = {
  empresas_encontradas: 'Emp',
  leads_qualificados: 'Qual',
  leads_enviados_crm: 'CRM',
  leads_contatados: 'Cont',
  respostas: 'Resp',
  interessados: 'Inter',
  reunioes_marcadas: 'Reun',
  reunioes_realizadas: 'Reun +',
  oportunidades: 'Opor',
  ligacoes_feitas: 'Lig',
  ligacoes_sucesso: 'Lig +',
  ligacoes_falha: 'Lig -',
  follow_ups: 'FUP',
  negocio_fechado: 'Fechado',
  cold_call: 'Cold',
  whatsapp: 'WA',
  agendamento_reuniao: 'Agend',
  follow_up: 'FUP',
  proposta: 'Prop',
  reuniao_realizada: 'Reun +',
  reuniao_furada: 'Reun -',
}

const TOOLTIP: Record<string, string> = {
  empresas_encontradas: 'Empresas encontradas',
  leads_qualificados: 'Leads qualificados',
  leads_enviados_crm: 'Leads enviados ao CRM',
  leads_contatados: 'Leads contatados',
  respostas: 'Respostas recebidas',
  interessados: 'Leads interessados',
  reunioes_marcadas: 'Reunioes marcadas',
  reunioes_realizadas: 'Reunioes realizadas',
  oportunidades: 'Oportunidades',
  ligacoes_feitas: 'Ligacoes feitas',
  ligacoes_sucesso: 'Ligacoes com sucesso',
  ligacoes_falha: 'Ligacoes sem sucesso',
  follow_ups: 'Follow-ups',
  negocio_fechado: 'Negocio fechado',
  cold_call: 'Cold Call',
  whatsapp: 'WhatsApp',
  agendamento_reuniao: 'Agendamento de reuniao',
  follow_up: 'Follow-up',
  proposta: 'Proposta',
  reuniao_realizada: 'Reuniao realizada',
  reuniao_furada: 'Reuniao furada',
}

export default function HistoricoPage() {
  const [dias, setDias] = useState<DiaResumo[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroUsuario, setFiltroUsuario] = useState<FiltroUsuario>('todos')
  const [ordemInversa, setOrdemInversa] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('eventos').select('*').order('data', { ascending: false }),
      supabase.from('atividades').select('*').order('data', { ascending: false }),
    ]).then(([evRes, atRes]) => {
      const eventos = (evRes.data as Evento[]) ?? []
      const atividades = (atRes.data as Atividade[]) ?? []

      const porEventos = agruparEventos(eventos)
      const porAtividades = agruparAtividades(atividades)

      const mapa = new Map<string, DiaResumo>()
      for (const d of porEventos) mapa.set(`${d.data}::${d.usuario}`, d)
      for (const d of porAtividades) mapa.set(`${d.data}::${d.usuario}`, d)

      setDias(Array.from(mapa.values()))
      setLoading(false)
    })
  }, [])

  const exibidos = dias
    .filter((d) => filtroUsuario === 'todos' || d.usuario === filtroUsuario)
    .slice()
    .sort((a, b) => ordemInversa ? (a.data > b.data ? 1 : -1) : (a.data > b.data ? -1 : 1))

  const filtroLabels: { key: FiltroUsuario; label: string; color: string }[] = [
    { key: 'todos', label: 'Todos', color: 'var(--muted-foreground)' },
    { key: 'joao_pedro', label: 'Joao Pedro', color: '#4DA3F7' },
    { key: 'atanael', label: 'Atanael', color: '#2DB881' },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Auditoria"
        title="Historico"
        subtitle="Resumo diario por usuario e tipo de atividade registrada"
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {filtroLabels.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFiltroUsuario(key)}
            className="uci-btn"
            style={{
              padding: '4px 12px',
              borderColor: filtroUsuario === key ? color : 'var(--border)',
              background: filtroUsuario === key ? `${color}14` : 'transparent',
              color: filtroUsuario === key ? color : 'var(--muted-foreground)',
            }}
          >
            {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button onClick={() => setOrdemInversa((v) => !v)} className="uci-btn uci-btn--secondary">
          {ordemInversa ? 'Antigos' : 'Recentes'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '56px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : exibidos.length === 0 ? (
        <EmptyState
          title="Nenhum registro encontrado"
          description="Nao existem atividades compativeis com o filtro selecionado neste momento."
        />
      ) : (
        <section className="uci-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="section-hdr">
            <p className="section-label">
              Dias encontrados - {exibidos.length} dia{exibidos.length !== 1 ? 's' : ''} com atividade
            </p>
          </div>

          <div className="historico-list">
            {exibidos.map((dia) => {
              const jp = dia.usuario === 'joao_pedro'
              const cor = jp ? '#4DA3F7' : '#2DB881'
              const nome = jp ? 'Joao Pedro' : 'Atanael'
              const tipos = Object.entries(dia.contagens).sort((a, b) => b[1] - a[1])

              return (
                <div key={`${dia.data}::${dia.usuario}`} className="historico-row">
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--muted-foreground)',
                      fontVariantNumeric: 'tabular-nums',
                      flexShrink: 0,
                      minWidth: '90px',
                    }}
                  >
                    {fmtData(dia.data)}
                  </span>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: cor,
                      flexShrink: 0,
                      minWidth: '96px',
                    }}
                  >
                    {nome}
                  </span>

                  <div className="chips" style={{ flex: 1 }}>
                    {tipos.map(([tipo, count]) => {
                      const corChip = jp ? cor : (COR_ATIVIDADE[tipo as keyof typeof COR_ATIVIDADE] ?? cor)
                      const labelCurto = LABEL_CURTO[tipo] ?? tipo
                      const tooltip = TOOLTIP[tipo] ?? tipo

                      return (
                        <span
                          key={tipo}
                          title={tooltip}
                          className="chip"
                          style={{
                            color: corChip,
                            background: `${corChip}14`,
                            border: `1px solid ${corChip}30`,
                            cursor: 'default',
                          }}
                        >
                          <span className="chip-dot" style={{ background: corChip }} />
                          {labelCurto}
                          <span className="chip-count" style={{ color: corChip }}>{count}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
