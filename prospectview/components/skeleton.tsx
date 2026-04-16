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
      background: '#0F1A2E',
      border: '1px solid #1A2D45',
      borderRadius: '4px',
      padding: '1.25rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#1A2D45', borderRadius: '4px 0 0 4px' }} />
      <Skeleton h="0.55rem" w="45%" style={{ marginBottom: '0.875rem' }} />
      <Skeleton h="2.8rem" w="50%" />
      <Skeleton h="0.5rem" w="30%" style={{ marginTop: '0.5rem' }} />
    </div>
  )
}
