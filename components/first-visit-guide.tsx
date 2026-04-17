'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'pv-guide-dismissed'

export default function FirstVisitGuide() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {}
  }, [])

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      marginBottom: '2rem',
      padding: '1.25rem 1.5rem',
      background: 'var(--surface)',
      border: '1px solid #2A5A8A',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1.25rem',
    }}>
      {/* Ícone */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '6px',
        background: 'rgba(77,163,247,0.12)', border: '1px solid rgba(77,163,247,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4DA3F7" strokeWidth="1.75">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>
          Como usar o ProspectView
        </p>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { num: '1', title: 'Registre diariamente', desc: 'João Pedro e Atanael registram suas atividades do dia em', link: '/registrar', linkLabel: 'Registrar' },
            { num: '2', title: 'Acompanhe por pessoa', desc: 'Captação mostra as métricas do João Pedro. Contato mostra as do Atanael.', link: null, linkLabel: null },
            { num: '3', title: 'Analise o pipeline', desc: 'Dashboard mostra a visão geral. Funil mostra onde os leads estão sendo perdidos.', link: null, linkLabel: null },
          ].map(({ num, title, desc, link, linkLabel }) => (
            <div key={num} style={{ display: 'flex', gap: '0.75rem', minWidth: '200px', flex: 1 }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'rgba(77,163,247,0.15)', border: '1px solid rgba(77,163,247,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontWeight: 700, color: '#4DA3F7', flexShrink: 0, marginTop: '1px',
              }}>{num}</div>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.2rem' }}>{title}</p>
                <p style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                  {desc}{' '}
                  {link && <Link href={link} style={{ color: '#4DA3F7', textDecoration: 'underline' }}>{linkLabel}</Link>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fechar */}
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted-foreground)', fontSize: '1rem', lineHeight: 1,
          padding: '2px', flexShrink: 0,
        }}
        title="Não mostrar novamente"
      >×</button>
    </div>
  )
}
