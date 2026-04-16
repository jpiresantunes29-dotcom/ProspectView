'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, LABEL_EVENTO, COR_EVENTO, type TipoEvento, type Evento } from '@/lib/supabase'
import { type SequenciaLigacao, LABEL_SEQUENCIA } from '@/lib/metrics'

type Usuario = 'joao_pedro' | 'atanael'

const MOTIVOS_RAPIDOS = [
  'Não atendeu',
  'Número incorreto',
  'Ligar mais tarde',
  'Sem interesse',
  'Fora do perfil',
]

// Botões que requerem seleção de TIER + Sequência
const TIPOS_TIER_SEQ: TipoEvento[] = ['ligacoes_feitas', 'ligacoes_sucesso', 'ligacoes_falha']
// Botões que requerem apenas TIER
const TIPOS_TIER_ONLY: TipoEvento[] = ['negocio_fechado']
// Botões cujo contador vem dos eventos (não de registros)
const TIPOS_SOMENTE_EVENTO: TipoEvento[] = ['negocio_fechado']

type BotaoConfig = {
  tipo: TipoEvento
  emoji: string
  cor: string
}

const botoesJP: BotaoConfig[] = [
  { tipo: 'empresas_encontradas', emoji: '🏢', cor: '#60A5FA' },
  { tipo: 'leads_qualificados',   emoji: '✅', cor: '#34D399' },
  { tipo: 'leads_enviados_crm',   emoji: '📤', cor: '#2DD4BF' },
]

const botoesAT: BotaoConfig[] = [
  { tipo: 'leads_contatados',    emoji: '📬', cor: '#FBBF24' },
  { tipo: 'respostas',           emoji: '💬', cor: '#F59E0B' },
  { tipo: 'interessados',        emoji: '⭐', cor: '#F472B6' },
  { tipo: 'reunioes_marcadas',   emoji: '📅', cor: '#E879F9' },
  { tipo: 'reunioes_realizadas', emoji: '🤝', cor: '#7C3AED' },
  { tipo: 'oportunidades',       emoji: '💡', cor: '#A78BFA' },
  { tipo: 'negocio_fechado',     emoji: '🏆', cor: '#059669' },
  { tipo: 'ligacoes_feitas',     emoji: '📞', cor: '#60A5FA' },
  { tipo: 'ligacoes_sucesso',    emoji: '🎯', cor: '#34D399' },
  { tipo: 'ligacoes_falha',      emoji: '❌', cor: '#F87171' },
  { tipo: 'follow_ups',          emoji: '🔁', cor: '#94A3B8' },
]

const TIERS = [1, 2, 3, 4] as const
const SEQUENCIAS: SequenciaLigacao[] = ['cold1', 'cold2', 'cold3', 'fup']

