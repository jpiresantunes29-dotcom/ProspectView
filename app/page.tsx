'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  type TipoAtividade, type Atividade,
  LABEL_ATIVIDADE, COR_ATIVIDADE, LABEL_STATUS,
} from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import AnimatedTitle from '@/components/animated-title'
import * as XLSX from 'xlsx'

const BORDER = '1px solid var(--border)'

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

  // Agrupar por data e tipo_atividade
  const byDate: Record<string, Record<string, number>> = {}
  atividades.forEach((a) => {
    if (!byDate[a.data]) byDate[a.data] = {}
    byDate[a.data][a.tipo_atividade] = (byDate[a.data][a.tipo_atividade] ?? 0) + 1
  })
  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, counts]) => ({
      data: data.slice(5), // MM-DD
      ...counts,
    }))

  // Quais tipos de atividade aparecem nos dados
  const tiposPresentes = ATIVIDADES.filter((t) =>
    atividades.some((a) => a.tipo_atividade === t)
  )

  // Total por tipo (para resumo)
  const totalPorTipo: Record<string, number> = {}
  atividades.forEach((a) => {
    totalPorTipo[a.tipo_atividade] = (totalPorTipo[a.tipo_atividade] ?? 0) + 1
  })

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
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: BORDER,
      }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>Atanael</p>
          <AnimatedTitle text="Dashboard" />
        </div>

        {/* Filtro de período */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '0.25rem' }}>
          {(['7d', '30d', '90d'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              style={{
                padding: '5px 12px',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                borderRadius: '3px',
                border: `1px solid ${periodo === p ? '#0078D4' : 'var(--border)'}`,
                background: periodo === p ? 'rgba(0,120,212,0.1)' : 'transparent',
                color: periodo === p ? '#4DA3F7' : 'var(--muted-foreground)',
                cursor: 'pointer',
                transition: 'all 0.12s',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{
          height: '420px',
          background: 'var(--surface)',
          border: BORDER,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>Carregando...</p>
        </div>
      ) : atividades.length === 0 ? (
        /* Empty state */
        <div style={{
          height: '420px',
          background: 'var(--surface)',
          border: BORDER,
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
            Nenhuma atividade registrada
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', opacity: 0.6 }}>
            {periodoLabel(periodo)} · Use a página Contato para registrar atividades
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Resumo por tipo */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tiposPresentes.map((t) => (
              <div key={t} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 12px',
                background: 'var(--surface)',
                border: BORDER,
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 500,
                color: 'var(--foreground)',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: COR_ATIVIDADE[t],
                  flexShrink: 0,
                  display: 'inline-block',
                }} />
                {LABEL_ATIVIDADE[t]}
                <span style={{
                  marginLeft: '2px',
                  fontWeight: 700,
                  color: COR_ATIVIDADE[t],
                }}>
                  {totalPorTipo[t] ?? 0}
                </span>
              </div>
            ))}
          </div>

          {/* Gráfico principal */}
          <div style={{
            background: 'var(--surface)',
            border: BORDER,
            borderRadius: '6px',
            padding: '1.5rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}>
              <p style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--muted-foreground)',
              }}>
                Atividades por dia — {periodoLabel(periodo)}
              </p>
              <span style={{
                fontSize: '0.65rem',
                color: 'var(--muted-foreground)',
                fontWeight: 500,
              }}>
                {atividades.length} registros
              </span>
            </div>

            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={chartData}
                barCategoryGap="35%"
                barGap={2}
                margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="data"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    color: 'var(--foreground)',
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(value, name) => [
                    value,
                    LABEL_ATIVIDADE[name as TipoAtividade] ?? name,
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{
                    fontSize: '0.65rem',
                    color: 'var(--muted-foreground)',
                    paddingTop: '1rem',
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
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
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Botão exportar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={exportarExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 18px',
                background: 'transparent',
                border: BORDER,
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--foreground)',
                cursor: 'pointer',
                transition: 'border-color 0.12s, background 0.12s',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#107C10'
                e.currentTarget.style.background = 'rgba(16,124,16,0.08)'
                e.currentTarget.style.color = '#4EC94E'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--foreground)'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exportar para Excel
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
