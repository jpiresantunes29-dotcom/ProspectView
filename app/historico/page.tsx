'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Registro } from '@/lib/supabase'
import AnimatedTitle from '@/components/animated-title'

const BORDER = '1px solid var(--border)'

function fmtData(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

type Chip = { label: string; value: number; color: string }

function chipsJP(r: Registro): Chip[] {
  return [
    { label: 'Emp',   value: r.empresas_encontradas, color: '#4DA3F7' },
    { label: 'Qual',  value: r.leads_qualificados,   color: '#4DA3F7' },
    { label: 'CRM',   value: r.leads_enviados_crm,   color: '#4DA3F7' },
  ]
}

function chipsAT(r: Registro): Chip[] {
  return [
    { label: 'Cont',  value: r.leads_contatados,  color: '#2DB881' },
    { label: 'Resp',  value: r.respostas,          color: '#2DB881' },
    { label: 'Reun',  value: r.reunioes_marcadas,  color: '#2DB881' },
  ]
}

export default function HistoricoPage() {
  const [registros, setRegistros]   = useState<Registro[]>([])
  const [loading, setLoading]       = useState(true)
  const [confirmId, setConfirmId]   = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('registros')
      .select('*')
      .order('data', { ascending: false })
      .then(({ data }) => {
        setRegistros((data as Registro[]) ?? [])
        setLoading(false)
      })
  }, [])

  async function excluir(id: string) {
    setConfirmId(null)
    setRegistros(prev => prev.filter(r => r.id !== id))
    await supabase.from('registros').delete().eq('id', id)
  }

  const isJP = (r: Registro) => r.usuario === 'joao_pedro'

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: BORDER }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Todos os registros</p>
        <AnimatedTitle text="Histórico" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: '52px', background: 'var(--surface)', border: BORDER, borderRadius: '4px' }} />
          ))}
        </div>
      ) : registros.length === 0 ? (
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>Nenhum registro encontrado.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {registros.map((r) => {
            const jp    = isJP(r)
            const cor   = jp ? '#4DA3F7' : '#2DB881'
            const nome  = jp ? 'João Pedro' : 'Atanael'
            const chips = jp ? chipsJP(r) : chipsAT(r)
            const isConf = confirmId === r.id

            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.875rem',
                  background: isConf ? 'rgba(248,113,113,0.05)' : 'var(--surface)',
                  border: `1px solid ${isConf ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                  borderRadius: '4px',
                  transition: 'border-color 0.12s',
                }}
              >
                {/* Data */}
                <span style={{
                  fontSize: '0.72rem',
                  color: 'var(--muted-foreground)',
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                  minWidth: '72px',
                }}>
                  {fmtData(r.data)}
                </span>

                {/* Usuário */}
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: cor,
                  flexShrink: 0,
                  minWidth: '80px',
                }}>
                  {nome}
                </span>

                {/* Chips de métricas */}
                <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                  {chips.map(({ label, value }) => (
                    <span key={label} style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: value > 0 ? cor : 'var(--muted-foreground)',
                      background: value > 0 ? `${cor}14` : 'transparent',
                      border: `1px solid ${value > 0 ? `${cor}30` : 'var(--border)'}`,
                      borderRadius: '3px',
                      padding: '2px 7px',
                      fontVariantNumeric: 'tabular-nums',
                      fontFamily: "'Segoe UI', system-ui, sans-serif",
                      opacity: value === 0 ? 0.45 : 1,
                    }}>
                      {label} {value}
                    </span>
                  ))}
                </div>

                {/* Ação excluir */}
                {isConf ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.65rem', color: '#F87171' }}>Excluir?</span>
                    <button onClick={() => excluir(r.id)} style={{
                      padding: '2px 10px', fontSize: '0.65rem', fontWeight: 700,
                      background: '#F87171', color: '#fff', border: 'none',
                      borderRadius: '3px', cursor: 'pointer',
                    }}>Sim</button>
                    <button onClick={() => setConfirmId(null)} style={{
                      padding: '2px 10px', fontSize: '0.65rem',
                      background: 'transparent', color: 'var(--muted-foreground)',
                      border: '1px solid var(--border)', borderRadius: '3px', cursor: 'pointer',
                    }}>Não</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(r.id)}
                    title="Excluir"
                    style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: '1px solid var(--border)',
                      color: 'var(--muted-foreground)', fontSize: '0.65rem',
                      cursor: 'pointer', transition: 'all 0.12s',
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

          <p style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', marginTop: '0.75rem', opacity: 0.6 }}>
            {registros.length} registro{registros.length !== 1 ? 's' : ''} · Para editar, vá em Registrar e selecione a data.
          </p>
        </div>
      )}
    </div>
  )
}
