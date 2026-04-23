'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Registro } from '@/lib/supabase'
import { fetchRegistros } from '@/lib/queryCache'
import { somarRegistros, pct, diasUteis, porDia } from '@/lib/metrics'
import MetricCard from '@/components/metric-card'
import { MetricCardSkeleton } from '@/components/skeleton'
import FiltroPeriodo, { periodoParaDatas, periodoAnteriorDatas, type Periodo } from '@/components/filtro-periodo'
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line } from 'recharts'
import PageHeader from '@/components/ui/page-header'
import EmptyState from '@/components/ui/empty-state'
import DrillDownPanel, { type DrillRow } from '@/components/dashboard/drill-down-panel'
import { getMetas, type Metas } from '@/lib/metas'

type KpiKey = 'empresas_encontradas' | 'leads_qualificados' | 'leads_enviados_crm'

const KPI_LABELS: Record<KpiKey, string> = {
  empresas_encontradas: 'Empresas encontradas',
  leads_qualificados: 'Leads qualificados',
  leads_enviados_crm: 'Enviados ao CRM',
}

const tooltipStyle = {
  fontSize: 12,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--foreground)',
}

function FunnelArrow({ taxa }: { taxa: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 1rem',
      flexShrink: 0,
      gap: '6px',
    }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F0A830', fontVariantNumeric: 'tabular-nums' }}>{taxa}</span>
      <svg width="28" height="8" viewBox="0 0 28 8" fill="none">
        <path d="M0 4H22M22 4L18 1M22 4L18 7" stroke="var(--border-hover)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: '0.52rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted-foreground)', fontWeight: 500 }}>conversão</span>
    </div>
  )
}

export default function CaptacaoPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [registros, setRegistros] = useState<Registro[]>([])
  const [prevRegistros, setPrevRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [metas, setMetas] = useState<Metas | null>(null)
  const [drillKpi, setDrillKpi] = useState<KpiKey | null>(null)

  useEffect(() => { setMetas(getMetas()) }, [])

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

  const graficoDiario = registros.map((r) => ({
    data: r.data.slice(5),
    encontrados: r.empresas_encontradas,
    enviados: r.leads_enviados_crm,
  }))

  const drillRows: DrillRow[] = useMemo(() => {
    if (!drillKpi) return []
    return [...registros]
      .filter((r) => (r[drillKpi] ?? 0) > 0)
      .sort((a, b) => b.data.localeCompare(a.data))
      .map((r) => ({
        data: r.data.slice(5),
        label: KPI_LABELS[drillKpi],
        color: '#4DA3F7',
        value: r[drillKpi] ?? 0,
        detail: `${r.data} · João Pedro`,
      }))
  }, [drillKpi, registros])

  const drillTotal = drillKpi ? t[drillKpi] : undefined

  return (
    <div>
      <PageHeader
        eyebrow="João Pedro"
        title="Captação"
        subtitle="Métricas de prospecção no período selecionado"
        actions={<FiltroPeriodo value={periodo} onChange={setPeriodo} />}
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      ) : registros.length === 0 ? (
        <EmptyState
          title="Nenhum registro no período"
          description="Ainda não há registros de captação para este intervalo. Registre pela página Registrar."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

          {/* Funil de captação */}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <MetricCard
                label="Empresas encontradas"
                value={t.empresas_encontradas}
                sub={`${porDia(t.empresas_encontradas, dias)} / dia`}
                color="captacao"
                prev={prevT.empresas_encontradas}
                meta={metas?.empresas_encontradas}
                dias={dias}
                onClick={() => setDrillKpi('empresas_encontradas')}
              />
            </div>

            <FunnelArrow taxa={pct(t.leads_qualificados, t.empresas_encontradas)} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <MetricCard
                label="Leads qualificados"
                value={t.leads_qualificados}
                sub={`${porDia(t.leads_qualificados, dias)} / dia`}
                color="captacao"
                prev={prevT.leads_qualificados}
                meta={metas?.leads_qualificados}
                dias={dias}
                onClick={() => setDrillKpi('leads_qualificados')}
              />
            </div>

            <FunnelArrow taxa={pct(t.leads_enviados_crm, t.leads_qualificados)} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <MetricCard
                label="Enviados ao CRM"
                value={t.leads_enviados_crm}
                sub={`${porDia(t.leads_enviados_crm, dias)} / dia`}
                color="captacao"
                prev={prevT.leads_enviados_crm}
                meta={metas?.leads_enviados_crm}
                dias={dias}
                onClick={() => setDrillKpi('leads_enviados_crm')}
              />
            </div>
          </div>

          {graficoDiario.length > 0 && (
            <section className="uci-card" style={{ padding: '1.5rem' }}>
              <p className="section-label" style={{ marginBottom: '1.25rem' }}>Captação por dia</p>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={graficoDiario} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="1 4" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff05' }} />
                  <Bar dataKey="encontrados" name="Encontrados" fill="#60A5FA" opacity={0.35} radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="enviados" name="Enviados ao CRM" stroke="#60A5FA" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </section>
          )}

        </div>
      )}

      <DrillDownPanel
        open={drillKpi !== null}
        onClose={() => setDrillKpi(null)}
        title={drillKpi ? KPI_LABELS[drillKpi] : ''}
        subtitle={`Período: ${periodo} · João Pedro`}
        total={drillTotal}
        rows={drillRows}
      />
    </div>
  )
}
