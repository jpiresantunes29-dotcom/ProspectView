'use client'

import type { ReactNode } from 'react'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
  filters?: ReactNode
}

export default function PageHeader({ eyebrow, title, subtitle, actions, filters }: Props) {
  return (
    <div
      style={{
        marginBottom: '2rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <p className="section-label" style={{ marginBottom: '0.5rem' }}>
              {eyebrow}
            </p>
          )}
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                marginTop: '0.4rem',
                fontSize: '0.78rem',
                color: 'var(--muted-foreground)',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
      {filters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem' }}>
          {filters}
        </div>
      )}
    </div>
  )
}
