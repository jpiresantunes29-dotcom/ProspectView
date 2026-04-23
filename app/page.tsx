'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import {
  type TipoAtividade, type Atividade,
  LABEL_ATIVIDADE, COR_ATIVIDADE, LABEL_STATUS,
} from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import PageHeader from '@/components/ui/page-header'
import EmptyState from '@/components/ui/empty-state'
import FilterPill from '@/components/ui/filter-pill'
import DrillDownPanel, { type DrillRow } from '@/components/dashboard/drill-down-panel'
import * as XLSX from 'xlsx'

const ATIVIDADES: TipoAtividade[] = [
  'cold_call', 'whatsapp', 'agendamento_reuniao', 'follow_up',
  'proposta', 'negocio_fechado', 'reuniao_realizada', 'reuniao_furada',
]

type Periodo = '7d' | '30d' | '90d'

function periodoLabel(p: Periodo) {
  return p === '7d' ? 'Últimos 7 dias' : p === '30d' ? 'Últimos 30 dias' : 'Últimos 90 dias'
}

function periodoInicio(p: Periodo): string {
  const d = new Date()
  const dias = p === '7d' ? 7 : p === '30d' ? 30 : 90
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [drillTipo, setDrillTipo] = useState<TipoAtividade | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const inicio = periodoInicio(periodo)
      const hoje = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .gte('data', inicio)
        .lte('data', hoje)
        .order('data', { ascending: true })
      if (!error && data) setAtividades(data as Atividade[])
      setLoading(false)
    }
    fetchData()
  }, [periodo])

  const byDate: Record<string, Record<string, number>> = {}
  atividades.forEach((a) => {
    if (!byDate[a.data]) byDate[a.data] = {}
    byDate[a.data][a.tipo_atividade] = (byDate[a.data][a.tipo_atividade] ?? 0) + 1
  })
  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, counts]) => ({ data: data.slice(5), ...counts }))

  const tiposPresentes = ATIVIDADES.filter((t) => atividades.some((a) => a.tipo_atividade === t))

  const totalPorTipo: Record<string, number> = {}
  atividades.forEach((a) => {
    totalPorTipo[a.tipo_atividade] = (totalPorTipo[a.tipo_atividade] ?? 0) + 1
  })

  const drillRows: DrillRow[] = useMemo(() => {
    if (!drillTipo) return []
    return atividades
      .filter((a) => a.tipo_atividade === drillTipo)
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
      .map((a) => ({
        data: a.data.slice(5),
        hora: new Date(a.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        label: LABEL_ATIVIDADE[a.tipo_atividade],
        color: COR_ATIVIDADE[a.tipo_atividade],
        detail: [
          a.tier ? `T${a.tier}` : null,
          a.tentativa ? `${a.tentativa}ª tentativa` : null,
          a.status_contato ? LABEL_STATUS[a.status_contato] : null,
        ].filter(Boolean).join(' · ') || a.usuario,
      }))
  }, [drillTipo, atividades])

  function exportarExcel() {
    const rows = atividades.map((a) => ({
      Data: a.data,
      Usuário: a.usuario,
      Tier: a.tier,
      Atividade: LABEL_ATIVIDADE[a.tipo_atividade] ?? a.tipo_atividade,
      'Status do Contato': a.status_contato ? LABEL_STATUS[a.status_contato] : '',
      Tentativa: a.tentativa ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Atividades')
    XLSX.writeFile(wb, `atividades-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Atanael"
        title="Dashboard"
        subtitle={`${periodoLabel(periodo)} · ${atividades.length} atividades`}
        actions={
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['7d', '30d', '90d'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className="uci-btn"
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${periodo === p ? '#0078D4' : 'var(--border)'}`,
                  background: periodo === p ? 'rgba(0,120,212,0.1)' : 'transparent',
                  color: periodo === p ? '#4DA3F7' : 'var(--muted-foreground)',
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={exportarExcel}
              className="uci-btn uci-btn--secondary"
              style={{ marginLeft: '6px' }}
              title="Exportar para Excel"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Excel
            </button>
          </div>
        }
        filters={<FilterPill label="Período" value={periodoLabel(periodo)} />}
      />

      {loading ? (
        <div style={{
          height: '420px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>Carregando...</p>
        </div>
      ) : atividades.length === 0 ? (
        <EmptyState
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          title="Nenhuma atividade registrada"
          description={`${periodoLabel(periodo)}. Use a página Registrar para começar a acompanhar atividades.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Resumo por tipo (chips clicáveis) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tiposPresentes.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setDrillTipo(tipo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '5px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  color: 'var(--foreground)',
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  cursor: 'pointer',
                  transition: 'border-color 0.12s ease, transform 0.1s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COR_ATIVIDADE[tipo] }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: COR_ATIVIDADE[tipo], flexShrink: 0,
                }} />
                {LABEL_ATIVIDADE[tipo]}
                <span style={{ marginLeft: '2px', fontWeight: 700, color: COR_ATIVIDADE[tipo] }}>
                  {totalPorTipo[tipo] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Gráfico principal */}
          <div className="uci-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <p className="section-label">Atividades por dia</p>
              <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {atividades.length} registros · clique em um tipo para ver detalhes
              </span>
            </div>

            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartData} barCategoryGap="35%" barGap={2} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--foreground)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(value, name) => [value, LABEL_ATIVIDADE[name as TipoAtividade] ?? name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', paddingTop: '1rem', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                  formatter={(value) => LABEL_ATIVIDADE[value as TipoAtividade] ?? value}
                />
                {tiposPresentes.map((t) => (
                  <Bar
                    key={t}
                    dataKey={t}
                    name={t}
                    fill={COR_ATIVIDADE[t]}
                    radius={[2, 2, 0, 0]}
                    opacity={0.9}
                    stackId="a"
                    onClick={() => setDrillTipo(t)}
                    cursor="pointer"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      <DrillDownPanel
        open={drillTipo !== null}
        onClose={() => setDrillTipo(null)}
        title={drillTipo ? LABEL_ATIVIDADE[drillTipo] : ''}
        subtitle={`${periodoLabel(periodo)} · Atanael`}
        total={drillTipo ? (totalPorTipo[drillTipo] ?? 0) : undefined}
        rows={drillRows}
      />
    </div>
  )
}
