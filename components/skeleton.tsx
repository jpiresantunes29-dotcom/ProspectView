import React from 'react'

type SkeletonProps = {
  w?: string | number
  h?: string | number
  style?: React.CSSProperties
}

export function Skeleton({ w = '100%', h = '1rem', style }: SkeletonProps) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width: w, height: h, borderRadius: '4px', ...style }}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <Skeleton h="0.55rem" w="45%" style={{ marginBottom: '0.875rem' }} />
      <Skeleton h="2.4rem" w="50%" />
      <Skeleton h="0.5rem" w="30%" style={{ marginTop: '0.6rem' }} />
      <Skeleton h="2px" w="100%" style={{ marginTop: '1rem' }} />
    </div>
  )
}
