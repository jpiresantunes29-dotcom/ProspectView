'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'pv-guide-dismissed-v3'

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
      marginBottom: '1.5rem',
      padding: '1rem 1.25rem',
      background: 'var(--surface)',
      border: '1px solid rgba(0,120,212,0.4)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '6px',
        background: 'rgba(0,120,212,0.12)', border: '1px solid rgba(0,120,212,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4DA3F7" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
          Bem-vindo ao ProspectView
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
          Este painel mostra a visão consolidada de João Pedro (captação) e Atanael (contato comercial) no período selecionado.
        </p>
        <div className="fvg-steps">
          <Step num="1" title="Registre" desc={
            <>
              JP e AT registram suas ações em <Link href="/registrar" style={{ color: '#4DA3F7', textDecoration: 'none', fontWeight: 600 }}>Registrar</Link>.
            </>
          } />
          <Step num="2" title="Acompanhe" desc={
            <>
              Métricas detalhadas em <Link href="/captacao" style={{ color: '#4DA3F7', textDecoration: 'none', fontWeight: 600 }}>Captação</Link> (JP) e <Link href="/contato" style={{ color: '#2DB881', textDecoration: 'none', fontWeight: 600 }}>Contato</Link> (AT).
            </>
          } />
          <Step num="3" title="Audite" desc={
            <>
              Revise tudo em <Link href="/historico" style={{ color: '#FBBF24', textDecoration: 'none', fontWeight: 600 }}>Histórico</Link>. Para análise por tier, veja <Link href="/metricas-tier" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>Métricas TIER</Link>.
            </>
          } />
        </div>
      </div>

      <button
        onClick={dismiss}
        aria-label="Fechar guia"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted-foreground)', fontSize: '1.1rem', lineHeight: 1,
          padding: '4px 8px', flexShrink: 0,
        }}
        title="Não mostrar novamente"
      >×</button>

      <style jsx>{`
        .fvg-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .fvg-steps { grid-template-columns: 1fr; gap: 0.5rem; }
        }
      `}</style>
    </div>
  )
}

function Step({ num, title, desc }: { num: string; title: string; desc: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: 'rgba(0,120,212,0.18)', border: '1px solid rgba(0,120,212,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.62rem', fontWeight: 700, color: '#4DA3F7', flexShrink: 0, marginTop: '1px',
      }}>{num}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '2px' }}>{title}</p>
        <p style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  )
}
