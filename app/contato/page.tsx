'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  type TipoAtividade, type StatusContato,
  LABEL_ATIVIDADE, COR_ATIVIDADE, LABEL_STATUS,
} from '@/lib/supabase'
import AnimatedTitle from '@/components/animated-title'

const BORDER = '1px solid var(--border)'
const SURFACE = 'var(--surface)'

type Step = 'idle' | 'tier' | 'tipo' | 'status' | 'tentativa' | 'salvando' | 'ok'

const ATIVIDADES: TipoAtividade[] = [
  'cold_call', 'whatsapp', 'agendamento_reuniao', 'follow_up',
  'proposta', 'negocio_fechado', 'reuniao_realizada', 'reuniao_furada',
]

const STATUS_OPCOES: StatusContato[] = ['atendeu_normal', 'atendeu_ocupado', 'nao_atendeu']

function hoje() { return new Date().toISOString().slice(0, 10) }

function precisaStatus(tipo: TipoAtividade) {
  return tipo === 'cold_call'
}

export default function ContatoPage() {
  const [step, setStep]               = useState<Step>('idle')
  const [tier, setTier]               = useState<number | null>(null)
  const [tipo, setTipo]               = useState<TipoAtividade | null>(null)
  const [status, setStatus]           = useState<StatusContato | null>(null)
  const [tentativa, setTentativa]     = useState<number>(1)
  const [erro, setErro]               = useState('')

  function reset() {
    setStep('idle'); setTier(null); setTipo(null)
    setStatus(null); setTentativa(1); setErro('')
  }

  async function salvar() {
    if (!tier || !tipo) return
    setStep('salvando')
    setErro('')

    const payload: Record<string, unknown> = {
      data: hoje(),
      usuario: 'atanael',
      tier,
      tipo_atividade: tipo,
      status_contato: precisaStatus(tipo) ? status : null,
      tentativa: tipo === 'cold_call' ? tentativa : null,
    }

    const { error } = await supabase.from('atividades').insert(payload)
    if (error) { setErro(error.message); setStep('tentativa'); return }
    setStep('ok')
  }

  // ─── Passo atual ────────────────────────────────────────────────────────────

  function escolherTipo(t: TipoAtividade) {
    setTipo(t)
    if (precisaStatus(t)) setStep('status')  // cold_call → status → tentativa
    else salvarDireto(t)
  }

  async function salvarDireto(t: TipoAtividade) {
    if (!tier) return
    setStep('salvando')
    const { error } = await supabase.from('atividades').insert({
      data: hoje(), usuario: 'atanael', tier,
      tipo_atividade: t, status_contato: null, tentativa: null,
    })
    if (error) { setErro(error.message); setStep('tipo'); return }
    setStep('ok')
  }

  function escolherStatus(s: StatusContato) {
    setStatus(s)
    setStep('tentativa')
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
          <Progresso atual={0} total={3} />
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Etapa 1 de 3
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
          <Progresso atual={1} total={3} />
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Etapa 2 de 3 — Tier {tier}
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
                {t === 'cold_call' && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>registra tentativa</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — Status do contato (só cold call) */}
      {step === 'status' && (
        <div style={cardStyle}>
          <Voltar onClick={() => setStep('tipo')} />
          <Progresso atual={2} total={3} />
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Etapa 3 de 3 — Tier {tier} · {tipo && LABEL_ATIVIDADE[tipo]}
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--foreground)' }}>
            Como foi o contato?
          </p>
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

      {/* STEP 4 — Tentativa (só cold call) */}
      {step === 'tentativa' && (
        <div style={cardStyle}>
          <Voltar onClick={() => setStep(precisaStatus(tipo!) ? 'status' : 'tipo')} />
          <Progresso atual={3} total={3} />
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
            Etapa 3 de 3 — Tier {tier} · Cold Call
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--foreground)' }}>
            Qual é o número da tentativa?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setTentativa(n)} style={{
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
          {erro && <p style={{ fontSize: '0.72rem', color: '#F87171', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(248,113,113,0.08)', borderRadius: '4px', border: '1px solid rgba(248,113,113,0.2)' }}>{erro}</p>}
          <button onClick={salvar} style={{
            width: '100%', padding: '0.875rem',
            background: '#0078D4', color: '#fff', border: 'none',
            borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}>
            Confirmar registro
          </button>
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
            {tentativa && tipo === 'cold_call' ? ` · Tentativa ${tentativa}` : ''}
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
    </div>
  )
}
