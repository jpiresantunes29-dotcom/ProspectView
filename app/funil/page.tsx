'use client'

import { useEffect, useState } from 'react'
import type { Registro } from '@/lib/supabase'
import { fetchRegistros } from '@/lib/queryCache'
import { somarRegistros, buildFunil } from '@/lib/metrics'
import FiltroPeriodo, { periodoParaDatas, type Periodo } from '@/components/filtro-periodo'
import AnimatedTitle from '@/components/animated-title'

const BORDER = '1px solid #1F1F1F'
const barColors = ['#60A5FA','#60A5FA','#60A5FA','#34D399','#34D399','#FBBF24','#FBBF24','#F472B6']

export default function FunilPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { inicio, fim } = periodoParaDatas(periodo)
      const data = await fetchRegistros(inicio, fim)
      setRegistros(data)
      setLoading(false)
    }
    fetchData()
  }, [periodo])

  const t = somarRegistros(registros)
  const funil = buildFunil(t)
  const maxValor = funil[0]?.valor || 1

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: BORDER }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>Etapas e conversões</p>
          <AnimatedTitle text="Funil" />
        </div>
        <FiltroPeriodo value={periodo} onChange={setPeriodo} />
      </div>

      {loading ? (
        <p className="section-label">Carregando...</p>
      ) : (
        <div>
          {funil.map((etapa, i) => {
            const pctLargura = maxValor > 0 ? Math.max((etapa.valor / maxValor) * 100, 1) : 1
            const perdas = i < funil.length - 1 ? etapa.valor - funil[i + 1].valor : 0
            return (
              <div key={i}>
                {i > 0 && etapa.taxa && (
                  <div style={{ padding: '0.4rem 0 0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '1px', height: '14px', background: '#2A2A2A' }} />
                    <span style={{ fontSize: '0.65rem', color: '#6B7280', letterSpacing: '0.06em' }}>
                      {etapa.taxa} converteram
                    </span>
                  </div>
                )}
                <div style={{ padding: '1.25rem 0', borderTop: BORDER }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#9CA3AF', letterSpacing: '0.02em' }}>{etapa.label}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                      <span className="metric-number" style={{ fontSize: '2rem', color: barColors[i] }}>{etapa.valor}</span>
                      {i < funil.length - 1 && perdas > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>−{perdas}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ height: '4px', background: '#141414', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pctLargura}%`,
                      background: barColors[i],
                      opacity: 0.6,
                      borderRadius: '99px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              </div>
            )
          })}

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: BORDER, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p className="section-label">Conversão geral</p>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.4rem' }}>empresas encontradas → oportunidades</p>
            </div>
            <span className="metric-number" style={{ color: '#F472B6' }}>
              {maxValor > 0 ? `${Math.round((funil[7].valor / funil[0].valor) * 100)}%` : '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
