'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme, type Theme } from '@/lib/theme'
import { prefetchPage } from '@/lib/queryCache'
import { getDensity, saveDensity, type Density } from '@/lib/density'

// Links principais — sempre visíveis na navbar (sem scroll)
const mainLinks = [
  { href: '/',          label: 'Dashboard', tip: 'Atividades registradas por Atanael' },
  { href: '/captacao',  label: 'Captação',  tip: 'Métricas de prospecção — João Pedro' },
  { href: '/contato',   label: 'Contato',   tip: 'Registro de atividades — Atanael' },
  { href: '/historico', label: 'Histórico', tip: 'Todos os registros por data' },
]

// Links secundários — ficam no drawer (hamburguer)
const drawerLinks = [
  { href: '/metas', label: 'Metas' },
  { href: '/metricas-tier', label: 'Métricas TIER' },
  { href: '/diagnostico', label: 'Diagnóstico' },
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
  const [density, setDensityState] = useState<Density>('comfortable')

  useEffect(() => { setDensityState(getDensity()) }, [])
  const changeDensity = (d: Density) => { setDensityState(d); saveDensity(d) }

  useLayoutEffect(() => {
    const activeIdx = mainLinks.findIndex((l) => l.href === pathname)
    const el = linkRefs.current[activeIdx]
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
    } else {
      // Se for uma rota secundária, esconde o indicador
      setIndicator({ left: 0, width: 0, ready: false })
    }
  }, [pathname])

  // Verifica registro do dia — só refaz quando muda de página
  // Usa cache em sessionStorage para evitar chamadas repetidas
  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    const cacheKey = `registro-hoje-${hoje}`
    const cached = sessionStorage.getItem(cacheKey)

    if (cached) {
      setRegistradoHoje(JSON.parse(cached))
      return
    }

    supabase.from('registros').select('usuario').eq('data', hoje).then(({ data }) => {
      const usuarios = (data ?? []).map((r: { usuario: string }) => r.usuario)
      const estado = {
        joao: usuarios.includes('joao_pedro'),
        atanael: usuarios.includes('atanael'),
      }
      setRegistradoHoje(estado)
      // Cache por 5 minutos
      sessionStorage.setItem(cacheKey, JSON.stringify(estado))
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

  const isRegistrar = pathname === '/registrar'

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
          gap: '1rem',
        }}>

          {/* Logo — clique recarrega e volta para home */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0, textDecoration: 'none' }}>
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
          </a>

          {/* Divisor vertical */}
          <div style={{ width: '1px', height: '18px', background: 'var(--border)', flexShrink: 0 }} />

          {/* Nav links — sem overflow, fixo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            {indicator.ready && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: indicator.left + 4,
                width: indicator.width - 8,
                height: '26px',
                marginTop: '-13px',
                background: 'rgba(0,120,212,0.14)',
                border: '1px solid rgba(0,120,212,0.35)',
                borderRadius: '13px',
                transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: 'none',
                zIndex: 0,
              }} />
            )}

            {mainLinks.map((link, i) => {
              const isActive = pathname === link.href
              return (
                <div key={link.href} style={{ position: 'relative' }} className="nav-tip-wrap">
                  <Link
                    href={link.href}
                    ref={(el) => { linkRefs.current[i] = el }}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      padding: '0 14px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.7rem',
                      fontWeight: isActive ? 600 : 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: isActive ? '#4DA3F7' : 'var(--muted-foreground)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      prefetchPage(link.href)
                      if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-foreground)'
                    }}
                  >
                    {link.label}
                  </Link>
                  {link.tip && (
                    <div className="nav-tip-box" style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1A1A1A',
                      border: '1px solid #2E2E2E',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      fontSize: '0.65rem',
                      color: '#BDBDBD',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      opacity: 0,
                      transition: 'opacity 0.15s ease',
                      zIndex: 100,
                      fontWeight: 400,
                      letterSpacing: '0.01em',
                      textTransform: 'none',
                    }}>
                      {link.tip}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Botão REGISTRAR — CTA em destaque */}
          <Link
            href="/registrar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '30px',
              background: isRegistrar ? '#106EBE' : '#0078D4',
              color: '#FFFFFF',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'background 0.15s ease, transform 0.1s ease',
              boxShadow: '0 1px 3px rgba(0,120,212,0.3)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#106EBE'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = isRegistrar ? '#106EBE' : '#0078D4'
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Registrar
          </Link>

          {/* Status de registro */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
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
            Menu
          </span>
          <button
            onClick={() => setSettingsOpen(false)}
            aria-label="Fechar menu"
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

          {/* Seção: Páginas */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
              Páginas
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '1.5rem' }}>
            {drawerLinks.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSettingsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 400,
                    textDecoration: 'none',
                    transition: 'background 0.1s ease, color 0.1s ease',
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-foreground)'
                    }
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Divisor */}
          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.25rem' }} />

          {/* Seção: Personalização */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
              Personalização
            </span>
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

          {/* Divisor */}
          <div style={{ height: '1px', background: 'var(--border)', margin: '1.25rem 0' }} />

          {/* Densidade */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
              Densidade
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['comfortable', 'compact'] as Density[]).map((d) => {
              const active = density === d
              return (
                <button
                  key={d}
                  onClick={() => changeDensity(d)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.5rem',
                    background: active ? 'var(--accent)' : 'transparent',
                    border: `1px solid ${active ? '#0078D4' : 'var(--border)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontSize: '0.72rem',
                    fontWeight: active ? 600 : 400,
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
                >
                  {d === 'comfortable' ? 'Confortável' : 'Compacta'}
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
