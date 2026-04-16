'use client'

import { useState, useEffect } from 'react'
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

const SEQUENCIAS: SequenciaLigacao[] = ['cold1', 'cold2', 'cold3', 'fup']
const TIERS = [1, 2, 3, 4] as const
const TIER_CORES: Record<1 | 2 | 3 | 4, string> = {
  1: '#34D399',
  2: '#60A5FA',
  3: '#FBBF24',
  4: '#94A3B8',
}

export default function MetricasTierPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [eventos, setEventos] = useState<Evento[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [periodo])

  async function carregarDados() {
    setLoading(true)
    const { inicio, fim } = periodoParaDatas(periodo)

    const [evRes, regRes] = await Promise.all([
      supabase
        .from('eventos')
        .select('*')
        .gte('data', inicio)
        .lte('data', fim)
        .eq('usuario', 'atanael')
        .in('tipo', ['ligacoes_feitas', 'ligacoes_sucesso', 'ligacoes_falha', 'negocio_fechado']),
      supabase
        .from('registros')
        .select('*')
        .gte('data', inicio)
        .lte('data', fim)
        .eq('usuario', 'atanael'),
    ])

    setEventos((evRes.data as Evento[]) ?? [])
    setRegistros((regRes.data as Registro[]) ?? [])
    setLoading(false)
  }

  const matrix = agruparLigacoesPorTier(eventos)
  const negociosPorTier = agruparNegociosPorTier(eventos)
  const totais = somarRegistros(registros)
  const totalNegociosFechados = Object.values(negociosPorTier).reduce((a, b) => a + b, 0)

  // Totais por coluna (sequência) e por linha (tier)
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

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1F1F1F', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>Análise por classificação</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#FAFAF9',
            margin: 0,
          }}>
            Métricas TIER
          </h1>
        </div>
        <FiltroPeriodo value={periodo} onChange={setPeriodo} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[180, 120, 80].map((h, i) => (
            <div key={i} style={{ height: `${h}px`, background: '#111111', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <>
          {/* ── SEÇÃO 1: Matriz de Ligações ── */}
          <section style={{ marginBottom: '3rem' }}>
            <p className="section-label" style={{ marginBottom: '1.25rem' }}>Ligações por TIER e tipo de contato</p>

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
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: cor + '15',
                            border: `1px solid ${cor}40`,
                            color: cor,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}>
                            T{tier}
                          </span>
                        </td>
                        {SEQUENCIAS.map((s) => {
                          const cell = matrix[tier][s]
                          return (
                            <td key={s} style={tdStyle()}>
                              {cell.total > 0 ? (
                                <div>
                                  <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: '#FAFAF9', fontWeight: 500, lineHeight: 1 }}>
                                    {cell.total}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: cell.taxa !== '—' ? cor : '#4B5563', marginTop: '2px' }}>
                                    {cell.taxa} efic.
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: '#2A2A2A', fontSize: '0.8rem' }}>—</span>
                              )}
                            </td>
                          )
                        })}
                        <td style={tdStyle(true)}>
                          <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: linhaTotal > 0 ? cor : '#3A3A3A', fontWeight: 500, lineHeight: 1 }}>
                            {linhaTotal}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '2px' }}>
                            {linhaTaxa}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {/* Linha de totais por coluna */}
                  <tr style={{ borderTop: '1px solid #2A2A2A' }}>
                    <td style={{ ...tdStyle(), color: '#9CA3AF', fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Total
                    </td>
                    {SEQUENCIAS.map((s) => {
                      const colTotal = totalColunaSeq(s)
                      return (
                        <td key={s} style={tdStyle()}>
                          <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', color: colTotal > 0 ? '#FAFAF9' : '#3A3A3A' }}>
                            {colTotal || '—'}
                          </span>
                        </td>
                      )
                    })}
                    <td style={tdStyle(true)}>
                      <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: grandTotal > 0 ? '#FAFAF9' : '#3A3A3A', fontWeight: 600, lineHeight: 1 }}>
                        {grandTotal}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '2px' }}>
                        {grandTaxa}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {grandTotal === 0 && (
              <p style={{ textAlign: 'center', color: '#3A3A3A', fontSize: '0.75rem', marginTop: '2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Nenhuma ligação com TIER registrada no período
              </p>
            )}
          </section>

          {/* ── SEÇÃO 2: Reuniões Marcadas vs Realizadas ── */}
          <section style={{ marginBottom: '3rem' }}>
            <p className="section-label" style={{ marginBottom: '1.25rem' }}>Reuniões</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <MetricBox
                label="Marcadas"
                value={totais.reunioes_marcadas}
                cor="#E879F9"
              />
              <MetricBox
                label="Realizadas"
                value={totais.reunioes_realizadas}
                cor="#7C3AED"
              />
              <MetricBox
                label="Conversão"
                value={pct(totais.reunioes_realizadas, totais.reunioes_marcadas)}
                cor="#A78BFA"
                isText
              />
            </div>
          </section>

          {/* ── SEÇÃO 3: Negócios Fechados por TIER ── */}
          <section style={{ marginBottom: '3rem' }}>
            <p className="section-label" style={{ marginBottom: '1.25rem' }}>
              Negócios fechados
              {totalNegociosFechados > 0 && (
                <span style={{ marginLeft: '0.75rem', color: '#059669', fontWeight: 700 }}>
                  {totalNegociosFechados} total
                </span>
              )}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {TIERS.map((tier) => {
                const count = negociosPorTier[tier]
                const cor = TIER_CORES[tier]
                return (
                  <div key={tier} style={{
                    padding: '1.25rem 1rem',
                    background: '#111111',
                    border: `1px solid ${count > 0 ? cor + '30' : '#1F1F1F'}`,
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: count > 0 ? `0 0 20px ${cor}10` : 'none',
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: cor + '15',
                      border: `1px solid ${cor}40`,
                      color: cor,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                    }}>
                      T{tier}
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      color: count > 0 ? '#059669' : '#3A3A3A',
                      lineHeight: 1,
                      marginBottom: '0.35rem',
                    }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#6B7280', letterSpacing: '0.04em' }}>
                      negócio{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Rodapé informativo ── */}
          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #131313' }}>
            <p style={{ fontSize: '0.68rem', color: '#4B5563', lineHeight: 1.6 }}>
              Dados de ligações e negócios baseados em eventos com TIER registrado via Quick Log.
              Reuniões calculadas a partir dos registros diários.
            </p>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {TIERS.map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: TIER_CORES[t] }} />
                  <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

function thStyle(highlight?: boolean): React.CSSProperties {
  return {
    padding: '0.6rem 1rem',
    fontSize: '0.62rem',
    color: '#6B7280',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    textAlign: 'left',
    borderBottom: '1px solid #1F1F1F',
    background: highlight ? '#0D0D0D' : 'transparent',
    whiteSpace: 'nowrap',
  }
}

function tdStyle(highlight?: boolean): React.CSSProperties {
  return {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #131313',
    verticalAlign: 'middle',
    background: highlight ? '#0D0D0D' : 'transparent',
  }
}

function MetricBox({ label, value, cor, isText }: { label: string; value: number | string; cor: string; isText?: boolean }) {
  return (
    <div style={{
      padding: '1.25rem',
      background: '#111111',
      border: `1px solid ${(typeof value === 'number' ? value > 0 : value !== '—') ? cor + '30' : '#1F1F1F'}`,
      borderRadius: '12px',
    }}>
      <div style={{ fontSize: '0.62rem', color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{
        fontSize: isText ? '1.5rem' : '2rem',
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        color: (typeof value === 'number' ? value > 0 : value !== '—') ? cor : '#3A3A3A',
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  )
}
