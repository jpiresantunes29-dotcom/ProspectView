'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, LABEL_EVENTO, COR_EVENTO, type TipoEvento, type Evento } from '@/lib/supabase'
import { invalidateRegistrosCache } from '@/lib/queryCache'
import { type SequenciaLigacao, LABEL_SEQUENCIA } from '@/lib/metrics'

type Usuario = 'joao_pedro' | 'atanael'
type Modo = 'rapido' | 'manual'

const hoje = () => new Date().toISOString().slice(0, 10)

// ─── Campos por usuário ───────────────────────────────────────────────────────

const camposJP: { key: TipoEvento; label: string }[] = [
  { key: 'empresas_encontradas', label: 'Empresas encontradas' },
  { key: 'leads_qualificados',   label: 'Leads qualificados'   },
  { key: 'leads_enviados_crm',   label: 'Leads enviados ao CRM'},
]

const camposAT: { key: TipoEvento; label: string }[] = [
  { key: 'leads_contatados',    label: 'Leads contatados'      },
  { key: 'respostas',           label: 'Respostas recebidas'   },
  { key: 'interessados',        label: 'Leads interessados'    },
  { key: 'reunioes_marcadas',   label: 'Reuniões marcadas'     },
  { key: 'reunioes_realizadas', label: 'Reuniões realizadas'   },
  { key: 'oportunidades',       label: 'Oportunidades geradas' },
  { key: 'ligacoes_feitas',     label: 'Ligações feitas'       },
  { key: 'ligacoes_sucesso',    label: 'Ligações com sucesso'  },
  { key: 'ligacoes_falha',      label: 'Ligações sem sucesso'  },
  { key: 'follow_ups',          label: 'Follow-ups'            },
]

// negocio_fechado só aparece no modo rápido (é evento puro, sem coluna em registros)
const camposATRapido: { key: TipoEvento; label: string }[] = [
  ...camposAT,
  { key: 'negocio_fechado', label: 'Negócio fechado' },
]

const TIPOS_SOMENTE_EVENTO: TipoEvento[] = ['negocio_fechado']
const TIPOS_TIER_SEQ: TipoEvento[]       = ['ligacoes_feitas', 'ligacoes_sucesso', 'ligacoes_falha']
const TIPOS_TIER_ONLY: TipoEvento[]      = ['negocio_fechado']
const TIERS = [1, 2, 3, 4] as const
const SEQUENCIAS: SequenciaLigacao[]     = ['cold1', 'cold2', 'cold3', 'fup']

const MOTIVOS_RAPIDOS = [
  'Não atendeu',
  'Número incorreto',
  'Ligar mais tarde',
  'Sem interesse',
  'Fora do perfil',
]

type Contadores = Partial<Record<TipoEvento, number>>

const defaultValores = () => ({
  empresas_encontradas: '', leads_qualificados: '', leads_enviados_crm: '',
  leads_contatados: '', respostas: '', interessados: '',
  reunioes_marcadas: '', reunioes_realizadas: '', oportunidades: '',
  ligacoes_feitas: '', ligacoes_sucesso: '', ligacoes_falha: '', follow_ups: '',
})

// ─── Estilos base ─────────────────────────────────────────────────────────────

const corUsuario = (u: Usuario) => u === 'joao_pedro' ? 'var(--color-captacao)' : 'var(--color-contato)'

