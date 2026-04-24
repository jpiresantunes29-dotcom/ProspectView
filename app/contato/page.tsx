'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  type Atividade,
  LABEL_ATIVIDADE,
  COR_ATIVIDADE,
  LABEL_STATUS,
} from '@/lib/supabase'
import PageHeader from '@/components/ui/page-header'
import EmptyState from '@/components/ui/empty-state'

function fmtData(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ContatoPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Atanael"
        title="Contato"
        subtitle="Registro recente de atividades comerciais e acompanhamento do dia"
        actions={
          <Link href="/registrar" className="uci-btn uci-btn--primary">
            + Nova atividade
          </Link>
        }
      />

      <HistoricoAtividades />
    </div>
  )
}

function HistoricoAtividades() {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)

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
    setAtividades((prev) => prev.filter((a) => a.id !== id))
    await supabase.from('atividades').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer" style={{ height: '58px', borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    )
  }

  if (atividades.length === 0) {
    return (
      <EmptyState
        title="Nenhuma atividade registrada"
        description="As atividades do Atanael vao aparecer aqui assim que forem registradas pela tela de Registrar."
        action={<Link href="/registrar" className="uci-btn uci-btn--primary">Registrar atividade</Link>}
      />
    )
  }

  return (
    <section className="uci-card" style={{ padding: '1.25rem 1.5rem' }}>
      <div className="section-hdr">
        <p className="section-label">
          Historico recente - {atividades.length} registro{atividades.length !== 1 ? 's' : ''}
        </p>
        <Link href="/historico" className="section-link section-link--green">
          Ver auditoria completa →
        </Link>
      </div>

      <div className="atividade-list">
        {atividades.map((a) => {
          const cor = COR_ATIVIDADE[a.tipo_atividade]
          const isConf = confirmId === a.id

          return (
            <div
              key={a.id}
              className="atividade-row"
              style={{
                background: isConf ? 'rgba(248,113,113,0.06)' : 'var(--surface)',
                border: `1px solid ${isConf ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                transition: 'background 0.12s, border-color 0.12s',
              }}
            >
              <span className="atividade-tipo-dot" style={{ background: cor }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="atividade-label">{LABEL_ATIVIDADE[a.tipo_atividade]}</p>
                <p className="atividade-detail">
                  T{a.tier}
                  {a.tentativa != null && ` · ${a.tentativa}a tentativa`}
                  {a.status_contato && ` · ${LABEL_STATUS[a.status_contato]}`}
                </p>
              </div>

              <div className="atividade-meta">
                <div>{fmtData(a.data)}</div>
                <div style={{ fontSize: '0.62rem', opacity: 0.7 }}>{fmtHora(a.criado_em)}</div>
              </div>

              {isConf ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                  <button
                    onClick={() => deletar(a.id)}
                    className="uci-btn"
                    style={{ padding: '4px 10px', background: '#F87171', color: '#fff' }}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="uci-btn uci-btn--secondary"
                    style={{ padding: '4px 10px' }}
                  >
                    Nao
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(a.id)}
                  title="Excluir"
                  className="uci-btn uci-btn--ghost"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '999px',
                    padding: 0,
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  x
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
