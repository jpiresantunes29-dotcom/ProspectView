'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Registro, Atividade } from '@/lib/supabase'
import { LABEL_ATIVIDADE, COR_ATIVIDADE } from '@/lib/supabase'
import AnimatedTitle from '@/components/animated-title'
import { showToast } from '@/components/toast'

const BORDER = '1px solid var(--border)'

function fmtData(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

type Chip = { label: string; tooltip: string; value: number; color: string }

function chipsJP(r: Registro): Chip[] {
  return [
    { label: 'Emp',  tooltip: 'Empresas encontradas',  value: r.empresas_encontradas, color: '#4DA3F7' },
    { label: 'Qual', tooltip: 'Leads qualificados',    value: r.leads_qualificados,   color: '#4DA3F7' },
    { label: 'CRM',  tooltip: 'Leads enviados ao CRM', value: r.leads_enviados_crm,   color: '#4DA3F7' },
  ]
}

function chipsAT(r: Registro): Chip[] {
  return [
    { label: 'Cont', tooltip: 'Leads contatados',   value: r.leads_contatados,  color: '#2DB881' },
    { label: 'Resp', tooltip: 'Respostas',           value: r.respostas,         color: '#2DB881' },
    { label: 'Reun', tooltip: 'Reuniões marcadas',   value: r.reunioes_marcadas, color: '#2DB881' },
  ]
}

// Agrupa atividades por data → contagem por tipo
function agruparAtividades(atividades: Atividade[]): Map<string, Record<string, number>> {
  const mapa = new Map<string, Record<string, number>>()
  for (const a of atividades) {
    if (!mapa.has(a.data)) mapa.set(a.data, {})
    const dia = mapa.get(a.data)!
    dia[a.tipo_atividade] = (dia[a.tipo_atividade] ?? 0) + 1
  }
  return mapa
}

type FiltroUsuario = 'todos' | 'joao_pedro' | 'atanael'

export default function HistoricoPage() {
  const [registros,   setRegistros]   = useState<Registro[]>([])
  const [atividades,  setAtividades]  = useState<Atividade[]>([])
  const [loading,     setLoading]     = useState(true)
  const [confirmId,   setConfirmId]   = useState<string | null>(null)
  const [filtroUsuario, setFiltroUsuario] = useState<FiltroUsuario>('todos')
  const [ordemInversa,  setOrdemInversa]  = useState(false)

  const pendingDelete = useRef<Map<string, { registro: Registro; timerId: ReturnType<typeof setTimeout> }>>(new Map())

  useEffect(() => {
    Promise.all([
      supabase.from('registros').select('*').order('data', { ascending: false }),
      supabase.from('atividades').select('*').eq('usuario', 'atanael').order('data', { ascending: false }),
    ]).then(([regRes, atRes]) => {
      setRegistros((regRes.data as Registro[]) ?? [])
      setAtividades((atRes.data as Atividade[]) ?? [])
      setLoading(false)
    })
  }, [])

  function iniciarExclusao(id: string) {
    setConfirmId(null)
    const registro = registros.find(r => r.id === id)
    if (!registro) return
    setRegistros(prev => prev.filter(r => r.id !== id))
    const timerId = setTimeout(async () => {
      pendingDelete.current.delete(id)
      await supabase.from('registros').delete().eq('id', id)
    }, 5000)
    pendingDelete.current.set(id, { registro, timerId })
    showToast('Registro excluído.', {
      type: 'info',
      duration: 5000,
      action: { label: 'DESFAZER', onClick: () => desfazerExclusao(id) },
    })
  }

  function desfazerExclusao(id: string) {
    const entry = pendingDelete.current.get(id)
    if (!entry) return
    clearTimeout(entry.timerId)
    pendingDelete.current.delete(id)
    setRegistros(prev => {
      const novo = [...prev, entry.registro]
      novo.sort((a, b) => (a.data > b.data ? -1 : 1))
      return novo
    })
  }

  const isJP = (r: Registro) => r.usuario === 'joao_pedro'

  const exibidos = registros
    .filter(r => filtroUsuario === 'todos' || r.usuario === filtroUsuario)
    .slice()
    .sort((a, b) => ordemInversa
      ? (a.data > b.data ? 1 : -1)
      : (a.data > b.data ? -1 : 1)
    )

  // Atividades agrupadas por dia (só mostra se filtro inclui atanael)
  const atividadesAgrupadas = agruparAtividades(atividades)
  const mostrarAtividades = filtroUsuario === 'todos' || filtroUsuario === 'atanael'

  // Datas com atividades que NÃO têm registro correspondente na tabela registros
  const datasComRegistroAT = new Set(
    registros.filter(r => r.usuario === 'atanael').map(r => r.data)
  )

  const filtroLabels: { key: FiltroUsuario; label: string; color: string }[] = [
    { key: 'todos',      label: 'Todos',      color: 'var(--muted-foreground)' },
    { key: 'joao_pedro', label: 'João Pedro', color: '#4DA3F7' },
    { key: 'atanael',    label: 'Atanael',    color: '#2DB881' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: BORDER }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Todos os registros</p>
        <AnimatedTitle text="Histórico" />
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {filtroLabels.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFiltroUsuario(key)}
            style={{
              padding: '4px 12px',
              fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.03em',
              border: '1px solid', borderRadius: 'var(--radius)', cursor: 'pointer',
              transition: 'all 0.12s', fontFamily: "'Segoe UI', system-ui, sans-serif",
              borderColor: filtroUsuario === key ? color : 'var(--border)',
              background:  filtroUsuario === key ? `${color}14` : 'transparent',
              color:       filtroUsuario === key ? color : 'var(--muted-foreground)',
            }}
          >
            {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setOrdemInversa(v => !v)}
          style={{
            padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600,
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            cursor: 'pointer', background: 'transparent', color: 'var(--muted-foreground)',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          {ordemInversa ? '↑ Antigos' : '↓ Recentes'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: '52px', background: 'var(--surface)', border: BORDER, borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

          {/* ── Registros diários ────────────────────────────────────── */}
          {exibidos.map((r) => {
            const jp    = isJP(r)
            const cor   = jp ? '#4DA3F7' : '#2DB881'
            const nome  = jp ? 'João Pedro' : 'Atanael'
            const chips = jp ? chipsJP(r) : chipsAT(r)
            const isConf = confirmId === r.id

            return (
              <div
                key={r.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.875rem',
                  background: isConf ? 'rgba(248,113,113,0.05)' : 'var(--surface)',
                  border: `1px solid ${isConf ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', transition: 'border-color 0.12s',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: '72px' }}>
                  {fmtData(r.data)}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: cor, flexShrink: 0, minWidth: '80px' }}>
                  {nome}
                </span>
                <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                  {chips.map(({ label, tooltip, value }) => (
                    <span key={label} title={tooltip} style={{
                      fontSize: '0.65rem', fontWeight: 600,
                      color: value > 0 ? cor : 'var(--muted-foreground)',
                      background: value > 0 ? `${cor}14` : 'transparent',
                      border: `1px solid ${value > 0 ? `${cor}30` : 'var(--border)'}`,
                      borderRadius: '3px', padding: '2px 7px',
                      fontVariantNumeric: 'tabular-nums',
                      fontFamily: "'Segoe UI', system-ui, sans-serif",
                      opacity: value === 0 ? 0.45 : 1, cursor: 'default',
                    }}>
                      {label} {value}
                    </span>
                  ))}
                </div>

                {isConf ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.65rem', color: '#F87171' }}>Excluir?</span>
                    <button onClick={() => iniciarExclusao(r.id)} style={{ padding: '2px 10px', fontSize: '0.65rem', fontWeight: 700, background: '#F87171', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Sim</button>
                    <button onClick={() => setConfirmId(null)} style={{ padding: '2px 10px', fontSize: '0.65rem', background: 'transparent', color: 'var(--muted-foreground)', border: '1px solid var(--border)', borderRadius: '3px', cursor: 'pointer' }}>Não</button>
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
                  >×</button>
                )}
              </div>
            )
          })}

          {/* ── Atividades do Atanael (dias sem registro na tabela registros) ── */}
          {mostrarAtividades && Array.from(atividadesAgrupadas.entries())
            .filter(([data]) => !datasComRegistroAT.has(data))
            .sort(([a], [b]) => ordemInversa ? (a > b ? 1 : -1) : (a > b ? -1 : 1))
            .map(([data, contagens]) => {
              const tipos = Object.entries(contagens).sort((a, b) => b[1] - a[1])
              return (
                <div
                  key={`at-${data}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.875rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: '72px' }}>
                    {fmtData(data)}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2DB881', flexShrink: 0, minWidth: '80px' }}>
                    Atanael
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                    {tipos.map(([tipo, count]) => (
                      <span key={tipo} title={LABEL_ATIVIDADE[tipo as keyof typeof LABEL_ATIVIDADE]} style={{
                        fontSize: '0.65rem', fontWeight: 600,
                        color: COR_ATIVIDADE[tipo as keyof typeof COR_ATIVIDADE] ?? '#2DB881',
                        background: `${COR_ATIVIDADE[tipo as keyof typeof COR_ATIVIDADE] ?? '#2DB881'}14`,
                        border: `1px solid ${COR_ATIVIDADE[tipo as keyof typeof COR_ATIVIDADE] ?? '#2DB881'}30`,
                        borderRadius: '3px', padding: '2px 7px',
                        fontVariantNumeric: 'tabular-nums',
                        fontFamily: "'Segoe UI', system-ui, sans-serif",
                        cursor: 'default',
                      }}>
                        {tipo === 'cold_call' ? 'Cold' :
                         tipo === 'whatsapp' ? 'WA' :
                         tipo === 'agendamento_reuniao' ? 'Agend' :
                         tipo === 'follow_up' ? 'FUP' :
                         tipo === 'proposta' ? 'Prop' :
                         tipo === 'negocio_fechado' ? 'Fechado' :
                         tipo === 'reuniao_realizada' ? 'Reun ✓' :
                         tipo === 'reuniao_furada' ? 'Reun ✗' : tipo} {count}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })
          }

          {exibidos.length === 0 && (!mostrarAtividades || atividadesAgrupadas.size === 0) && (
            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>Nenhum registro encontrado.</p>
          )}

          {(exibidos.length > 0 || (mostrarAtividades && atividadesAgrupadas.size > 0)) && (
            <p style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', marginTop: '0.75rem', opacity: 0.6 }}>
              {exibidos.length} registro{exibidos.length !== 1 ? 's' : ''} · Para editar, vá em Registrar e selecione a data.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
