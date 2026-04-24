'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme, type Theme } from '@/lib/theme'
import { getDensity, saveDensity, type Density } from '@/lib/density'
import { prefetchPage } from '@/lib/queryCache'

const mainLinks = [
  {
    section: 'Início',
    items: [
      { href: '/', label: 'Dashboard', icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      )},
    ],
  },
  {
    section: 'Prospecção',
    items: [
      { href: '/captacao', label: 'Captação', icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      )},
    ],
  },
  {
    section: 'Relacionamento',
    items: [
      { href: '/contato', label: 'Contato', icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      )},
      { href: '/historico', label: 'Histórico', icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      )},
    ],
  },
  {
    section: 'Análise',
    items: [
      { href: '/metricas-tier', label: 'Métricas TIER', icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      )},
      { href: '/diagnostico', label: 'Diagnóstico', icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      )},
      { href: '/metas', label: 'Metas', icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      )},
    ],
  },
  {
    section: 'Registros',
    items: [
      { href: '/registrar', label: 'Registrar', icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      )},
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('pv-sidebar-collapsed') === 'true'
  })
  const [registradoHoje, setRegistradoHoje] = useState(() => {
    if (typeof window === 'undefined') return { joao: false, atanael: false }
    const hoje = new Date().toISOString().slice(0, 10)
    const cached = sessionStorage.getItem(`registro-hoje-${hoje}`)
    return cached ? JSON.parse(cached) : { joao: false, atanael: false }
  })
  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window === 'undefined') return 'comfortable'
    return getDensity()
  })

  const changeDensity = (d: Density) => { setDensityState(d); saveDensity(d) }

  useEffect(() => {
    document.documentElement.setAttribute('data-sidebar-collapsed', collapsed ? 'true' : 'false')
    return () => document.documentElement.removeAttribute('data-sidebar-collapsed')
  }, [collapsed])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem('pv-sidebar-collapsed', String(!prev))
      return !prev
    })
  }

  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    const cacheKey = `registro-hoje-${hoje}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) return
    supabase.from('registros').select('usuario').eq('data', hoje).then(({ data }) => {
      const usuarios = (data ?? []).map((r: { usuario: string }) => r.usuario)
      const estado = { joao: usuarios.includes('joao_pedro'), atanael: usuarios.includes('atanael') }
      setRegistradoHoje(estado)
      sessionStorage.setItem(cacheKey, JSON.stringify(estado))
    })
  }, [pathname])

  const sidebarWidth = collapsed ? '48px' : '228px'

  return (
    <aside style={{
      width: sidebarWidth, flexShrink: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 60,
      transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden', height: '100vh',
    }}>

      {/* Logo row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: collapsed ? '0' : '0 8px 0 12px',
        height: 48, flexShrink: 0,
        borderBottom: '1px solid var(--sidebar-border)',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        {!collapsed && (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 2h13l5 5v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#0F2B4C"/>
              <path d="M17 2l5 5h-5V2z" fill="#0078D4"/>
              <path d="M8 17V7h4.5c1.8 0 3 1.1 3 2.8s-1.2 2.8-3 2.8H10v4.4H8z" fill="white"/>
              <path d="M10 9v3.2h2.3c.8 0 1.2-.5 1.2-1.6s-.4-1.6-1.2-1.6H10z" fill="#0F2B4C"/>
            </svg>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E0E0E0', flex: 1, whiteSpace: 'nowrap' }}>
              ProspectView
            </span>
          </>
        )}
        <button
          onClick={toggleCollapsed}
          aria-label="Expandir/recolher menu"
          style={{
            flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
            width: collapsed ? 48 : 36, height: collapsed ? 48 : 36,
            display: 'flex', flexDirection: 'column', gap: 4,
            alignItems: 'center', justifyContent: 'center',
            borderRadius: collapsed ? 0 : 4,
            marginLeft: collapsed ? 0 : 'auto',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: 15, height: 1.5, background: '#8A8A8A', borderRadius: 1 }} />
          ))}
        </button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
        {mainLinks.map(group => (
          <div key={group.section}>
            {!collapsed && (
              <div style={{
                padding: '8px 12px 2px',
                fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#5A5A5A', whiteSpace: 'nowrap',
              }}>
                {group.section}
              </div>
            )}
            {group.items.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: collapsed ? 0 : 10,
                    padding: collapsed ? '0' : '0 12px',
                    height: 32, width: '100%',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive ? 'rgba(0,120,212,0.15)' : 'none',
                    color: isActive ? '#FFFFFF' : '#9E9E9E',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.78rem', textDecoration: 'none',
                    position: 'relative', whiteSpace: 'nowrap',
                    transition: 'background 0.1s, color 0.1s',
                    borderLeft: isActive ? '3px solid #0078D4' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    prefetchPage(link.href)
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'none'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = '#9E9E9E'
                    }
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7, display: 'flex' }}>{link.icon}</span>
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '8px 10px', flexShrink: 0 }}>
        {/* Status JP / AT */}
        <div style={{
          display: 'flex', gap: collapsed ? 4 : 6,
          alignItems: 'center', marginBottom: 6,
          flexDirection: collapsed ? 'column' : 'row',
        }}>
          {[
            { key: 'joao', label: 'JP', done: registradoHoje.joao, color: '#4DA3F7' },
            { key: 'atanael', label: 'AT', done: registradoHoje.atanael, color: '#2DB881' },
          ].map(({ key, label, done, color }) => (
            <div key={key} title={`${label} — ${done ? 'registrado hoje' : 'sem registro hoje'}`} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: collapsed ? '4px' : '3px 7px',
              borderRadius: 3,
              background: 'rgba(255,255,255,0.05)', border: '1px solid #2E2E2E',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: done ? color : '#3D3D3D' }} />
              {!collapsed && (
                <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.06em', color: '#BDBDBD' }}>
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Theme */}
        <div style={{ display: 'flex', gap: 3, flexDirection: collapsed ? 'column' : 'row' }}>
          {(['dark', 'light', 'system'] as Theme[]).map(t => (
            <button key={t} onClick={() => setTheme(t)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '4px 6px',
              background: theme === t ? 'rgba(0,120,212,0.15)' : 'transparent',
              border: `1px solid ${theme === t ? '#0078D4' : 'transparent'}`,
              borderRadius: 4, cursor: 'pointer',
              color: theme === t ? '#4DA3F7' : '#6B6B6B',
              fontSize: '0.6rem', fontWeight: 500, fontFamily: 'inherit',
            }}>
              {t === 'dark' && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
              {t === 'light' && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>}
              {t === 'system' && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
              {!collapsed && <span>{t === 'dark' ? 'Escuro' : t === 'light' ? 'Claro' : 'Auto'}</span>}
            </button>
          ))}
        </div>

        {/* Density */}
        {!collapsed && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {(['comfortable', 'compact'] as Density[]).map(d => (
              <button key={d} onClick={() => changeDensity(d)} style={{
                flex: 1, padding: '4px', background: density === d ? 'rgba(0,120,212,0.15)' : 'transparent',
                border: `1px solid ${density === d ? '#0078D4' : '#2E2E2E'}`,
                borderRadius: 4, cursor: 'pointer',
                color: density === d ? '#4DA3F7' : '#6B6B6B',
                fontSize: '0.58rem', fontWeight: 500, fontFamily: 'inherit',
              }}>
                {d === 'comfortable' ? 'Confortável' : 'Compacta'}
              </button>
            ))}
          </div>
        )}

        {!collapsed && (
          <p style={{ fontSize: '0.55rem', color: '#3D3D3D', marginTop: 8 }}>ProspectView v2</p>
        )}
      </div>
    </aside>
  )
}
