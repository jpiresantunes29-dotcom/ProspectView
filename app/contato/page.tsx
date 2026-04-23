'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  type Atividade, LABEL_ATIVIDADE, COR_ATIVIDADE, LABEL_STATUS,
} from '@/lib/supabase'
import AnimatedTitle from '@/components/animated-title'
import Link from 'next/link'

function fmtData(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ContatoPage() {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>Atanael</p>
          <AnimatedTitle text="Contato" />
        </div>
        <Link
          href="/registrar"
          style={{
            padding: '0.6rem 1.25rem',
            background: 'var(--color-contato)',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}
        >
          + Nova atividade
        </Link>
      </div>

      <HistoricoAtividades />
    </div>
  )
}

// ─── Histórico ────────────────────────────────────────────────────────────────

function HistoricoAtividades() {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading,    setLoading]    = useState(true)
  const [confirmId,  setConfirmId]  = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('atividades')
        .select('*')
        .eq('usuario', 'atanael')
        .order('criado_em', { ascending: false })
        .limit(50)
      if (!cancelled && data) setAtividades(data as Atividade[])
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function deletar(id: string) {
    setConfirmId(null)
    setAtividades(prev => prev.filter(a => a.id !== id))
    await supabase.from('atividades').delete().eq('id', id)
  }

  if (loading) return (
    <p style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      Carregando...
    </p>
  )

  if (atividades.length === 0) return (
    <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', letterSpacing: '0.06em' }}>
      Nenhuma atividade registrada.
    </p>
  )

  return (
    <div>
      <p style={{
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--muted-foreground)',
        marginBottom: '1rem',
      }}>
        Histórico — {atividades.length} registro{atividades.length !== 1 ? 's' : ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {atividades.map((a) => {
          const cor    = COR_ATIVIDADE[a.tipo_atividade]
          const isConf = confirmId === a.id
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                background: isConf ? 'rgba(248,113,113,0.06)' : 'var(--surface)',
                border: `1px solid ${isConf ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                borderRadius: '4px',
                transition: 'background 0.12s, border-color 0.12s',
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: cor, flexShrink: 0,
                display: 'inline-block',
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--foreground)', fontWeight: 500, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
                  {LABEL_ATIVIDADE[a.tipo_atividade]}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', marginLeft: '0.4rem' }}>
                  · T{a.tier}
                  {a.tentativa != null && ` · T${a.tentativa}ª`}
                  {a.status_contato && ` · ${LABEL_STATUS[a.status_contato]}`}
                </span>
              </div>

              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtData(a.data)}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtHora(a.criado_em)}
                </div>
              </div>

              {isConf ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                  <button onClick={() => deletar(a.id)} style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, background: '#F87171', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Sim</button>
                  <button onClick={() => setConfirmId(null)} style={{ padding: '2px 8px', fontSize: '0.65rem', background: 'transparent', color: 'var(--muted-foreground)', border: '1px solid var(--border)', borderRadius: '3px', cursor: 'pointer' }}>Não</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(a.id)}
                  title="Excluir"
                  style={{
                    width: 20, height: 20, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--muted-foreground)', fontSize: '0.65rem',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.12s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = '#F87171'; e.currentTarget.style.color = '#F87171' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
