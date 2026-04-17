'use client'

import { useEffect, useState } from 'react'
import type { Registro } from '@/lib/supabase'
import { fetchRegistros } from '@/lib/queryCache'
import { somarRegistros, pct, diasUteis, porDia } from '@/lib/metrics'
import MetricCard from '@/components/metric-card'
import { MetricCardSkeleton } from '@/components/skeleton'
import FiltroPeriodo, { periodoParaDatas, periodoAnteriorDatas, type Periodo } from '@/components/filtro-periodo'
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line } from 'recharts'
import AnimatedTitle from '@/components/animated-title'
import { getMetas, type Metas } from '@/lib/metas'

const BORDER = '1px solid #1F1F1F'
const tooltipStyle = { fontSize: 12, background: '#141414', border: '1px solid #1F1F1F', borderRadius: 4, color: '#FAFAF9' }

export default function CaptacaoPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [registros, setRegistros] = useState<Registro[]>([])
  const [prevRegistros, setPrevRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [metas, setMetas] = useState<Metas | null>(null)

  useEffect(() => {
    setMetas(getMetas())
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { inicio, fim } = periodoParaDatas(periodo)
      const { inicio: pInicio, fim: pFim } = periodoAnteriorDatas(periodo)
      const [curr, prev] = await Promise.all([
        fetchRegistros(inicio, fim, 'joao_pedro'),
        fetchRegistros(pInicio, pFim, 'joao_pedro'),
      ])
      setRegistros(curr)
      setPrevRegistros(prev)
      setLoading(false)
    }
    fetchData()
  }, [periodo])

  const t = somarRegistros(registros)
  const prevT = somarRegistros(prevRegistros)
  const { inicio, fim } = periodoParaDatas(periodo)
  const dias = diasUteis(new Date(inicio), new Date(fim))

  const graficoDiario = registros.map((r) => ({ data: r.data.slice(5), encontrados: r.empresas_encontradas, enviados: r.leads_enviados_crm }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: BORDER }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>João Pedro</p>
          <AnimatedTitle text="Captação" />
        </div>
        <FiltroPeriodo value={periodo} onChange={setPeriodo} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 2.5rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 2.5rem' }}>
            <MetricCard label="Empresas encontradas" value={t.empresas_encontradas} color="captacao"
              prev={prevT.empresas_encontradas} meta={metas?.empresas_encontradas} dias={dias} />
            <MetricCard label="Leads qualificados" value={t.leads_qualificados} sub={`Taxa: ${pct(t.leads_qualificados, t.empresas_encontradas)}`} color="captacao"
              prev={prevT.leads_qualificados} meta={metas?.leads_qualificados} dias={dias} />
            <MetricCard label="Enviados ao CRM" value={t.leads_enviados_crm} sub={`Taxa: ${pct(t.leads_enviados_crm, t.leads_qualificados)}`} color="captacao"
              prev={prevT.leads_enviados_crm} meta={metas?.leads_enviados_crm} dias={dias} />
            <MetricCard label="Encontrados por dia" value={porDia(t.empresas_encontradas, dias)} sub={`${dias} dias úteis`} color="produtividade" />
            <MetricCard label="Qualificados por dia" value={porDia(t.leads_qualificados, dias)} color="produtividade" />
            <MetricCard label="Enviados por dia" value={porDia(t.leads_enviados_crm, dias)} color="produtividade" />
          </div>

          {graficoDiario.length > 0 && (
            <section>
              <p className="section-label" style={{ marginBottom: '1.5rem' }}>Captação por dia</p>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={graficoDiario} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="1 4" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff05' }} />
                  <Bar dataKey="encontrados" name="Encontrados" fill="#60A5FA" opacity={0.35} radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="enviados" name="Enviados ao CRM" stroke="#60A5FA" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
