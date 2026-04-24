'use client'

import type { ReactNode } from 'react'

type Props = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="empty-state">
      {icon && (
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--subtle-bg)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-foreground)',
          }}
        >
          {icon}
        </div>
      )}
      <p
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--foreground)',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {title}
      </p>
      {description && (
        <p
          style={{
            fontSize: '0.74rem',
            color: 'var(--muted-foreground)',
            maxWidth: '380px',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '0.25rem' }}>{action}</div>}
    </div>
  )
}
