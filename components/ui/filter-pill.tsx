'use client'

type Props = {
  label: string
  value: string
  onClear?: () => void
}

export default function FilterPill({ label, value, onClear }: Props) {
  return (
    <span className="filter-pill">
      <span style={{ color: 'var(--muted-foreground)' }}>{label}:</span>
      <strong style={{ fontWeight: 600 }}>{value}</strong>
      {onClear && (
        <button
          onClick={onClear}
          aria-label={`Remover filtro ${label}`}
          style={{
            marginLeft: '2px',
            background: 'none',
            border: 'none',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  )
}
