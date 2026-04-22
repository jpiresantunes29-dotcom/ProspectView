'use client'

import { useState, useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  message: string
  type: ToastType
  action?: { label: string; onClick: () => void }
}

type ToastOptions = {
  type?: ToastType
  duration?: number
  action?: { label: string; onClick: () => void }
}

let listeners: ((toasts: Toast[]) => void)[] = []
let currentToasts: Toast[] = []

function notify() {
  const copy = [...currentToasts]
  listeners.forEach(l => l(copy))
}

export function showToast(message: string, options: ToastOptions = {}): string {
  const id = crypto.randomUUID()
  currentToasts = [...currentToasts, { id, message, type: options.type ?? 'success', action: options.action }]
  notify()
  setTimeout(() => dismissToast(id), options.duration ?? 3500)
  return id
}

export function dismissToast(id: string) {
  currentToasts = currentToasts.filter(t => t.id !== id)
  notify()
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (t: Toast[]) => setToasts(t)
    listeners.push(listener)
    return () => { listeners = listeners.filter(l => l !== listener) }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => {
        const borderColor = toast.type === 'error'
          ? 'rgba(209,52,56,0.5)'
          : toast.type === 'success'
          ? 'rgba(45,184,129,0.5)'
          : 'var(--border)'
        const dotColor = toast.type === 'error' ? '#D13438' : toast.type === 'success' ? '#2DB881' : 'var(--muted-foreground)'
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--surface-elevated)',
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              minWidth: '240px', maxWidth: '360px',
              animation: 'toastSlideIn 0.2s ease',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
            <span style={{
              flex: 1, fontSize: '0.8rem', color: 'var(--foreground)',
              fontFamily: "'Segoe UI', system-ui, sans-serif", lineHeight: 1.4,
            }}>
              {toast.message}
            </span>
            {toast.action && (
              <button
                onClick={() => { toast.action!.onClick(); dismissToast(toast.id) }}
                style={{
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
                  color: 'var(--primary)', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, flexShrink: 0,
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                width: '16px', height: '16px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none',
                color: 'var(--muted-foreground)', fontSize: '0.7rem',
                cursor: 'pointer', flexShrink: 0, padding: 0,
              }}
            >×</button>
          </div>
        )
      })}
    </div>
  )
}
