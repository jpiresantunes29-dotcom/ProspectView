'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Evento, Registro } from '@/lib/supabase'
import {
  agruparLigacoesPorTier,
  agruparNegociosPorTier,
  somarRegistros,
  pct,
  LABEL_SEQUENCIA,
  type SequenciaLigacao,
} from '@/lib/metrics'
import FiltroPeriodo, { periodoParaDatas } from '@/components/filtro-periodo'
import type { Periodo } from '@/components/filtro-periodo'
import PageHeader from '@/components/ui/page-header'
import EmptyState from '@/components/ui/empty-state'
import DrillDownPanel, { type DrillRow } from '@/components/dashboard/drill-down-panel'

const SEQUENCIAS: SequenciaLigacao[] = ['cold1', 'cold2', 'cold3', 'fup']
const TIERS = [1, 2, 3, 4] as const
const TIER_CORES: Record<1 | 2 | 3 | 4, string> = {
  1: '#34D399',
  2: '#60A5FA',
  3: '#FBBF24',
  4: '#94A3B8',
}

function heatmapBg(taxa: string): string {
  const pctNum = parseInt(taxa)
  if (isNaN(pctNum)) return 'transparent'
  if (pctNum <= 50) return `rgba(209,52,56,${((50 - pctNum) / 50) * 0.18})`
  return `rgba(52,211,153,${((pctNum - 50) / 50) * 0.18})`
}

type DrillContext =
  | { kind: 'cell'; tier: 1 | 2 | 3 | 4; seq: SequenciaLigacao }
  | { kind: 'negocio'; tier: 1 | 2 | 3 | 4 }

