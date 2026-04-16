'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Registro } from '@/lib/supabase'
import AnimatedTitle from '@/components/animated-title'
import { Skeleton } from '@/components/skeleton'

const BORDER = '1px solid #1F1F1F'

const COLS: { key: keyof Registro | 'usuario_label'; header: string }[] = [
  { key: 'data', header: 'Data' },
  { key: 'usuario_label', header: 'Usuário' },
  { key: 'empresas_encontradas', header: 'Emp.' },
  { key: 'leads_qualificados', header: 'Qualif.' },
  { key: 'leads_enviados_crm', header: 'CRM' },
  { key: 'leads_contatados', header: 'Contat.' },
  { key: 'respostas', header: 'Resp.' },
  { key: 'interessados', header: 'Interes.' },
  { key: 'reunioes_marcadas', header: 'Reun.' },
  { key: 'oportunidades', header: 'Opor.' },
]

export default function HistoricoPage() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState<string | null>(null)

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

  async function handleExcluir(id: string) {
    setExcluindo(id)
    const { error } = await supabase.from('registros').delete().eq('id', id)
    if (!error) {
      setRegistros((prev) => prev.filter((r) => r.id !== id))
    }
    setExcluindo(null)
    setConfirmando(null)
  }

  return (
    <div>
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: BORDER }}>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Todos os registros</p>
        <AnimatedTitle text="Histórico" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} h="2.5rem" />
          ))}
        </div>
      ) : registros.length === 0 ? (
        <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>Nenhum registro encontrado.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                {COLS.map(({ key, header }) => (
                  <th
                    key={key}
                    style={{
                      padding: '0.5rem 0.75rem',
                      textAlign: key === 'data' || key === 'usuario_label' ? 'left' : 'right',
                      color: '#6B7280',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontSize: '0.58rem',
                      borderBottom: BORDER,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {header}
                  </th>
                ))}
                <th style={{ borderBottom: BORDER, width: '2rem' }} />
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => {
                const isConfirmando = confirmando === r.id
                const isExcluindo = excluindo === r.id

                if (isConfirmando) {
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #141414', background: '#1a0a0a' }}>
                      <td colSpan={COLS.length + 1} style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#F87171' }}>
                            Excluir registro de {r.data} ({r.usuario === 'joao_pedro' ? 'João Pedro' : 'Atanael'})?
                          </span>
                          <button
                            onClick={() => handleExcluir(r.id)}
                            disabled={isExcluindo}
                            style={{
                              padding: '0.3rem 0.75rem',
                              fontSize: '0.68rem',
                              fontWeight: 500,
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              background: '#7f1d1d',
                              color: '#FCA5A5',
                              border: '1px solid #991b1b',
                              borderRadius: '3px',
                              cursor: isExcluindo ? 'wait' : 'pointer',
                              opacity: isExcluindo ? 0.6 : 1,
                            }}
                          >
                            {isExcluindo ? 'Excluindo...' : 'Confirmar'}
                          </button>
                          <button
                            onClick={() => setConfirmando(null)}
                            disabled={isExcluindo}
                            style={{
                              padding: '0.3rem 0.75rem',
                              fontSize: '0.68rem',
                              fontWeight: 500,
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              background: 'transparent',
                              color: '#6B7280',
                              border: '1px solid #2A2A2A',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr
                    key={r.id}
                    className="historico-row"
                    style={{ borderBottom: '1px solid #141414', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#111111'
                      const btn = e.currentTarget.querySelector<HTMLElement>('.delete-btn')
                      if (btn) btn.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      const btn = e.currentTarget.querySelector<HTMLElement>('.delete-btn')
                      if (btn) btn.style.opacity = '0'
                    }}
                  >
                    <td style={{ padding: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {r.data}
                    </td>
                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap', color: r.usuario === 'joao_pedro' ? '#60A5FA' : '#34D399' }}>
                      {r.usuario === 'joao_pedro' ? 'João Pedro' : 'Atanael'}
                    </td>
                    {(['empresas_encontradas', 'leads_qualificados', 'leads_enviados_crm', 'leads_contatados', 'respostas', 'interessados', 'reunioes_marcadas', 'oportunidades'] as (keyof Registro)[]).map((k) => (
                      <td key={k} style={{ padding: '0.75rem', textAlign: 'right', color: '#FAFAF9', fontVariantNumeric: 'tabular-nums' }}>
                        {(r[k] as number) || 0}
                      </td>
                    ))}
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        className="delete-btn"
                        onClick={() => setConfirmando(r.id)}
                        title="Excluir registro"
                        style={{
                          opacity: 0,
                          transition: 'opacity 0.15s',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.1rem 0.25rem',
                          color: '#6B7280',
                          fontSize: '0.85rem',
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p style={{ fontSize: '0.65rem', color: '#4B5563', marginTop: '1.5rem' }}>
            {registros.length} registros · Para editar, vá em Registrar e selecione a data desejada.
          </p>
        </div>
      )}
    </div>
  )
}
