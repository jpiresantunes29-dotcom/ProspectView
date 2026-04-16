'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme, type Theme } from '@/lib/theme'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/funil', label: 'Funil' },
  { href: '/captacao', label: 'Captação' },
  { href: '/contato', label: 'Contato' },
  { href: '/quick-log', label: 'Quick Log' },
  { href: '/metricas-tier', label: 'Métricas TIER' },
  { href: '/diagnostico', label: 'Diagnóstico' },
  { href: '/historico', label: 'Histórico' },
  { href: '/metas', label: 'Metas' },
  { href: '/registrar', label: 'Registrar' },
]

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Claro',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Escuro',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'Sistema',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })
  const [registradoHoje, setRegistradoHoje] = useState({ joao: false, atanael: false })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useLayoutEffect(() => {
    const activeIdx = links.findIndex((l) => l.href === pathname)
    const el = linkRefs.current[activeIdx]
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
    }
  }, [pathname])

  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    supabase.from('registros').select('usuario').eq('data', hoje).then(({ data }) => {
      const usuarios = (data ?? []).map((r: { usuario: string }) => r.usuario)
      setRegistradoHoje({
        joao: usuarios.includes('joao_pedro'),
        atanael: usuarios.includes('atanael'),
      })
    })
  }, [pathname])

  // Fechar drawer com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <nav style={{
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}>
        <div style={{
          maxWidth: '76rem',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          height: '48px',
          gap: '1.5rem',
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0 }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#0078D4',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="6" width="4" height="7" fill="white" opacity="0.95" rx="0.5"/>
                <rect x="5" y="3" width="4" height="10" fill="white" opacity="0.95" rx="0.5"/>
                <rect x="9" y="1" width="4" height="12" fill="white" rx="0.5"/>
              </svg>
            </div>
            <span style={{
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '-0.005em',
              color: 'var(--foreground)',
              userSelect: 'none',
              transition: 'color 0.2s ease',
            }}>
              ProspectView
            </span>
          </div>

          {/* Divisor vertical */}
          <div style={{ width: '1px', height: '18px', background: 'var(--border)', flexShrink: 0 }} />

          {/* Nav links */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, overflowX: 'auto' }}>
            {indicator.ready && (
              <div style={{
                position: 'absolute',
                bottom: '-1px',
                left: indicator.left,
                width: indicator.width,
                height: '2px',
                background: '#0078D4',
                transition: 'left 0.2s ease, width 0.2s ease',
              }} />
            )}

            {links.map((link, i) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => { linkRefs.current[i] = el }}
                  style={{
                    position: 'relative',
                    padding: '0 12px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.7rem',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                    textDecoration: 'none',
                    transition: 'color 0.1s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Status de registro */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
            {[
              { key: 'joao', label: 'JP', done: registradoHoje.joao, color: '#4DA3F7' },
              { key: 'atanael', label: 'AT', done: registradoHoje.atanael, color: '#2DB881' },
            ].map(({ key, label, done, color }) => (
              <div
                key={key}
                title={`${label} — ${done ? 'registrado hoje' : 'sem registro hoje'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 7px',
                  borderRadius: '2px',
                  background: done ? 'var(--subtle-bg)' : 'transparent',
                  border: `1px solid ${done ? 'var(--subtle-border)' : 'var(--border-subtle)'}`,
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: done ? color : 'var(--border)',
                  transition: 'background 0.2s ease',
                }} />
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: done ? 'var(--foreground)' : 'var(--muted-foreground)',
                  opacity: done ? 0.8 : 0.5,
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Botão hamburguer / configurações */}
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Configurações"
            style={{
              background: 'none',
              border: '1px solid transparent',
              cursor: 'pointer',
              padding: '5px 6px',
              borderRadius: '3px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'border-color 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.background = 'none'
            }}
          >
            <span style={{ display: 'block', width: '15px', height: '1.5px', background: 'var(--muted-foreground)', borderRadius: '1px' }} />
            <span style={{ display: 'block', width: '15px', height: '1.5px', background: 'var(--muted-foreground)', borderRadius: '1px' }} />
            <span style={{ display: 'block', width: '15px', height: '1.5px', background: 'var(--muted-foreground)', borderRadius: '1px' }} />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setSettingsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 100,
          opacity: settingsOpen ? 1 : 0,
          pointerEvents: settingsOpen ? 'all' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Settings drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '272px',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          transform: settingsOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: settingsOpen ? '-4px 0 24px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Cabeçalho do drawer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          height: '48px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--foreground)',
          }}>
            Configurações
          </span>
          <button
            onClick={() => setSettingsOpen(false)}
            aria-label="Fechar configurações"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '3px',
              color: 'var(--muted-foreground)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--foreground)'
              e.currentTarget.style.background = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted-foreground)'
              e.currentTarget.style.background = 'none'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>

          {/* Seção: Personalização */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span className="section-label">Personalização</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {themeOptions.map(({ value, label, icon }) => {
              const isActive = theme === value
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    border: `1px solid ${isActive ? '#0078D4' : 'var(--border)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--accent)'
                      e.currentTarget.style.color = 'var(--foreground)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--muted-foreground)'
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {icon}
                  </span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0078D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Rodapé do drawer */}
        <div style={{
          padding: '0.875rem 1.25rem',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>
            ProspectView — v2
          </span>
        </div>
      </div>
    </>
  )
}