export default function MetricasTierPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [eventos, setEventos] = useState<Evento[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [drill, setDrill] = useState<DrillContext | null>(null)

  useEffect(() => {
    carregarDados()

  }, [periodo])

  async function carregarDados() {
    setLoading(true)
    const { inicio, fim } = periodoParaDatas(periodo)
    const [evRes, regRes] = await Promise.all([
      supabase.from('eventos').select('*').gte('data', inicio).lte('data', fim).eq('usuario', 'atanael')
        .in('tipo', ['ligacoes_feitas', 'ligacoes_sucesso', 'ligacoes_falha', 'negocio_fechado']),
      supabase.from('registros').select('*').gte('data', inicio).lte('data', fim).eq('usuario', 'atanael'),
    ])
    setEventos((evRes.data as Evento[]) ?? [])
    setRegistros((regRes.data as Registro[]) ?? [])
    setLoading(false)
  }

  const matrix = agruparLigacoesPorTier(eventos)
  const negociosPorTier = agruparNegociosPorTier(eventos)
  const totais = somarRegistros(registros)
  const totalNegociosFechados = Object.values(negociosPorTier).reduce((a, b) => a + b, 0)

  function totalLinhaTier(tier: 1 | 2 | 3 | 4) {
    return SEQUENCIAS.reduce((sum, s) => sum + matrix[tier][s].total, 0)
  }
  function totalLinhaSuccesso(tier: 1 | 2 | 3 | 4) {
    return SEQUENCIAS.reduce((sum, s) => sum + matrix[tier][s].sucesso, 0)
  }
  function totalColunaSeq(seq: SequenciaLigacao) {
    return TIERS.reduce((sum, t) => sum + matrix[t][seq].total, 0)
  }

  const grandTotal = TIERS.reduce((sum, t) => sum + totalLinhaTier(t), 0)
  const grandSucesso = TIERS.reduce((sum, t) => sum + totalLinhaSuccesso(t), 0)
  const grandTaxa = grandTotal > 0 ? `${Math.round((grandSucesso / grandTotal) * 100)}%` : '—'

  const drillRows: DrillRow[] = useMemo(() => {
    if (!drill) return []
    if (drill.kind === 'cell') {
      return eventos
        .filter((e) => e.tier === drill.tier && e.sequencia_ligacao === drill.seq
          && (e.tipo === 'ligacoes_feitas' || e.tipo === 'ligacoes_sucesso' || e.tipo === 'ligacoes_falha'))
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
        .map((e) => ({
          data: e.data.slice(5),
          hora: new Date(e.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          label: e.tipo === 'ligacoes_sucesso' ? 'Ligação com sucesso' : e.tipo === 'ligacoes_falha' ? 'Ligação sem sucesso' : 'Ligação realizada',
          detail: e.motivo_falha ?? undefined,
          color: e.tipo === 'ligacoes_sucesso' ? '#2DB881' : e.tipo === 'ligacoes_falha' ? '#D13438' : '#8A8A8A',
        }))
    }
    return eventos
      .filter((e) => e.tipo === 'negocio_fechado' && e.tier === drill.tier)
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
      .map((e) => ({
        data: e.data.slice(5),
        hora: new Date(e.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        label: 'Negócio fechado',
        color: TIER_CORES[drill.tier],
        detail: `TIER ${drill.tier}`,
      }))
  }, [drill, eventos])

  const drillTitle = drill
    ? drill.kind === 'cell'
      ? `T${drill.tier} · ${LABEL_SEQUENCIA[drill.seq]}`
      : `Negócios fechados · T${drill.tier}`
    : ''

  return (
    <div style={{ maxWidth: '900px' }}>
      <PageHeader
        eyebrow="Análise por classificação"
        title="Métricas TIER"
        subtitle="Ligações, reuniões e negócios agregados por tier"
        actions={<FiltroPeriodo value={periodo} onChange={setPeriodo} />}
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[180, 120, 80].map((h, i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: `${h}px`, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : grandTotal === 0 && totalNegociosFechados === 0 && totais.reunioes_marcadas === 0 ? (
        <EmptyState
          title="Nenhum dado TIER no período"
          description="Registre ligações com TIER pela página Registrar para ver a análise aqui."
        />
      ) : (
        <>
          {/* SEÇÃO 1: Matriz */}
          <section className="uci-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <p className="section-label" style={{ marginBottom: '1rem' }}>Ligações por TIER × tipo de contato</p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th style={thStyle()}>TIER</th>
                    {SEQUENCIAS.map((s) => (
                      <th key={s} style={thStyle()}>{LABEL_SEQUENCIA[s]}</th>
                    ))}
                    <th style={thStyle(true)}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((tier) => {
                    const linhaTotal = totalLinhaTier(tier)
                    const linhaSucesso = totalLinhaSuccesso(tier)
                    const linhaTaxa = linhaTotal > 0 ? `${Math.round((linhaSucesso / linhaTotal) * 100)}%` : '—'
                    const cor = TIER_CORES[tier]
                    return (
                      <tr key={tier}>
                        <td style={tdStyle()}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '6px',
                            background: cor + '15', border: `1px solid ${cor}40`,
                            color: cor, fontSize: '0.75rem', fontWeight: 700,
                          }}>
                            T{tier}
                          </span>
                        </td>
                        {SEQUENCIAS.map((s) => {
                          const cell = matrix[tier][s]
                          const bg = cell.total > 0 ? heatmapBg(cell.taxa) : 'transparent'
                          const clickable = cell.total > 0
                          return (
                            <td
                              key={s}
                              onClick={clickable ? () => setDrill({ kind: 'cell', tier, seq: s }) : undefined}
                              style={{
                                ...tdStyle(),
                                background: bg,
                                cursor: clickable ? 'pointer' : 'default',
                                transition: 'background 0.15s ease',
                              }}
                              title={clickable ? `${cell.total} ligações · ${cell.taxa} eficiência — clique para detalhes` : undefined}
                            >
                              {cell.total > 0 ? (
                                <div>
                                  <div style={{ fontSize: '1.1rem', color: 'var(--foreground)', fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                                    {cell.total}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: cell.taxa !== '—' ? cor : 'var(--muted-foreground)', marginTop: '2px' }}>
                                    {cell.taxa} efic.
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>—</span>
                              )}
                            </td>
                          )
                        })}
                        <td style={tdStyle(true)}>
                          <div style={{ fontSize: '1.1rem', color: linhaTotal > 0 ? cor : 'var(--muted-foreground)', fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                            {linhaTotal}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                            {linhaTaxa}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ ...tdStyle(), color: 'var(--muted-foreground)', fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Total
                    </td>
                    {SEQUENCIAS.map((s) => {
                      const colTotal = totalColunaSeq(s)
                      return (
                        <td key={s} style={tdStyle()}>
                          <span style={{ fontSize: '0.9rem', color: colTotal > 0 ? 'var(--foreground)' : 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                            {colTotal || '—'}
                          </span>
                        </td>
                      )
                    })}
                    <td style={tdStyle(true)}>
                      <div style={{ fontSize: '1.1rem', color: grandTotal > 0 ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                        {grandTotal}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                        {grandTaxa}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SEÇÃO 2: Reuniões */}
          <section style={{ marginBottom: '2rem' }}>
            <p className="section-label" style={{ marginBottom: '1rem' }}>Reuniões</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <MetricBox label="Marcadas" value={totais.reunioes_marcadas} cor="#E879F9" />
              <MetricBox label="Realizadas" value={totais.reunioes_realizadas} cor="#7C3AED" />
              <MetricBox label="Conversão" value={pct(totais.reunioes_realizadas, totais.reunioes_marcadas)} cor="#A78BFA" isText />
            </div>
          </section>

          {/* SEÇÃO 3: Negócios */}
          <section style={{ marginBottom: '2rem' }}>
            <p className="section-label" style={{ marginBottom: '1rem' }}>
              Negócios fechados
              {totalNegociosFechados > 0 && (
                <span style={{ marginLeft: '0.75rem', color: 'var(--accent-success-fg)', fontWeight: 700 }}>
                  {totalNegociosFechados} total
                </span>
              )}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {TIERS.map((tier) => {
                const count = negociosPorTier[tier]
                const cor = TIER_CORES[tier]
                const clickable = count > 0
                return (
                  <div
                    key={tier}
                    onClick={clickable ? () => setDrill({ kind: 'negocio', tier }) : undefined}
                    className={clickable ? 'uci-card uci-card--clickable' : 'uci-card'}
                    style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      borderColor: count > 0 ? cor + '50' : undefined,
                    }}
                  >
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: cor + '15', border: `1px solid ${cor}40`,
                      color: cor, fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem',
                    }}>
                      T{tier}
                    </div>
                    <div style={{
                      fontSize: '2rem', fontWeight: 600,
                      color: count > 0 ? 'var(--accent-success-fg)' : 'var(--muted-foreground)',
                      lineHeight: 1, marginBottom: '0.35rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>
                      negócio{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              Dados de ligações e negócios baseados em eventos com TIER registrado via Quick Log.
            </p>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {TIERS.map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: TIER_CORES[t] }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                    T{t}:{' '}
                    {t === 1 && '50-1k func., não MS/Google'}
                    {t === 2 && '50-1k func., MS ou Google'}
                    {t === 3 && '>1k funcionários'}
                    {t === 4 && 'Skymail/Revenda ou <50 func.'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <DrillDownPanel
        open={drill !== null}
        onClose={() => setDrill(null)}
        title={drillTitle}
        subtitle={`Período: ${periodo} · Atanael`}
        total={drillRows.length}
        rows={drillRows}
      />
    </div>
  )
}

function thStyle(highlight?: boolean): React.CSSProperties {
  return {
    padding: '0.6rem 1rem',
    fontSize: '0.62rem',
    color: 'var(--muted-foreground)',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    background: highlight ? 'var(--muted)' : 'transparent',
    whiteSpace: 'nowrap',
  }
}

function tdStyle(highlight?: boolean): React.CSSProperties {
  return {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-subtle)',
    verticalAlign: 'middle',
    background: highlight ? 'var(--muted)' : 'transparent',
  }
}

function MetricBox({ label, value, cor, isText }: { label: string; value: number | string; cor: string; isText?: boolean }) {
  const hasValue = typeof value === 'number' ? value > 0 : value !== '—'
  return (
    <div className="uci-card" style={{ padding: '1.25rem', borderColor: hasValue ? cor + '40' : undefined }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{
        fontSize: isText ? '1.5rem' : '2rem',
        fontWeight: 600,
        color: hasValue ? cor : 'var(--muted-foreground)',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  )
}
