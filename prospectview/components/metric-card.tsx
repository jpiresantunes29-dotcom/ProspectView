'use client'

import { useCountUp } from './count-up'

type ColorToken = 'captacao' | 'contato' | 'taxa' | 'resultado' | 'produtividade' | 'default'

const colorMap: Record<ColorToken, string> = {
  captacao:      '#4DA3F7',
  contato:       '#2DB881',
  taxa:          '#F0A830',
  resultado:     '#9B72CF',
  produtividade: '#8A8A8A',
  default:       '#8A8A8A',
}

type Props = {
  label: string
  value: string | number
  sub?: string
  color?: ColorToken
  prev?: number
  meta?: number
  dias?: number
}

export default function MetricCard({ label, value, sub, color = 'default', prev, meta, dias }: Props) {
  const numericValue = typeof value === 'number' ? value : NaN
  const animated = useCountUp(isNaN(numericValue) ? 0 : numericValue)
  const displayValue = typeof value === 'number' ? animated : value

  let delta: number | null = null
  let deltaSign: 'up' | 'down' | 'neutral' = 'neutral'
  if (typeof prev === 'number' && !isNaN(numericValue)) {
    delta = prev === 0
      ? (numericValue > 0 ? 100 : 0)
      : Math.round(((numericValue - prev) / prev) * 100)
    deltaSign = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'
  }

  let metaTotal: number | null = null
  let metaPct: number | null = null
  if (typeof meta === 'number' && typeof dias === 'number' && !isNaN(numericValue)) {
    metaTotal = meta * dias
    metaPct = metaTotal > 0 ? Math.round((numericValue / metaTotal) * 100) : 0
  }

  const accentColor = colorMap[color]

  return (
    <div
      className="metric-card"
      style={{ '--card-accent': accentColor } as React.CSSProperties}
    >
      {/* Label com dot colorido */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.875rem' }}>
        <div style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: accentColor,
          flexShrink: 0,
          opacity: 0.9,
        }} />
        <p style={{
          fontSize: '0.62rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#9E9E9E',
        }}>
          {label}
        </p>
      </div>

      {/* Número principal — branco, sem cor saturada */}
      <p className="metric-number">
        {displayValue}
      </p>

      {/* Sub-texto */}
      {sub && (
        <p style={{
          fontSize: '0.7rem',
          color: '#6B6B6B',
          marginTop: '0.4rem',
          fontWeight: 400,
        }}>
          {sub}
        </p>
      )}

      {/* Delta vs período anterior */}
      {delta !== null && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: '0.6rem',
          padding: '2px 6px',
          borderRadius: '2px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: deltaSign === 'up' ? '#2DB881' : deltaSign === 'down' ? '#D13438' : '#8A8A8A',
          }}>
            {deltaSign === 'up' ? '+' : ''}{delta}%
          </span>
          <span style={{ fontSize: '0.6rem', color: '#6B6B6B', fontWeight: 400 }}>
            vs ant.
          </span>
        </div>
      )}

      {/* Progresso vs meta */}
      {metaTotal !== null && metaPct !== null && (
        <div style={{ marginTop: '0.875rem' }}>
          <div style={{
            height: '2px',
            background: '#3D3D3D',
            borderRadius: '1px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(metaPct, 100)}%`,
              background: accentColor,
              borderRadius: '1px',
              transition: 'width 0.7s ease',
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.3rem',
          }}>
            <span style={{ fontSize: '0.6rem', color: '#6B6B6B', fontWeight: 400 }}>
              {numericValue} / {metaTotal}
            </span>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 600,
              color: metaPct >= 100 ? '#2DB881' : '#9E9E9E',
            }}>
              {metaPct}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
