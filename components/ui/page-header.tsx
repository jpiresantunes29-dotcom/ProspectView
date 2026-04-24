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
    <div className="page-header">
      <div className="page-header-row">
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <p className="section-label" style={{ marginBottom: '0.5rem' }}>
              {eyebrow}
            </p>
          )}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
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