function horaFormatada(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function dataHoje(): string {
  return new Date().toISOString().slice(0, 10)
}

type ContadoresState = Partial<Record<TipoEvento, number>>

export default function QuickLogPage() {
  const [usuario, setUsuario] = useState<Usuario>('joao_pedro')
  const [contadores, setContadores] = useState<ContadoresState>({
    empresas_encontradas: 0,
    leads_qualificados: 0,
    leads_enviados_crm: 0,
    leads_contatados: 0,
    respostas: 0,
    interessados: 0,
    reunioes_marcadas: 0,
    reunioes_realizadas: 0,
    oportunidades: 0,
    follow_ups: 0,
    ligacoes_feitas: 0,
    ligacoes_sucesso: 0,
    ligacoes_falha: 0,
    negocio_fechado: 0,
  })
  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState<Set<TipoEvento>>(new Set())

  // Modal de motivo para ligações sem sucesso
  const [motivoModal, setMotivoModal] = useState<{ aberto: boolean; eventoId: string | null }>({ aberto: false, eventoId: null })
  const [motivoTexto, setMotivoTexto] = useState('')
  const motivoInputRef = useRef<HTMLInputElement>(null)

  // Hover no feed para revelar botão de exclusão
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  // Modal de TIER (+ sequência para ligações)
  const [tierModal, setTierModal] = useState<{ aberto: boolean; tipo: TipoEvento | null }>({ aberto: false, tipo: null })
  const [tierSelecionado, setTierSelecionado] = useState<1 | 2 | 3 | 4 | null>(null)
  const [sequenciaSelecionada, setSequenciaSelecionada] = useState<SequenciaLigacao | null>(null)

  const botoes = usuario === 'joao_pedro' ? botoesJP : botoesAT

  useEffect(() => {
    carregarDia()
  }, [usuario])

  async function carregarDia() {
    setCarregando(true)
    const hoje = dataHoje()

    const [regRes, evRes] = await Promise.all([
      supabase.from('registros').select('*').eq('data', hoje).eq('usuario', usuario).single(),
      supabase.from('eventos').select('*').eq('data', hoje).eq('usuario', usuario).order('criado_em', { ascending: false }),
    ])

    const evList = (evRes.data as Evento[]) ?? []
    const negociosFechados = evList.filter((e) => e.tipo === 'negocio_fechado').length

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
        follow_ups:           r.follow_ups           ?? 0,
        ligacoes_feitas:      r.ligacoes_feitas      ?? 0,
        ligacoes_sucesso:     r.ligacoes_sucesso     ?? 0,
        ligacoes_falha:       r.ligacoes_falha       ?? 0,
        negocio_fechado:      negociosFechados,
      })
    } else {
      setContadores({
        empresas_encontradas: 0, leads_qualificados: 0, leads_enviados_crm: 0,
        leads_contatados: 0, respostas: 0, interessados: 0, reunioes_marcadas: 0,
        reunioes_realizadas: 0, oportunidades: 0, follow_ups: 0, ligacoes_feitas: 0,
        ligacoes_sucesso: 0, ligacoes_falha: 0, negocio_fechado: negociosFechados,
      })
    }

    setEventos(evList)
    setCarregando(false)
  }

  function handleBotaoClick(tipo: TipoEvento) {
    if (TIPOS_TIER_SEQ.includes(tipo) || TIPOS_TIER_ONLY.includes(tipo)) {
      setTierSelecionado(null)
      setSequenciaSelecionada(null)
      setTierModal({ aberto: true, tipo })
    } else {
      registrarToque(tipo, null, null)
    }
  }

  async function confirmarTier() {
    const tipo = tierModal.tipo
    if (!tipo || !tierSelecionado) return
    const seq = TIPOS_TIER_SEQ.includes(tipo) ? sequenciaSelecionada : null
    if (TIPOS_TIER_SEQ.includes(tipo) && !seq) return

    setTierModal({ aberto: false, tipo: null })
    await registrarToque(tipo, tierSelecionado, seq)
  }

  async function registrarToque(
    tipo: TipoEvento,
    tier: number | null,
    sequencia: SequenciaLigacao | null
  ) {
    const hoje = dataHoje()

    // Atualização optimista imediata
    setContadores((prev) => ({ ...prev, [tipo]: (prev[tipo] ?? 0) + 1 }))
    const novoEvento: Evento = {
      id: crypto.randomUUID(),
      data: hoje,
      usuario,
      tipo,
      criado_em: new Date().toISOString(),
      motivo_falha: null,
      tier: tier ?? null,
      sequencia_ligacao: sequencia ?? null,
    }
    setEventos((prev) => [novoEvento, ...prev])

    setSalvando((prev) => new Set([...prev, tipo]))

    // 1. Inserir evento (com tier/sequencia se disponível)
    const eventoPayload: Record<string, unknown> = { data: hoje, usuario, tipo }
    if (tier) eventoPayload.tier = tier
    if (sequencia) eventoPayload.sequencia_ligacao = sequencia

    const { data: evData } = await supabase
      .from('eventos')
      .insert(eventoPayload)
      .select('id')
      .single()

    // 2. Incremento atômico via RPC (apenas para colunas que existem em registros)
    if (!TIPOS_SOMENTE_EVENTO.includes(tipo)) {
      await supabase.rpc('incrementar_registro', {
        p_data: hoje,
        p_usuario: usuario,
        p_campo: tipo,
        p_delta: 1,
      })
    }

    setSalvando((prev) => {
      const next = new Set(prev)
      next.delete(tipo)
      return next
    })

    // Se for ligação sem sucesso, abrir modal de motivo
    if (tipo === 'ligacoes_falha' && evData?.id) {
      setMotivoModal({ aberto: true, eventoId: evData.id })
      setMotivoTexto('')
      setTimeout(() => motivoInputRef.current?.focus(), 100)
    }
  }

  async function salvarMotivo(motivo: string) {
    if (!motivoModal.eventoId || !motivo.trim()) {
      setMotivoModal({ aberto: false, eventoId: null })
      return
    }

    await supabase
      .from('eventos')
      .update({ motivo_falha: motivo.trim() })
      .eq('id', motivoModal.eventoId)

    setEventos((prev) =>
      prev.map((ev) =>
        ev.id === motivoModal.eventoId ? { ...ev, motivo_falha: motivo.trim() } : ev
      )
    )
    setMotivoModal({ aberto: false, eventoId: null })
    setMotivoTexto('')
  }

  async function excluirEvento(ev: Evento) {
    const hoje = dataHoje()
    setConfirmandoId(null)
    setHoveredEventId(null)

    // Otimista: remove do feed e decrementa contador
    setEventos((prev) => prev.filter((e) => e.id !== ev.id))
    setContadores((prev) => ({ ...prev, [ev.tipo]: Math.max(0, (prev[ev.tipo] ?? 0) - 1) }))

    // Remove do banco
    await supabase.from('eventos').delete().eq('id', ev.id)

    // Decrementa em registros (exceto tipos somente-evento)
    if (!TIPOS_SOMENTE_EVENTO.includes(ev.tipo)) {
      await supabase.rpc('incrementar_registro', {
        p_data: hoje,
        p_usuario: usuario,
        p_campo: ev.tipo,
        p_delta: -1,
      })
    }
  }

  const totalEventosHoje = eventos.length
  const precisaSeq = tierModal.tipo ? TIPOS_TIER_SEQ.includes(tierModal.tipo) : false
  const podeConfirmar = tierSelecionado !== null && (!precisaSeq || sequenciaSelecionada !== null)

  return (
    <div style={{ maxWidth: '480px', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1F1F1F' }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Modo toque rápido</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: '#FAFAF9',
          margin: 0,
        }}>
          Quick Log
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          {totalEventosHoje > 0 && (
            <span style={{ marginLeft: '0.75rem', color: '#34D399' }}>
              · {totalEventosHoje} ação{totalEventosHoje !== 1 ? 'ões' : ''} hoje
            </span>
          )}
        </p>
      </div>

      {/* Seletor de usuário */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['joao_pedro', 'atanael'] as Usuario[]).map((u) => (
          <button
            key={u}
            onClick={() => setUsuario(u)}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              border: '1px solid',
              borderColor: usuario === u ? (u === 'joao_pedro' ? '#60A5FA' : '#34D399') : '#2A2A2A',
              background: usuario === u ? (u === 'joao_pedro' ? '#0F2030' : '#0A2A1A') : 'transparent',
              color: usuario === u ? (u === 'joao_pedro' ? '#60A5FA' : '#34D399') : '#6B7280',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {u === 'joao_pedro' ? 'João Pedro' : 'Atanael'}
          </button>
        ))}
      </div>

      {/* Botões de toque */}
      {carregando ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: '96px', background: '#1A1A1A', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
          {botoes.map(({ tipo, emoji, cor }) => {
            const count = contadores[tipo] ?? 0
            const isSaving = salvando.has(tipo)
            const needsTier = TIPOS_TIER_SEQ.includes(tipo) || TIPOS_TIER_ONLY.includes(tipo)
            return (
              <button
                key={tipo}
                onClick={() => handleBotaoClick(tipo)}
                disabled={isSaving}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#111111',
                  border: `1px solid ${count > 0 ? cor + '40' : '#1F1F1F'}`,
                  borderRadius: '12px',
                  cursor: isSaving ? 'wait' : 'pointer',
                  transition: 'all 0.12s',
                  minHeight: '96px',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  opacity: isSaving ? 0.7 : 1,
                  boxShadow: count > 0 ? `0 0 20px ${cor}18` : 'none',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; e.currentTarget.style.background = '#1A1A1A' }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#111111' }}
                onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; e.currentTarget.style.background = '#1A1A1A' }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#111111' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.25rem' }}>{emoji}</span>
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    {needsTier && (
                      <span style={{ fontSize: '0.55rem', color: cor, border: `1px solid ${cor}60`, borderRadius: '3px', padding: '1px 3px', letterSpacing: '0.04em' }}>
                        TIER
                      </span>
                    )}
                    {isSaving && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cor, animation: 'pulse 0.8s ease-in-out infinite', display: 'block' }} />
                    )}
                  </div>
                </div>

                <div style={{ width: '100%' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    color: count > 0 ? cor : '#3A3A3A',
                    lineHeight: 1,
                    marginBottom: '0.25rem',
                    transition: 'color 0.2s',
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: '0.62rem',
                    color: '#6B7280',
                    letterSpacing: '0.04em',
                    textAlign: 'left',
                    lineHeight: 1.3,
                  }}>
                    {LABEL_EVENTO[tipo]}
                  </div>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  right: '0.75rem',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: cor + '20',
                  border: `1px solid ${cor}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: cor,
                }}>
                  +1
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Feed de eventos */}
      {eventos.length > 0 && (
        <div>
          <p className="section-label" style={{ marginBottom: '1rem' }}>Feed de hoje</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {eventos.map((ev, i) => {
              const cor = COR_EVENTO[ev.tipo] ?? '#6B7280'
              const isHov = hoveredEventId === ev.id
              const isConfirm = confirmandoId === ev.id
              return (
                <div
                  key={ev.id}
                  onMouseEnter={() => { setHoveredEventId(ev.id); if (confirmandoId && confirmandoId !== ev.id) setConfirmandoId(null) }}
                  onMouseLeave={() => { setHoveredEventId(null); setConfirmandoId(null) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.55rem 0.6rem',
                    margin: '0 -0.6rem',
                    borderRadius: '8px',
                    borderBottom: i < eventos.length - 1 ? '1px solid #131313' : 'none',
                    background: isConfirm ? '#2A0A0A' : isHov ? '#161616' : 'transparent',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                >
                  {/* Dot colorido */}
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: cor,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${cor}66`,
                    transition: 'transform 0.15s',
                    transform: isHov ? 'scale(1.4)' : 'scale(1)',
                  }} />

                  {/* Label */}
                  <span style={{ fontSize: '0.75rem', color: isHov ? '#FAFAF9' : '#D1D5DB', flex: 1, transition: 'color 0.15s' }}>
                    {LABEL_EVENTO[ev.tipo]}
                    {ev.tier && (
                      <span style={{ color: '#6B7280', marginLeft: '0.4rem' }}>· T{ev.tier}</span>
                    )}
                    {ev.sequencia_ligacao && (
                      <span style={{ color: '#6B7280', marginLeft: '0.25rem' }}>· {LABEL_SEQUENCIA[ev.sequencia_ligacao]}</span>
                    )}
                    {ev.motivo_falha && (
                      <span style={{ color: '#6B7280', marginLeft: '0.4rem' }}>· {ev.motivo_falha}</span>
                    )}
                  </span>

                  {/* Área direita: horário ou confirmação de exclusão */}
                  {isConfirm ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.65rem', color: '#F87171' }}>Remover?</span>
                      <button
                        onClick={() => excluirEvento(ev)}
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          background: '#F87171',
                          color: '#0A0A0A',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setConfirmandoId(null)}
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.65rem',
                          background: 'transparent',
                          color: '#6B7280',
                          border: '1px solid #2A2A2A',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.68rem',
                        color: isHov ? '#6B7280' : '#4B5563',
                        fontVariantNumeric: 'tabular-nums',
                        transition: 'color 0.15s',
                      }}>
                        {horaFormatada(ev.criado_em)}
                      </span>
                      {/* Botão × — aparece no hover */}
                      <button
                        onClick={() => setConfirmandoId(ev.id)}
                        title="Remover registro"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: '1px solid #3A3A3A',
                          color: '#6B7280',
                          fontSize: '0.6rem',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s',
                          opacity: isHov ? 1 : 0,
                          pointerEvents: isHov ? 'auto' : 'none',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#F8717120'
                          e.currentTarget.style.borderColor = '#F87171'
                          e.currentTarget.style.color = '#F87171'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = '#3A3A3A'
                          e.currentTarget.style.color = '#6B7280'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {eventos.length === 0 && !carregando && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#2A2A2A' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👆</div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Toque um botão para registrar
          </p>
        </div>
      )}

      {/* Modal de TIER (+ sequência para ligações) */}
      {tierModal.aberto && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setTierModal({ aberto: false, tipo: null })}
        >
          <div
            style={{
              background: '#111111',
              border: '1px solid #1F1F1F',
              borderRadius: '16px 16px 0 0',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '32px', height: '3px', background: '#2A2A2A', borderRadius: '2px', margin: '0 auto 1.5rem' }} />
            <p style={{ fontSize: '0.72rem', color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {tierModal.tipo ? LABEL_EVENTO[tierModal.tipo] : ''}
            </p>

            {/* Seleção de TIER */}
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              Tier do lead
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTierSelecionado(t)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 0',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: tierSelecionado === t ? '#60A5FA' : '#2A2A2A',
                    background: tierSelecionado === t ? '#0F2030' : '#1A1A1A',
                    color: tierSelecionado === t ? '#60A5FA' : '#6B7280',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  T{t}
                </button>
              ))}
            </div>

            {/* Seleção de Sequência (só para ligações) */}
            {precisaSeq && (
              <>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  Tipo de contato
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {SEQUENCIAS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSequenciaSelecionada(s)}
                      style={{
                        padding: '0.65rem 0',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: sequenciaSelecionada === s ? '#A78BFA' : '#2A2A2A',
                        background: sequenciaSelecionada === s ? '#1A1030' : '#1A1A1A',
                        color: sequenciaSelecionada === s ? '#A78BFA' : '#6B7280',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                    >
                      {LABEL_SEQUENCIA[s]}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={confirmarTier}
              disabled={!podeConfirmar}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: podeConfirmar ? '#FAFAF9' : '#1A1A1A',
                border: 'none',
                borderRadius: '10px',
                color: podeConfirmar ? '#0A0A0A' : '#3A3A3A',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: podeConfirmar ? 'pointer' : 'default',
                transition: 'all 0.15s',
                letterSpacing: '0.02em',
              }}
            >
              Confirmar
            </button>

            <button
              onClick={() => setTierModal({ aberto: false, tipo: null })}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.6rem',
                background: 'transparent',
                border: 'none',
                color: '#4B5563',
                fontSize: '0.75rem',
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de motivo de falha */}
      {motivoModal.aberto && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setMotivoModal({ aberto: false, eventoId: null })}
        >
          <div
            style={{
              background: '#111111',
              border: '1px solid #1F1F1F',
              borderRadius: '16px 16px 0 0',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '32px', height: '3px', background: '#2A2A2A', borderRadius: '2px', margin: '0 auto 1.5rem' }} />
            <p style={{ fontSize: '0.72rem', color: '#F87171', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Motivo da ligação sem sucesso
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {MOTIVOS_RAPIDOS.map((m) => (
                <button
                  key={m}
                  onClick={() => salvarMotivo(m)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#FAFAF9',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#F87171')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = '#2A2A2A')}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                ref={motivoInputRef}
                type="text"
                value={motivoTexto}
                onChange={(e) => setMotivoTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') salvarMotivo(motivoTexto) }}
                placeholder="Outro motivo..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#FAFAF9',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => salvarMotivo(motivoTexto)}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#F87171',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0A0A0A',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </div>

            <button
              onClick={() => setMotivoModal({ aberto: false, eventoId: null })}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.6rem',
                background: 'transparent',
                border: 'none',
                color: '#4B5563',
                fontSize: '0.75rem',
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              Pular
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
