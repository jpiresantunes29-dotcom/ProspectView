'use client'

import { useEffect, useState } from 'react'
import type { Registro } from '@/lib/supabase'
import { fetchRegistros } from '@/lib/queryCache'
import { somarRegistros, pct, diasUteis, porDia } from '@/lib/metrics'
import MetricCard from '@/components/metric-card'
import { MetricCardSkeleton } from '@/components/skeleton'
import FiltroPeriodo, { periodoParaDatas, periodoAnteriorDatas, type Periodo } from '@/components/filtro-periodo'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import AnimatedTitle from '@/components/animated-title'
import { getMetas, type Metas } from '@/lib/metas'

const BORDER = '1px solid #1F1F1F'
const tooltipStyle = { fontSize: 12, background: '#141414', border: '1px solid #1F1F1F', borderRadius: 4, color: '#FAFAF9' }

export default function ContatoPage() {
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
        fetchRegistros(inicio, fim, 'atanael'),
        fetchRegistros(pInicio, pFim, 'atanael'),
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

  const porSemana: Record<string, { semana: string; contatados: number; respostas: number; interessados: number }> = {}
  registros.forEach((r) => {
    const d = new Date(r.data + 'T00:00:00')
    const dom = new Date(d); dom.setDate(d.getDate() - d.getDay())
    const key = dom.toISOString().slice(0, 10)
    if (!porSemana[key]) porSemana[key] = { semana: key.slice(5), contatados: 0, respostas: 0, interessados: 0 }
    porSemana[key].contatados += r.leads_contatados
    porSemana[key].respostas += r.respostas
    porSemana[key].interessados += r.interessados
  })
  const graficoSemanal = Object.values(porSemana)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: BORDER }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>Atanael</p>
          <AnimatedTitle text="Contato" />
        </div>
        <FiltroPeriodo value={periodo} onChange={setPeriodo} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 2.5rem' }}>
          {Array.from({ length: 7 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 2.5rem' }}>
            <MetricCard label="Leads contatados" value={t.leads_contatados} color="contato"
              prev={prevT.leads_contatados} meta={metas?.leads_contatados} dias={dias} />
            <MetricCard label="Respostas" value={t.respostas} sub={`Taxa: ${pct(t.respostas, t.leads_contatados)}`} color="contato"
              prev={prevT.respostas} meta={metas?.respostas} dias={dias} />
            <MetricCard label="Interessados" value={t.interessados} sub={`Taxa: ${pct(t.interessados, t.respostas)}`} color="contato"
              prev={prevT.interessados} meta={metas?.interessados} dias={dias} />
            <MetricCard label="Reuniões marcadas" value={t.reunioes_marcadas} sub={`Taxa: ${pct(t.reunioes_marcadas, t.interessados)}`} color="taxa"
              prev={prevT.reunioes_marcadas} meta={metas?.reunioes_marcadas} dias={dias} />
            <MetricCard label="Oportunidades" value={t.oportunidades} color="resultado"
              prev={prevT.oportunidades} meta={metas?.oportunidades} dias={dias} />
            <MetricCard label="Contatados por dia" value={porDia(t.leads_contatados, dias)} sub={`${dias} dias úteis`} color="produtividade" />
            <MetricCard label="Respostas por dia" value={porDia(t.respostas, dias)} color="produtividade" />
          </div>

          {graficoSemanal.length > 0 && (
            <section>
              <p className="section-label" style={{ marginBottom: '1.5rem' }}>Contatados · Responderam · Interessados</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={graficoSemanal} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="1 4" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff05' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }} />
                  <Bar dataKey="contatados" name="Contatados" fill="#34D399" opacity={0.3} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="respostas" name="Responderam" fill="#34D399" opacity={0.6} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="interessados" name="Interessados" fill="#34D399" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
