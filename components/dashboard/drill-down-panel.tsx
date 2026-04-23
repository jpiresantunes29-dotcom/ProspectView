'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

export type DrillRow = {
  data: string
  hora?: string
  label: string
  detail?: string
  color?: string
  value?: number | string
}

type Props = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  total?: number | string
  rows: DrillRow[]
  footer?: ReactNode
}

export default function DrillDownPanel({ open, onClose, title, subtitle, total, rows, footer }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--overlay-bg)',
          zIndex: 200,
          animation: 'pageFadeIn 0.15s ease-out',
        }}
      />
      <div
        className="drill-panel"
        role="dialog"
        aria-label={title}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 100vw)',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p className="section-label" style={{ marginBottom: '0.25rem' }}>Drill-down</p>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--foreground)',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              lineHeight: 1.25,
            }}>{title}</h3>
            {subtitle && (
              <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted-foreground)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {total !== undefined && (
          <div style={{
            padding: '0.875rem 1.25rem',
            background: 'var(--muted)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
          }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Total
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>
              {total}
            </span>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {rows.length === 0 ? (
            <div style={{
              padding: '3rem 1.25rem',
              textAlign: 'center',
              color: 'var(--muted-foreground)',
              fontSize: '0.78rem',
            }}>
              Nenhum registro detalhado para este filtro.
            </div>
          ) : (
            rows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                }}
              >
                {row.color && (
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: row.color,
                    flexShrink: 0,
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.78rem',
                    color: 'var(--foreground)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {row.label}
                  </p>
                  {row.detail && (
                    <p style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                      {row.detail}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                    {row.data}{row.hora ? ` · ${row.hora}` : ''}
                  </p>
                  {row.value !== undefined && (
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--foreground)', marginTop: '2px' }}>
                      {row.value}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {footer && (
          <div style={{
            padding: '0.875rem 1.25rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}>
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
