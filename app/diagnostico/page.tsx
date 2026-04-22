'use client'

import { useState, useEffect } from 'react'
import { supabase, LABEL_EVENTO, COR_EVENTO, type TipoEvento, type Evento } from '@/lib/supabase'
import type { Registro } from '@/lib/supabase'
import { somarRegistros, gerarDiagnostico, type Totais, type NivelDesempenho, TOTAIS_ZERO } from '@/lib/metrics'
import { getMetas, type Metas } from '@/lib/metas'

type Usuario = 'joao_pedro' | 'atanael'

function dataHoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function horaFormatada(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const NIVEL_COR: Record<NivelDesempenho, string> = {
  excepcional: '#34D399',
  otimo:       '#60A5FA',
  bom:         '#FBBF24',
  moderado:    '#F97316',
  fraco:       '#F87171',
}

const NIVEL_LABEL: Record<NivelDesempenho, string> = {
  excepcional: 'Excepcional',
  otimo:       'Ótimo',
  bom:         'Bom',
  moderado:    'Moderado',
  fraco:       'Fraco',
}

type MetricaCardProps = {
  label: string
  hoje: number
  meta: number
  media: number
  cor: string
}

function MetricaDia({ label, hoje, meta, media, cor }: MetricaCardProps) {
  const pctMeta  = meta  > 0 ? Math.min((hoje / meta)  * 100, 200) : 0
  const pctMedia = media > 0 ? Math.min((hoje / media) * 100, 200) : 0

  return (
    <div style={{
      padding: '1rem',
      background: '#0E0E0E',
      border: '1px solid #1A1A1A',
      borderRadius: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.68rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: cor, fontWeight: 500 }}>
          {hoje}
        </span>
      </div>

      {/* Barra vs Meta */}
      <div style={{ marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#4B5563', marginBottom: '3px' }}>
          <span>Meta: {meta}</span>
          <span>{meta > 0 ? `${Math.round(pctMeta)}%` : '—'}</span>
        </div>
        <div style={{ height: '4px', background: '#1F1F1F', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(pctMeta, 100)}%`,
            background: pctMeta >= 100 ? '#34D399' : cor,
            borderRadius: '2px',
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* Barra vs Média */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#4B5563', marginBottom: '3px' }}>
          <span>Média: {media.toFixed(1)}</span>
          <span>{media > 0 ? `${Math.round(pctMedia)}%` : '—'}</span>
        </div>
        <div style={{ height: '4px', background: '#1F1F1F', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(pctMedia, 100)}%`,
            background: pctMedia >= 100 ? '#60A5FA' : '#374151',
            borderRadius: '2px',
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>
    </div>
  )
}

export default function DiagnosticoPage() {
  const [usuario, setUsuario] = useState<Usuario>('joao_pedro')
  const [totaisHoje, setTotaisHoje] = useState<Totais>(TOTAIS_ZERO)
  const [historico, setHistorico] = useState<Registro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [metas, setMetas] = useState<Metas | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setMetas(getMetas())
  }, [])

  useEffect(() => {
    carregarDados()
  }, [usuario])

  async function carregarDados() {
    setCarregando(true)
    const hoje = dataHoje()

    const [regHoje, regHist, evHoje] = await Promise.all([
      supabase.from('registros').select('*').eq('data', hoje).eq('usuario', usuario).single(),
      supabase.from('registros').select('*').eq('usuario', usuario).neq('data', hoje).order('data', { ascending: false }).limit(60),
      supabase.from('eventos').select('*').eq('data', hoje).eq('usuario', usuario).order('criado_em', { ascending: false }),
    ])

    if (regHoje.data) {
      setTotaisHoje(somarRegistros([regHoje.data as Registro]))
    } else {
      setTotaisHoje(TOTAIS_ZERO)
    }

    setHistorico((regHist.data as Registro[]) ?? [])
    setEventos((evHoje.data as Evento[]) ?? [])
    setCarregando(false)
  }

  if (!metas) return null

  const metasTotais: Totais = {
    ...TOTAIS_ZERO,
    ...metas,
  }

  const diagnostico = gerarDiagnostico(totaisHoje, historico, metasTotais, eventos, usuario)

  const corNivel = NIVEL_COR[diagnostico.nivel]

  // Calcular média histórica por campo
  function mediaHistorica(campo: keyof Totais): number {
    if (historico.length === 0) return 0
    const soma = historico.reduce((s, r) => s + ((r as unknown as Record<string, number>)[campo] ?? 0), 0)
    return soma / historico.length
  }

  const camposJP: { tipo: TipoEvento; cor: string }[] = [
    { tipo: 'empresas_encontradas', cor: '#60A5FA' },
    { tipo: 'leads_qualificados',   cor: '#34D399' },
    { tipo: 'leads_enviados_crm',   cor: '#2DD4BF' },
  ]

  const camposAT: { tipo: TipoEvento; cor: string }[] = [
    { tipo: 'leads_contatados',  cor: '#FBBF24' },
    { tipo: 'respostas',         cor: '#F59E0B' },
    { tipo: 'interessados',      cor: '#F472B6' },
    { tipo: 'reunioes_marcadas', cor: '#E879F9' },
    { tipo: 'oportunidades',     cor: '#A78BFA' },
    { tipo: 'ligacoes_feitas',   cor: '#60A5FA' },
    { tipo: 'ligacoes_sucesso',  cor: '#34D399' },
    { tipo: 'ligacoes_falha',    cor: '#F87171' },
    { tipo: 'follow_ups',        cor: '#94A3B8' },
  ]

  const campos = usuario === 'joao_pedro' ? camposJP : camposAT

  const maxHora = diagnostico.horasPico.length > 0
    ? Math.max(...diagnostico.horasPico.map((h) => h.total))
    : 1

  // Taxa de sucesso nas ligações
  const taxaSucesso = totaisHoje.ligacoes_feitas > 0
    ? Math.round((totaisHoje.ligacoes_sucesso / totaisHoje.ligacoes_feitas) * 100)
    : null

  return (
    <div style={{ maxWidth: '640px', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1F1F1F' }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Diagnóstico diário</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: '#FAFAF9',
          margin: 0,
        }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h1>
      </div>

      {/* Seletor */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['joao_pedro', 'atanael'] as Usuario[]).map((u) => (
          <button
            key={u}
            onClick={() => setUsuario(u)}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              border: '1px solid',
              borderColor: usuario === u ? (u === 'joao_pedro' ? '#60A5FA' : '#34D399') : '#2A2A2A',
              background: usuario === u ? (u === 'joao_pedro' ? '#0F2030' : '#0A2A1A') : 'transparent',
              color: usuario === u ? (u === 'joao_pedro' ? '#60A5FA' : '#34D399') : '#6B7280',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {u === 'joao_pedro' ? 'João Pedro' : 'Atanael'}
          </button>
        ))}
      </div>

      {carregando ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: '80px', background: '#1A1A1A', borderRadius: '10px', opacity: 0.6 }} />
          ))}
        </div>
      ) : (
        <>
          {/* Card de diagnóstico interpretativo */}
          <div style={{
            padding: '1.5rem',
            background: '#0E0E0E',
            border: `1px solid ${corNivel}30`,
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: `0 0 32px ${corNivel}12`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                padding: '0.25rem 0.6rem',
                background: corNivel + '20',
                border: `1px solid ${corNivel}40`,
                borderRadius: '4px',
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: corNivel,
              }}>
                {NIVEL_LABEL[diagnostico.nivel]}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#4B5563' }}>
                {historico.length} dias de histórico
              </div>
            </div>

            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 500,
              color: '#FAFAF9',
              lineHeight: 1.3,
              margin: 0,
            }}>
              {diagnostico.texto}
            </p>

            {/* Indicadores rápidos */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              {diagnostico.percentualVsMeta !== null && (
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    vs Meta
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    color: diagnostico.percentualVsMeta >= 100 ? '#34D399' : '#F87171',
                    fontWeight: 500,
                  }}>
                    {diagnostico.percentualVsMeta}%
                  </div>
                </div>
              )}
              {diagnostico.percentualVsMedia !== null && (
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    vs Média
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    color: diagnostico.percentualVsMedia >= 100 ? '#60A5FA' : '#F97316',
                    fontWeight: 500,
                  }}>
                    {diagnostico.percentualVsMedia}%
                  </div>
                </div>
              )}
              {diagnostico.totalEventos > 0 && (
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Ações via Quick Log
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#94A3B8', fontWeight: 500 }}>
                    {diagnostico.totalEventos}
                  </div>
                </div>
              )}
              {taxaSucesso !== null && totaisHoje.ligacoes_feitas > 0 && (
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Taxa sucesso ligações
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    color: taxaSucesso >= 30 ? '#34D399' : '#F97316',
                    fontWeight: 500,
                  }}>
                    {taxaSucesso}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Métricas do dia */}
          <div style={{ marginBottom: '2rem' }}>
            <p className="section-label" style={{ marginBottom: '1rem' }}>Métricas do dia</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem' }}>
              {campos.map(({ tipo, cor }) => (
                <MetricaDia
                  key={tipo}
                  label={LABEL_EVENTO[tipo]}
                  hoje={totaisHoje[tipo as keyof Totais]}
                  meta={metasTotais[tipo as keyof Totais]}
                  media={mediaHistorica(tipo as keyof Totais)}
                  cor={cor}
                />
              ))}
            </div>
          </div>

          {/* Pico de atividade */}
          {diagnostico.horasPico.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p className="section-label" style={{ marginBottom: '1rem' }}>
                Atividade por hora — via Quick Log
              </p>
              <div style={{
                padding: '1rem 1.25rem',
                background: '#0E0E0E',
                border: '1px solid #1A1A1A',
                borderRadius: '10px',
              }}>
                {diagnostico.horasPico.map(({ hora, label, total }) => {
                  const isPeak = total === maxHora && total > 0
                  const pct = maxHora > 0 ? (total / maxHora) * 100 : 0
                  return (
                    <div key={hora} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.68rem', color: '#6B7280', width: '28px', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {label}
                      </span>
                      <div style={{ flex: 1, height: '20px', background: '#1A1A1A', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: isPeak ? '#FBBF24' : '#2A2A2A',
                          borderRadius: '4px',
                          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '6px',
                        }}>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isPeak ? '#FBBF24' : '#6B7280', width: '20px', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {total}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Motivos de falha */}
          {diagnostico.motivosFalha.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p className="section-label" style={{ marginBottom: '1rem' }}>
                Motivos das ligações sem sucesso
              </p>
              <div style={{
                padding: '1rem 1.25rem',
                background: '#0E0E0E',
                border: '1px solid #1A1A1A',
                borderRadius: '10px',
              }}>
                {diagnostico.motivosFalha.map(({ motivo, count }, i) => (
                  <div key={motivo} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: i < diagnostico.motivosFalha.length - 1 ? '1px solid #131313' : 'none',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#FAFAF9' }}>{motivo}</span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', color: '#F87171', fontWeight: 500 }}>
                      {count}×
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline de eventos */}
          {eventos.length > 0 && (
            <div>
              <p className="section-label" style={{ marginBottom: '1rem' }}>Timeline de hoje</p>
              <div style={{
                padding: '1rem 1.25rem',
                background: '#0E0E0E',
                border: '1px solid #1A1A1A',
                borderRadius: '10px',
              }}>
                {eventos.map((ev, i) => (
                  <div key={ev.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    borderBottom: i < eventos.length - 1 ? '1px solid #131313' : 'none',
                  }}>
                    <span style={{ fontSize: '0.65rem', color: '#4B5563', width: '36px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {horaFormatada(ev.criado_em)}
                    </span>
                    <div style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: COR_EVENTO[ev.tipo] ?? '#6B7280',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.78rem', color: '#FAFAF9', flex: 1 }}>
                      {LABEL_EVENTO[ev.tipo]}
                    </span>
                    {ev.motivo_falha && (
                      <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>{ev.motivo_falha}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {eventos.length === 0 && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: '#0E0E0E',
              border: '1px solid #1A1A1A',
              borderRadius: '10px',
              color: '#2A2A2A',
            }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Nenhum evento registrado via Quick Log hoje.
              </p>
              <p style={{ fontSize: '0.7rem', color: '#374151', marginTop: '0.5rem' }}>
                Use o Quick Log ao longo do dia para ver a timeline aqui.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
