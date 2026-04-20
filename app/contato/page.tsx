'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  type TipoAtividade, type StatusContato, type Atividade,
  LABEL_ATIVIDADE, COR_ATIVIDADE, LABEL_STATUS,
} from '@/lib/supabase'
import AnimatedTitle from '@/components/animated-title'

const BORDER = '1px solid var(--border)'
const SURFACE = 'var(--surface)'

// Step machine: tentativa BEFORE status (new order)
type Step = 'idle' | 'tier' | 'tipo' | 'tentativa' | 'status' | 'salvando' | 'ok'

const ATIVIDADES: TipoAtividade[] = [
  'cold_call', 'whatsapp', 'agendamento_reuniao', 'follow_up',
  'proposta', 'negocio_fechado', 'reuniao_realizada', 'reuniao_furada',
]

const STATUS_OPCOES: StatusContato[] = ['atendeu_normal', 'atendeu_ocupado', 'nao_atendeu']

function hoje() { return new Date().toISOString().slice(0, 10) }

function fmtData(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ContatoPage() {
  const [step, setStep]           = useState<Step>('idle')
  const [tier, setTier]           = useState<number | null>(null)
  const [tipo, setTipo]           = useState<TipoAtividade | null>(null)
  const [tentativa, setTentativa] = useState<number>(1)
  const [erro, setErro]           = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  function reset() {
    setStep('idle'); setTier(null); setTipo(null)
    setTentativa(1); setErro('')
  }

  // ─── Non-cold_call: save directly ───────────────────────────────────────────
  async function salvarDireto(t: TipoAtividade) {
    if (!tier) return
    setStep('salvando')
    const { error } = await supabase.from('atividades').insert({
      data: hoje(), usuario: 'atanael', tier,
      tipo_atividade: t, status_contato: null, tentativa: null,
    })
    if (error) { setErro(error.message); setStep('tipo'); return }
    setRefreshKey(k => k + 1)
    setStep('ok')
  }

  // ─── Cold call: save with tentativa + status ─────────────────────────────────
  async function salvarColdCall(s: StatusContato) {
    if (!tier || !tipo) return
    setStep('salvando')
    const { error } = await supabase.from('atividades').insert({
      data: hoje(), usuario: 'atanael', tier,
      tipo_atividade: tipo,
      status_contato: s,
      tentativa,
    })
    if (error) { setErro(error.message); setStep('status'); return }
    setRefreshKey(k => k + 1)
    setStep('ok')
  }

  // ─── Step handlers ───────────────────────────────────────────────────────────
  function escolherTipo(t: TipoAtividade) {
    setTipo(t)
    if (t === 'cold_call') setStep('tentativa')
    else salvarDireto(t)
  }

  function escolherTentativa(n: number) {
    setTentativa(n)
    setStep('status')
  }

  function escolherStatus(s: StatusContato) {
    salvarColdCall(s)
  }

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '2rem',
    background: SURFACE,
    border: BORDER,
    borderRadius: '6px',
  }

  const btnBase: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'transparent',
    border: BORDER,
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 500,
    color: 'var(--foreground)',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'border-color 0.12s, background 0.12s',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  }

  function Dot({ color }: { color: string }) {
    return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
  }

  function Voltar({ onClick }: { onClick: () => void }) {
    return (
      <button onClick={onClick} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '0.72rem', color: 'var(--muted-foreground)',
        padding: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        ← Voltar
      </button>
    )
  }

  function Progresso({ atual, total }: { atual: number; total: number }) {
    return (
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '2px', borderRadius: '2px',
            background: i < atual ? '#0078D4' : 'var(--border)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: BORDER }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Atanael</p>
        <AnimatedTitle text="Contato" />
      </div>

      {/* IDLE — botão inicial */}
      {step === 'idle' && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
          <button
            onClick={() => setStep('tier')}
            style={{
              padding: '1rem 2.5rem',
              background: '#0078D4',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,120,212,0.35)',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            + Registrar Atividade
          </button>
        </div>
      )}

      {/* STEP 1 — Tier */}
      {step === 'tier' && (
        <div style={cardStyle}>
          <Progresso atual={0} total={4} />
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Etapa 1 de 4
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--foreground)' }}>
            Qual é o Tier do contato?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map((t) => (
              <button key={t} onClick={() => { setTier(t); setStep('tipo') }} style={{
                ...btnBase,
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: 700,
                padding: '1.25rem',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0078D4'; e.currentTarget.style.background = 'rgba(0,120,212,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
              >
                Tier {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Tipo de atividade */}
      {step === 'tipo' && (
        <div style={cardStyle}>
          <Voltar onClick={() => setStep('tier')} />
          <Progresso atual={1} total={4} />
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Etapa 2 de 4 — Tier {tier}
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--foreground)' }}>
            Qual atividade foi realizada?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ATIVIDADES.map((t) => (
              <button key={t} onClick={() => escolherTipo(t)} style={btnBase}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COR_ATIVIDADE[t]; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
              >
                <Dot color={COR_ATIVIDADE[t]} />
                {LABEL_ATIVIDADE[t]}
                {t === 'cold_call' && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>tentativa + status</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — Número da tentativa (cold call) */}
      {step === 'tentativa' && (
        <div style={cardStyle}>
          <Voltar onClick={() => setStep('tipo')} />
          <Progresso atual={2} total={4} />
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Etapa 3 de 4 — Tier {tier} · Cold Call
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--foreground)' }}>
            Qual é o número da tentativa?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => escolherTentativa(n)} style={{
                ...btnBase,
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: 700,
                padding: '0.875rem',
                borderColor: tentativa === n ? '#0078D4' : 'var(--border)',
                background: tentativa === n ? 'rgba(0,120,212,0.1)' : 'transparent',
                color: tentativa === n ? '#4DA3F7' : 'var(--foreground)',
              }}
                onMouseEnter={e => { if (tentativa !== n) { e.currentTarget.style.borderColor = '#0078D4'; e.currentTarget.style.background = 'rgba(0,120,212,0.06)' } }}
                onMouseLeave={e => { if (tentativa !== n) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' } }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 — Como foi o contato (cold call) */}
      {step === 'status' && (
        <div style={cardStyle}>
          <Voltar onClick={() => setStep('tentativa')} />
          <Progresso atual={3} total={4} />
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Etapa 4 de 4 — Tier {tier} · Tentativa {tentativa}
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--foreground)' }}>
            Como foi o contato?
          </p>
          {erro && <p style={{ fontSize: '0.72rem', color: '#F87171', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(248,113,113,0.08)', borderRadius: '4px', border: '1px solid rgba(248,113,113,0.2)' }}>{erro}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {STATUS_OPCOES.map((s) => {
              const cor = s === 'atendeu_normal' ? '#34D399' : s === 'atendeu_ocupado' ? '#FBBF24' : '#F87171'
              return (
                <button key={s} onClick={() => escolherStatus(s)} style={btnBase}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cor; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Dot color={cor} />
                  {LABEL_STATUS[s]}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Salvando */}
      {step === 'salvando' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Salvando...</p>
        </div>
      )}

      {/* OK */}
      {step === 'ok' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Atividade registrada</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
            {tipo && LABEL_ATIVIDADE[tipo]} · Tier {tier}
          </p>
          <button onClick={reset} style={{
            padding: '0.75rem 2rem', background: '#0078D4', color: '#fff',
            border: 'none', borderRadius: '4px', fontSize: '0.75rem',
            fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}>
            + Registrar outra
          </button>
        </div>
      )}

      {/* ─── Histórico ───────────────────────────────────────────────── */}
      <HistoricoAtividades refreshKey={refreshKey} />
    </div>
  )
}

// ─── Componente de histórico ──────────────────────────────────────────────────

function HistoricoAtividades({ refreshKey }: { refreshKey: number }) {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading]       = useState(true)
  const [confirmId, setConfirmId]   = useState<string | null>(null)

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
  }, [refreshKey])

  async function deletar(id: string) {
    setConfirmId(null)
    setAtividades(prev => prev.filter(a => a.id !== id))
    await supabase.from('atividades').delete().eq('id', id)
  }

  if (loading) return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
      <p style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Histórico</p>
    </div>
  )

  if (atividades.length === 0) return null

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
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
          const cor = COR_ATIVIDADE[a.tipo_atividade]
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
              {/* Dot */}
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: cor, flexShrink: 0,
                display: 'inline-block',
              }} />

              {/* Atividade + extras */}
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

              {/* Data + hora */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtData(a.data)}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtHora(a.criado_em)}
                </div>
              </div>

              {/* Ação de exclusão */}
              {isConf ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                  <button onClick={() => deletar(a.id)} style={{
                    padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700,
                    background: '#F87171', color: '#fff', border: 'none',
                    borderRadius: '3px', cursor: 'pointer',
                  }}>Sim</button>
                  <button onClick={() => setConfirmId(null)} style={{
                    padding: '2px 8px', fontSize: '0.65rem',
                    background: 'transparent', color: 'var(--muted-foreground)',
                    border: '1px solid var(--border)', borderRadius: '3px', cursor: 'pointer',
                  }}>Não</button>
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
