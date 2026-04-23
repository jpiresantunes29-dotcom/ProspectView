'use client'

import type { ReactNode } from 'react'

type Item = {
  icon: ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  variant?: 'default' | 'primary'
}

type Props = {
  items: Item[]
}

export default function CommandBar({ items }: Props) {
  return (
    <div className="command-bar" role="toolbar">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={item.onClick}
          aria-pressed={item.active}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            background: item.active
              ? 'rgba(0,120,212,0.12)'
              : item.variant === 'primary'
              ? 'var(--accent-primary)'
              : 'transparent',
            color: item.active
              ? '#4DA3F7'
              : item.variant === 'primary'
              ? '#fff'
              : 'var(--foreground)',
            border: `1px solid ${item.active ? '#0078D4' : 'transparent'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.7rem',
            fontWeight: 600,
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            cursor: 'pointer',
            transition: 'all 0.12s ease',
          }}
          onMouseEnter={(e) => {
            if (!item.active && item.variant !== 'primary') {
              e.currentTarget.style.background = 'var(--accent)'
            }
          }}
          onMouseLeave={(e) => {
            if (!item.active && item.variant !== 'primary') {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