function horaFormatada(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RegistrarPage() {
  const [modo, setModo]       = useState<Modo>('rapido')
  const [usuario, setUsuario] = useState<Usuario>('joao_pedro')

  return (
    <div style={{ maxWidth: '520px' }}>
      {/* Header compacto */}
      <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.75rem' }}>
          Registro diário
        </p>

        {/* Seletor de usuário + toggle de modo na mesma linha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Usuários */}
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            {(['joao_pedro', 'atanael'] as Usuario[]).map((u) => {
              const ativo = usuario === u
              const cor   = corUsuario(u)
              return (
                <button
                  key={u}
                  onClick={() => setUsuario(u)}
                  style={{
                    flex: 1, padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.03em',
                    border: '1px solid', borderRadius: '4px', cursor: 'pointer',
                    transition: 'all 0.15s',
                    borderColor: ativo ? cor : 'var(--border)',
                    background:  ativo ? cor + '14' : 'transparent',
                    color:       ativo ? cor : 'var(--muted-foreground)',
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
                >
                  {u === 'joao_pedro' ? 'João Pedro' : 'Atanael'}
                </button>
              )
            })}
          </div>

          {/* Divisor */}
          <div style={{ width: '1px', height: '28px', background: 'var(--border)', flexShrink: 0 }} />

          {/* Toggle modo */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '5px', padding: '2px', flexShrink: 0 }}>
            {([['rapido', 'Rápido'], ['manual', 'Manual']] as [Modo, string][]).map(([m, label]) => (
              <button
                key={m}
                onClick={() => setModo(m)}
                style={{
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.03em',
                  border: 'none', borderRadius: '3px', cursor: 'pointer',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                  background: modo === m ? 'var(--surface-elevated)' : 'transparent',
                  color:      modo === m ? 'var(--foreground)' : 'var(--muted-foreground)',
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Atanael usa a página /contato para registrar atividades */}
      {usuario === 'atanael' ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(45,184,129,0.1)',
            border: '1px solid rgba(45,184,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DB881" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12"/>
              <path d="M2 2l20 20"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.35rem', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
              Atanael registra na página Contato
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.5, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
              Use o wizard de atividades para registrar cold calls,<br />
              agendamentos, follow-ups e muito mais.
            </p>
          </div>
          <a
            href="/contato"
            style={{
              padding: '0.75rem 1.75rem',
              background: '#2DB881',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              cursor: 'pointer',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            Ir para Contato →
          </a>
        </div>
      ) : modo === 'rapido' ? (
        <ModoRapido  usuario={usuario} />
      ) : (
        <ModoManual  usuario={usuario} />
      )}
    </div>
  )
}

// ─── MODO TOQUE RÁPIDO ────────────────────────────────────────────────────────

function ModoRapido({ usuario }: { usuario: Usuario }) {
  const [contadores, setContadores] = useState<Contadores>({})
  const [eventos,    setEventos]    = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando,   setSalvando]   = useState<Set<TipoEvento>>(new Set())

  // Undo temporário por 3s
  const [undoId,   setUndoId]   = useState<string | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hover/confirmação no feed
  const [hoverId,    setHoverId]    = useState<string | null>(null)
  const [confirmId,  setConfirmId]  = useState<string | null>(null)

  // Modal TIER + sequência
  const [tierModal,       setTierModal]       = useState<{ aberto: boolean; tipo: TipoEvento | null }>({ aberto: false, tipo: null })
  const [tierSelecionado, setTierSelecionado] = useState<1|2|3|4|null>(null)
  const [seqSelecionada,  setSeqSelecionada]  = useState<SequenciaLigacao | null>(null)

  // Modal motivo falha
  const [motivoModal, setMotivoModal] = useState<{ aberto: boolean; eventoId: string | null }>({ aberto: false, eventoId: null })
  const [motivoTexto, setMotivoTexto] = useState('')
  const motivoRef = useRef<HTMLInputElement>(null)

  const campos = usuario === 'joao_pedro' ? camposJP : camposATRapido
  const cor    = corUsuario(usuario)

  // Keyboard shortcuts: keys 1-9 increment corresponding field
  const atalhoRef = useRef({ tierAberto: false, motivoAberto: false, campos, handleBotao: (_: TipoEvento) => {} })
  atalhoRef.current.tierAberto   = tierModal.aberto
  atalhoRef.current.motivoAberto = motivoModal.aberto
  atalhoRef.current.campos       = campos

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const { tierAberto, motivoAberto, campos: c } = atalhoRef.current
      if (tierAberto || motivoAberto) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const idx = parseInt(e.key) - 1
      if (!isNaN(idx) && idx >= 0 && idx < c.length) {
        e.preventDefault()
        handleBotao(c[idx].key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { carregarDia() }, [usuario])

  async function carregarDia() {
    setCarregando(true)
    const data = hoje()
    const [regRes, evRes] = await Promise.all([
      supabase.from('registros').select('*').eq('data', data).eq('usuario', usuario).single(),
      supabase.from('eventos').select('*').eq('data', data).eq('usuario', usuario).order('criado_em', { ascending: false }),
    ])
    const evList = (evRes.data as Evento[]) ?? []
    const negFechados = evList.filter(e => e.tipo === 'negocio_fechado').length
    if (regRes.data) {
      const r = regRes.data
      setContadores({
        empresas_encontradas: r.empresas_encontradas ?? 0,
        leads_qualificados:   r.leads_qualificados   ?? 0,
        leads_enviados_crm:   r.leads_enviados_crm   ?? 0,
        leads_contatados:     r.leads_contatados     ?? 0,
        respostas:            r.respostas            ?? 0,
        interessados:         r.interessados         ?? 0,
        reunioes_marcadas:    r.reunioes_marcadas    ?? 0,
        reunioes_realizadas:  r.reunioes_realizadas  ?? 0,
        oportunidades:        r.oportunidades        ?? 0,
        ligacoes_feitas:      r.ligacoes_feitas      ?? 0,
        ligacoes_sucesso:     r.ligacoes_sucesso     ?? 0,
        ligacoes_falha:       r.ligacoes_falha       ?? 0,
        follow_ups:           r.follow_ups           ?? 0,
        negocio_fechado:      negFechados,
      })
    } else {
      const zero: Contadores = {}
      campos.forEach(c => { zero[c.key] = 0 })
      zero.negocio_fechado = negFechados
      setContadores(zero)
    }
    setEventos(evList)
    setCarregando(false)
  }

  function handleBotao(tipo: TipoEvento) {
    if (TIPOS_TIER_SEQ.includes(tipo) || TIPOS_TIER_ONLY.includes(tipo)) {
      setTierSelecionado(null); setSeqSelecionada(null)
      setTierModal({ aberto: true, tipo })
    } else {
      registrar(tipo, null, null)
    }
  }

  async function confirmarTier() {
    const tipo = tierModal.tipo
    if (!tipo || !tierSelecionado) return
    const seq = TIPOS_TIER_SEQ.includes(tipo) ? seqSelecionada : null
    if (TIPOS_TIER_SEQ.includes(tipo) && !seq) return
    setTierModal({ aberto: false, tipo: null })
    await registrar(tipo, tierSelecionado, seq)
  }

  async function registrar(tipo: TipoEvento, tier: number | null, sequencia: SequenciaLigacao | null) {
    const data = hoje()
    // Otimista
    setContadores(prev => ({ ...prev, [tipo]: (prev[tipo] ?? 0) + 1 }))
    const novoEv: Evento = {
      id: crypto.randomUUID(), data, usuario, tipo,
      criado_em: new Date().toISOString(),
      motivo_falha: null, tier: tier ?? null, sequencia_ligacao: sequencia ?? null,
    }
    setEventos(prev => [novoEv, ...prev])
    setSalvando(prev => new Set([...prev, tipo]))

    // Undo disponível por 3s
    setUndoId(novoEv.id)
    if (undoTimer.current) clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setUndoId(null), 3000)

    const evPayload: Record<string, unknown> = { data, usuario, tipo }
    if (tier)     evPayload.tier = tier
    if (sequencia) evPayload.sequencia_ligacao = sequencia

    const { data: evData } = await supabase.from('eventos').insert(evPayload).select('id').single()
    if (!TIPOS_SOMENTE_EVENTO.includes(tipo)) {
      await supabase.rpc('incrementar_registro', { p_data: data, p_usuario: usuario, p_campo: tipo, p_delta: 1 })
      invalidateRegistrosCache()
    }
    setSalvando(prev => { const n = new Set(prev); n.delete(tipo); return n })

    if (tipo === 'ligacoes_falha' && evData?.id) {
      setMotivoModal({ aberto: true, eventoId: evData.id })
      setMotivoTexto('')
      setTimeout(() => motivoRef.current?.focus(), 100)
    }
  }

  async function desfazer(evId: string) {
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndoId(null)
    const ev = eventos.find(e => e.id === evId)
    if (!ev) return
    await excluirEvento(ev)
  }

  async function excluirEvento(ev: Evento) {
    setConfirmId(null); setHoverId(null)
    setEventos(prev => prev.filter(e => e.id !== ev.id))
    setContadores(prev => ({ ...prev, [ev.tipo]: Math.max(0, (prev[ev.tipo] ?? 0) - 1) }))
    await supabase.from('eventos').delete().eq('id', ev.id)
    if (!TIPOS_SOMENTE_EVENTO.includes(ev.tipo)) {
      await supabase.rpc('incrementar_registro', { p_data: hoje(), p_usuario: usuario, p_campo: ev.tipo, p_delta: -1 })
    }
  }

  async function salvarMotivo(motivo: string) {
    if (!motivoModal.eventoId || !motivo.trim()) { setMotivoModal({ aberto: false, eventoId: null }); return }
    await supabase.from('eventos').update({ motivo_falha: motivo.trim() }).eq('id', motivoModal.eventoId)
    setEventos(prev => prev.map(e => e.id === motivoModal.eventoId ? { ...e, motivo_falha: motivo.trim() } : e))
    setMotivoModal({ aberto: false, eventoId: null }); setMotivoTexto('')
  }

  const precisaSeq    = tierModal.tipo ? TIPOS_TIER_SEQ.includes(tierModal.tipo) : false
  const podeConfirmar = tierSelecionado !== null && (!precisaSeq || seqSelecionada !== null)
  const totalHoje     = eventos.length

  return (
    <>
      {/* Indicador de ações hoje */}
      {totalHoje > 0 && (
        <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
          <span style={{ color: cor, fontWeight: 600 }}>{totalHoje}</span>
          {' '} ação{totalHoje !== 1 ? 'ões' : ''} registrada{totalHoje !== 1 ? 's' : ''} hoje
        </p>
      )}

      {/* Toast de desfazer */}
      {undoId && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.6rem 0.875rem', marginBottom: '1rem',
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          borderRadius: '6px', gap: '1rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Registro adicionado.</span>
          <button
            onClick={() => desfazer(undoId)}
            style={{
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
              color: cor, background: 'none', border: 'none', cursor: 'pointer',
              padding: '0', fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            DESFAZER
          </button>
        </div>
      )}

      {/* Grid de botões */}
      {carregando ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: '88px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem', marginBottom: '2rem' }}>
          {campos.map(({ key, label }, fieldIdx) => {
            const count    = contadores[key] ?? 0
            const isSaving = salvando.has(key)
            const needsTier = TIPOS_TIER_SEQ.includes(key) || TIPOS_TIER_ONLY.includes(key)
            const corCampo = COR_EVENTO[key] ?? cor
            const shortcut = fieldIdx < 9 ? String(fieldIdx + 1) : null
            return (
              <button
                key={key}
                onClick={() => handleBotao(key)}
                disabled={isSaving}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  padding: '0.875rem', minHeight: '88px',
                  background: 'var(--surface)',
                  border: `1px solid ${count > 0 ? corCampo + '50' : 'var(--border)'}`,
                  borderRadius: '6px', cursor: isSaving ? 'wait' : 'pointer',
                  transition: 'all 0.12s', userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  opacity: isSaving ? 0.7 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = corCampo + '80'; e.currentTarget.style.background = 'var(--surface-elevated)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = count > 0 ? corCampo + '50' : 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                {/* Linha superior: label + indicadores */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.25rem' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--muted-foreground)',
                    lineHeight: 1.3, textAlign: 'left',
                  }}>
                    {label}
                  </span>
                  <div style={{ display: 'flex', gap: '3px', flexShrink: 0, alignItems: 'center' }}>
                    {shortcut && (
                      <span style={{
                        fontSize: '0.48rem', fontWeight: 700, letterSpacing: '0.02em',
                        color: 'var(--border)', border: '1px solid var(--border)',
                        borderRadius: '2px', padding: '1px 3px', fontFamily: 'monospace',
                      }}>{shortcut}</span>
                    )}
                    {needsTier && (
                      <span style={{
                        fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.06em',
                        color: corCampo, border: `1px solid ${corCampo}60`,
                        borderRadius: '2px', padding: '1px 3px',
                      }}>TIER</span>
                    )}
                    {isSaving && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: corCampo, animation: 'pulse 0.8s ease-in-out infinite', display: 'block', marginTop: '1px' }} />}
                  </div>
                </div>

                {/* Linha inferior: contador + botão +1 */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '1.75rem', fontFamily: 'var(--font-display)',
                    fontWeight: 500, lineHeight: 1,
                    color: count > 0 ? corCampo : 'var(--border)',
                    transition: 'color 0.2s',
                  }}>
                    {count}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
                    color: corCampo, background: corCampo + '18',
                    border: `1px solid ${corCampo}40`,
                    borderRadius: '3px', padding: '2px 6px',
                  }}>
                    +1
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Feed de eventos */}
      {eventos.length > 0 && (
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.75rem' }}>
            Histórico de hoje
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {eventos.map((ev, i) => {
              const corEv    = COR_EVENTO[ev.tipo] ?? 'var(--muted-foreground)'
              const isHov    = hoverId === ev.id
              const isConf   = confirmId === ev.id
              return (
                <div
                  key={ev.id}
                  onMouseEnter={() => { setHoverId(ev.id); if (confirmId && confirmId !== ev.id) setConfirmId(null) }}
                  onMouseLeave={() => { setHoverId(null); setConfirmId(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0.5rem', margin: '0 -0.5rem',
                    borderRadius: '4px',
                    borderBottom: i < eventos.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: isConf ? 'rgba(209,52,56,0.06)' : isHov ? 'var(--surface)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: corEv, flexShrink: 0, transition: 'transform 0.15s', transform: isHov ? 'scale(1.5)' : 'scale(1)' }} />
                  <span style={{ fontSize: '0.75rem', color: isHov ? 'var(--foreground)' : 'var(--muted-foreground)', flex: 1, transition: 'color 0.15s', lineHeight: 1.4 }}>
                    {LABEL_EVENTO[ev.tipo]}
                    {ev.tier && <span style={{ color: 'var(--muted-foreground)', marginLeft: '0.35rem', opacity: 0.7 }}>· T{ev.tier}</span>}
                    {ev.sequencia_ligacao && <span style={{ color: 'var(--muted-foreground)', marginLeft: '0.25rem', opacity: 0.7 }}>· {LABEL_SEQUENCIA[ev.sequencia_ligacao]}</span>}
                    {ev.motivo_falha && <span style={{ color: 'var(--muted-foreground)', marginLeft: '0.35rem', opacity: 0.7 }}>· {ev.motivo_falha}</span>}
                  </span>

                  {isConf ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--destructive)' }}>Remover?</span>
                      <button onClick={() => excluirEvento(ev)} style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, background: 'var(--destructive)', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Sim</button>
                      <button onClick={() => setConfirmId(null)} style={{ padding: '2px 8px', fontSize: '0.65rem', background: 'transparent', color: 'var(--muted-foreground)', border: '1px solid var(--border)', borderRadius: '3px', cursor: 'pointer' }}>Não</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.65rem', color: isHov ? 'var(--muted-foreground)' : 'var(--border)', fontVariantNumeric: 'tabular-nums', transition: 'color 0.15s' }}>
                        {horaFormatada(ev.criado_em)}
                      </span>
                      <button
                        onClick={() => setConfirmId(ev.id)}
                        title="Remover"
                        style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'transparent', border: '1px solid var(--border)',
                          color: 'var(--muted-foreground)', fontSize: '0.6rem',
                          cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
                          opacity: isHov ? 1 : 0, pointerEvents: isHov ? 'auto' : 'none',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(209,52,56,0.12)'; e.currentTarget.style.borderColor = 'var(--destructive)'; e.currentTarget.style.color = 'var(--destructive)' }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                      >×</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {eventos.length === 0 && !carregando && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--border)' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
            Nenhum registro hoje. Toque um botão para começar.
          </p>
        </div>
      )}

      {/* Modal TIER */}
      {tierModal.aberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setTierModal({ aberto: false, tipo: null })}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px 12px 0 0', padding: '1.5rem', width: '100%', maxWidth: '520px', margin: '0 auto', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '28px', height: '2px', background: 'var(--border)', borderRadius: '1px', margin: '0 auto 1.25rem' }} />
            <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
              {tierModal.tipo ? LABEL_EVENTO[tierModal.tipo] : ''}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Tier do lead</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {TIERS.map(t => (
                <button key={t} onClick={() => setTierSelecionado(t)} style={{ flex: 1, padding: '0.7rem 0', fontSize: '0.85rem', fontWeight: 700, border: '1px solid', borderColor: tierSelecionado === t ? 'var(--primary)' : 'var(--border)', background: tierSelecionado === t ? 'var(--primary)14' : 'var(--surface-elevated)', color: tierSelecionado === t ? 'var(--primary)' : 'var(--muted-foreground)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.12s', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
                  T{t}
                </button>
              ))}
            </div>
            {precisaSeq && (
              <>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Tipo de contato</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {SEQUENCIAS.map(s => (
                    <button key={s} onClick={() => setSeqSelecionada(s)} style={{ padding: '0.6rem 0', fontSize: '0.8rem', fontWeight: 600, border: '1px solid', borderColor: seqSelecionada === s ? 'var(--primary)' : 'var(--border)', background: seqSelecionada === s ? 'var(--primary)14' : 'var(--surface-elevated)', color: seqSelecionada === s ? 'var(--primary)' : 'var(--muted-foreground)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.12s', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
                      {LABEL_SEQUENCIA[s]}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button onClick={confirmarTier} disabled={!podeConfirmar} style={{ width: '100%', padding: '0.8rem', background: podeConfirmar ? 'var(--primary)' : 'var(--surface-elevated)', border: 'none', borderRadius: '6px', color: podeConfirmar ? '#fff' : 'var(--border)', fontSize: '0.8rem', fontWeight: 700, cursor: podeConfirmar ? 'pointer' : 'default', transition: 'all 0.15s', letterSpacing: '0.04em', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
              Confirmar
            </button>
            <button onClick={() => setTierModal({ aberto: false, tipo: null })} style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem', background: 'transparent', border: 'none', color: 'var(--muted-foreground)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal motivo falha */}
      {motivoModal.aberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setMotivoModal({ aberto: false, eventoId: null })}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px 12px 0 0', padding: '1.5rem', width: '100%', maxWidth: '520px', margin: '0 auto', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '28px', height: '2px', background: 'var(--border)', borderRadius: '1px', margin: '0 auto 1.25rem' }} />
            <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--destructive)', marginBottom: '1rem' }}>
              Motivo — Ligação sem sucesso
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
              {MOTIVOS_RAPIDOS.map(m => (
                <button key={m} onClick={() => salvarMotivo(m)} style={{ padding: '0.7rem 0.875rem', background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--destructive)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  {m}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input ref={motivoRef} type="text" value={motivoTexto} onChange={e => setMotivoTexto(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') salvarMotivo(motivoTexto) }} placeholder="Outro motivo..."
                style={{ flex: 1, padding: '0.7rem 0.875rem', background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)', fontSize: '0.8rem', outline: 'none', fontFamily: "'Segoe UI', system-ui, sans-serif" }} />
              <button onClick={() => salvarMotivo(motivoTexto)} style={{ padding: '0.7rem 1rem', background: 'var(--destructive)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>OK</button>
            </div>
            <button onClick={() => setMotivoModal({ aberto: false, eventoId: null })} style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--muted-foreground)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
              Pular
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </>
  )
}

// ─── MODO MANUAL ──────────────────────────────────────────────────────────────

function ModoManual({ usuario }: { usuario: Usuario }) {
  const [data,    setData]    = useState(hoje())
  const [valores, setValores] = useState(defaultValores())
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'ok' | 'erro'>('idle')
  const [erroMsg, setErroMsg] = useState('')
  const [confirmLimpar, setConfirmLimpar] = useState(false)

  const campos = usuario === 'joao_pedro' ? camposJP : camposAT
  const cor    = corUsuario(usuario)

  // Carrega dados existentes ao mudar data ou usuário
  useEffect(() => {
    let cancelled = false
    async function carregar() {
      const { data: row } = await supabase
        .from('registros').select('*')
        .eq('data', data).eq('usuario', usuario).single()
      if (cancelled) return
      if (row) {
        setValores({
          empresas_encontradas: row.empresas_encontradas != null ? String(row.empresas_encontradas) : '',
          leads_qualificados:   row.leads_qualificados   != null ? String(row.leads_qualificados)   : '',
          leads_enviados_crm:   row.leads_enviados_crm   != null ? String(row.leads_enviados_crm)   : '',
          leads_contatados:     row.leads_contatados     != null ? String(row.leads_contatados)     : '',
          respostas:            row.respostas            != null ? String(row.respostas)            : '',
          interessados:         row.interessados         != null ? String(row.interessados)         : '',
          reunioes_marcadas:    row.reunioes_marcadas    != null ? String(row.reunioes_marcadas)    : '',
          reunioes_realizadas:  row.reunioes_realizadas  != null ? String(row.reunioes_realizadas)  : '',
          oportunidades:        row.oportunidades        != null ? String(row.oportunidades)        : '',
          ligacoes_feitas:      row.ligacoes_feitas      != null ? String(row.ligacoes_feitas)      : '',
          ligacoes_sucesso:     row.ligacoes_sucesso     != null ? String(row.ligacoes_sucesso)     : '',
          ligacoes_falha:       row.ligacoes_falha       != null ? String(row.ligacoes_falha)       : '',
          follow_ups:           row.follow_ups           != null ? String(row.follow_ups)           : '',
        })
      } else {
        setValores(defaultValores())
      }
    }
    carregar()
    return () => { cancelled = true }
  }, [data, usuario])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErroMsg('')

    // Monta payload apenas com os campos do usuário selecionado
    const payload: Record<string, number | string> = { data, usuario }
    const todosCampos = [...camposJP, ...camposAT]
    for (const { key } of todosCampos) {
      const val = valores[key as keyof ReturnType<typeof defaultValores>]
      payload[key] = val !== '' && val !== undefined ? parseInt(val, 10) : 0
    }

    const { error } = await supabase
      .from('registros')
      .upsert(payload, { onConflict: 'data,usuario' })

    if (error) {
      console.error('Supabase error:', error)
      setErroMsg(error.message)
      setStatus('erro')
    } else {
      invalidateRegistrosCache()
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  async function handleLimpar() {
    setConfirmLimpar(false)
    setStatus('loading')
    setErroMsg('')
    const { error } = await supabase
      .from('registros').delete()
      .eq('data', data).eq('usuario', usuario)
    if (error) {
      console.error('Supabase error:', error)
      setErroMsg(error.message)
      setStatus('erro')
    } else {
      setValores(defaultValores())
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Data */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
          Data
        </label>
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          style={{
            width: '100%', padding: '0.65rem 0.875rem',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '4px', color: 'var(--foreground)',
            fontSize: '0.875rem', outline: 'none',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = cor)}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <p style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', marginTop: '0.35rem' }}>
          Registros existentes nesta data serão atualizados.
        </p>
      </div>

      {/* Campos */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '1px', background: cor, flexShrink: 0 }} />
          <label style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: cor }}>
            {usuario === 'joao_pedro' ? 'João Pedro — Captação' : 'Atanael — Contato comercial'}
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {campos.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', transition: 'border-color 0.15s' }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = cor)}
              onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <label style={{ flex: 1, fontSize: '0.8rem', color: 'var(--foreground)', fontFamily: "'Segoe UI', system-ui, sans-serif", cursor: 'pointer' }}>
                {label}
              </label>
              <input
                type="number"
                min={0}
                value={valores[key as keyof typeof valores]}
                onChange={e => setValores(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder="0"
                style={{
                  width: '72px', padding: '0.25rem 0.5rem',
                  background: 'transparent', border: 'none',
                  color: 'var(--foreground)', fontSize: '1.1rem',
                  fontFamily: 'var(--font-display)', fontWeight: 500,
                  textAlign: 'right', outline: 'none',
                  appearance: 'textfield',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botão salvar */}
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          width: '100%', padding: '0.8rem',
          background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: '4px',
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', cursor: status === 'loading' ? 'wait' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1, transition: 'opacity 0.15s',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          marginBottom: '0.5rem',
        }}
      >
        {status === 'loading' ? 'Salvando...' : 'Salvar registro'}
      </button>

      {/* Botão limpar */}
      {!confirmLimpar ? (
        <button
          type="button"
          onClick={() => setConfirmLimpar(true)}
          style={{
            width: '100%', padding: '0.7rem',
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: '4px', color: 'var(--muted-foreground)',
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', cursor: 'pointer',
            transition: 'all 0.15s', fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--destructive)'; e.currentTarget.style.color = 'var(--destructive)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
        >
          Limpar registro desta data
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.7rem 0.875rem', border: '1px solid var(--destructive)', borderRadius: '4px', background: 'rgba(209,52,56,0.06)' }}>
          <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--destructive)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            Apagar registro de {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}?
          </span>
          <button type="button" onClick={handleLimpar} style={{ padding: '4px 12px', background: 'var(--destructive)', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>Apagar</button>
          <button type="button" onClick={() => setConfirmLimpar(false)} style={{ padding: '4px 12px', background: 'transparent', color: 'var(--muted-foreground)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>Cancelar</button>
        </div>
      )}

      {status === 'ok'   && <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-contato)', marginTop: '0.75rem' }}>Registro salvo com sucesso.</p>}
      {status === 'erro' && (
        <p style={{ fontSize: '0.72rem', color: 'var(--destructive)', marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(209,52,56,0.08)', borderRadius: '4px', border: '1px solid rgba(209,52,56,0.25)' }}>
          {erroMsg || 'Erro ao salvar. Verifique o console.'}
        </p>
      )}
    </form>
  )
}
