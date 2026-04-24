'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  type Registro, type Atividade, type TipoAtividade,
  LABEL_ATIVIDADE, COR_ATIVIDADE,
} from '@/lib/supabase'
import { somarRegistros, pct } from '@/lib/metrics'
import { fetchRegistros } from '@/lib/queryCache'
import { periodoParaDatas, periodoAnteriorDatas, type Periodo } from '@/components/filtro-periodo'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import PageHeader from '@/components/ui/page-header'
import EmptyState from '@/components/ui/empty-state'
import FilterPill from '@/components/ui/filter-pill'
import DrillDownPanel, { type DrillRow } from '@/components/dashboard/drill-down-panel'
import FirstVisitGuide from '@/components/first-visit-guide'

type DrillKey =
  | { kind: 'jp'; campo: 'empresas_encontradas' | 'leads_qualificados' | 'leads_enviados_crm' }
  | { kind: 'at'; tipo: TipoAtividade }
  | { kind: 'at-total' }

const ATIVIDADES_ORDEM: TipoAtividade[] = [
  'cold_call', 'whatsapp', 'agendamento_reuniao', 'follow_up',
  'proposta', 'negocio_fechado', 'reuniao_realizada', 'reuniao_furada',
]

function periodoLabel(p: Periodo): string {
  if (p === '7d') return 'Últimos 7 dias'
  if (p === '30d') return 'Últimos 30 dias'
  if (p === '90d') return 'Últimos 90 dias'
  return 'Este mês'
}

function deltaTexto(curr: number, prev: number): { texto: string; positivo: boolean | null } {
  if (prev === 0 && curr === 0) return { texto: '—', positivo: null }
  if (prev === 0) return { texto: `+${curr}`, positivo: true }
  const diff = curr - prev
  const pctDiff = Math.round((diff / prev) * 100)
  if (diff === 0) return { texto: '0%', positivo: null }
  return { texto: `${diff > 0 ? '+' : ''}${pctDiff}%`, positivo: diff > 0 }
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [registrosJP, setRegistrosJP] = useState<Registro[]>([])
  const [registrosJPPrev, setRegistrosJPPrev] = useState<Registro[]>([])
  const [atividadesAT, setAtividadesAT] = useState<Atividade[]>([])
  const [atividadesATPrev, setAtividadesATPrev] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [drill, setDrill] = useState<DrillKey | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setErro(null)
      try {
        const { inicio, fim } = periodoParaDatas(periodo)
        const { inicio: pInicio, fim: pFim } = periodoAnteriorDatas(periodo)
        const [jpCurr, jpPrev, atCurr, atPrev] = await Promise.all([
          fetchRegistros(inicio, fim, 'joao_pedro'),
          fetchRegistros(pInicio, pFim, 'joao_pedro'),
          supabase.from('atividades').select('*').eq('usuario', 'atanael').gte('data', inicio).lte('data', fim).order('data'),
          supabase.from('atividades').select('*').eq('usuario', 'atanael').gte('data', pInicio).lte('data', pFim),
        ])
        if (cancelled) return
        if (atCurr.error) throw atCurr.error
        if (atPrev.error) throw atPrev.error
        setRegistrosJP(jpCurr)
        setRegistrosJPPrev(jpPrev)
        setAtividadesAT((atCurr.data as Atividade[]) ?? [])
        setAtividadesATPrev((atPrev.data as Atividade[]) ?? [])
      } catch (e) {
        if (!cancelled) setErro(e instanceof Error ? e.message : 'Erro ao carregar dados')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [periodo])

  const totaisJP = useMemo(() => somarRegistros(registrosJP), [registrosJP])
  const totaisJPPrev = useMemo(() => somarRegistros(registrosJPPrev), [registrosJPPrev])

  const totalAT = atividadesAT.length
  const totalATPrev = atividadesATPrev.length

  const negociosFechadosAT = useMemo(
    () => atividadesAT.filter((a) => a.tipo_atividade === 'negocio_fechado').length,
    [atividadesAT],
  )
  const negociosFechadosATPrev = useMemo(
    () => atividadesATPrev.filter((a) => a.tipo_atividade === 'negocio_fechado').length,
    [atividadesATPrev],
  )

  const totalPorTipoAT = useMemo(() => {
    const m: Record<string, number> = {}
    for (const a of atividadesAT) m[a.tipo_atividade] = (m[a.tipo_atividade] ?? 0) + 1
    return m
  }, [atividadesAT])

  const tiposPresentesAT = ATIVIDADES_ORDEM.filter((t) => (totalPorTipoAT[t] ?? 0) > 0)

  // Gráfico unificado por dia: barras AT empilhadas + linha sutil de envios JP
  const graficoData = useMemo(() => {
    const byDate = new Map<string, Record<string, number>>()
    for (const a of atividadesAT) {
      const k = a.data
      if (!byDate.has(k)) byDate.set(k, {})
      const obj = byDate.get(k)!
      obj[a.tipo_atividade] = (obj[a.tipo_atividade] ?? 0) + 1
    }
    for (const r of registrosJP) {
      const k = r.data
      if (!byDate.has(k)) byDate.set(k, {})
      const obj = byDate.get(k)!
      obj.jp_enviados = (obj.jp_enviados ?? 0) + (r.leads_enviados_crm ?? 0)
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, counts]) => ({ data: data.slice(5), ...counts }))
  }, [atividadesAT, registrosJP])

  const drillRows: DrillRow[] = useMemo(() => {
    if (!drill) return []
    if (drill.kind === 'jp') {
      return [...registrosJP]
        .filter((r) => (r[drill.campo] ?? 0) > 0)
        .sort((a, b) => b.data.localeCompare(a.data))
        .map((r) => ({
          data: r.data.slice(5),
          label: r.data,
          color: '#4DA3F7',
          value: r[drill.campo] ?? 0,
          detail: 'João Pedro',
        }))
    }
    if (drill.kind === 'at-total') {
      return [...atividadesAT]
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
        .slice(0, 200)
        .map((a) => ({
          data: a.data.slice(5),
          hora: new Date(a.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          label: LABEL_ATIVIDADE[a.tipo_atividade],
          color: COR_ATIVIDADE[a.tipo_atividade],
          detail: `T${a.tier}${a.tentativa ? ` · ${a.tentativa}ª tent` : ''}`,
        }))
    }
    return atividadesAT
      .filter((a) => a.tipo_atividade === drill.tipo)
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
      .map((a) => ({
        data: a.data.slice(5),
        hora: new Date(a.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        label: LABEL_ATIVIDADE[a.tipo_atividade],
        color: COR_ATIVIDADE[a.tipo_atividade],
        detail: `T${a.tier}${a.tentativa ? ` · ${a.tentativa}ª tent` : ''}`,
      }))
  }, [drill, registrosJP, atividadesAT])

  const drillTitle = drill
    ? drill.kind === 'jp'
      ? drill.campo === 'empresas_encontradas' ? 'Empresas encontradas (JP)'
        : drill.campo === 'leads_qualificados' ? 'Leads qualificados (JP)'
        : 'Leads enviados ao CRM (JP)'
      : drill.kind === 'at-total' ? 'Todas as atividades (AT)'
      : `${LABEL_ATIVIDADE[drill.tipo]} (AT)`
    : ''

  const drillTotal = drill
    ? drill.kind === 'jp'
      ? totaisJP[drill.campo]
      : drill.kind === 'at-total'
        ? totalAT
        : (totalPorTipoAT[drill.tipo] ?? 0)
    : undefined

  const semDados = !loading && registrosJP.length === 0 && atividadesAT.length === 0

  return (
    <div>
      <PageHeader
        eyebrow="Visão consolidada"
        title="Dashboard"
        subtitle={`${periodoLabel(periodo)} · João Pedro + Atanael`}
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
          </div>
        }
        filters={<FilterPill label="Período" value={periodoLabel(periodo)} />}
      />

      <FirstVisitGuide />

      {erro && (
        <div role="alert" style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(209,52,56,0.08)',
          border: '1px solid rgba(209,52,56,0.4)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-danger)',
          fontSize: '0.78rem',
        }}>
          Falha ao carregar dados: {erro}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '108px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : semDados ? (
        <EmptyState
          title="Nenhum dado no período"
          description={`${periodoLabel(periodo)}. Use a página Registrar para começar a acompanhar atividades.`}
          action={<Link href="/registrar" className="uci-btn uci-btn--primary">Registrar agora</Link>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* HERO: 4 KPIs principais (JP + AT) */}
          <div className="dash-hero-grid">
            <KpiCard
              eyebrow="João Pedro"
              label="Empresas encontradas"
              value={totaisJP.empresas_encontradas}
              prev={totaisJPPrev.empresas_encontradas}
              cor="#4DA3F7"
              onClick={() => setDrill({ kind: 'jp', campo: 'empresas_encontradas' })}
            />
            <KpiCard
              eyebrow="João Pedro"
              label="Enviados ao CRM"
              value={totaisJP.leads_enviados_crm}
              prev={totaisJPPrev.leads_enviados_crm}
              cor="#4DA3F7"
              onClick={() => setDrill({ kind: 'jp', campo: 'leads_enviados_crm' })}
            />
            <KpiCard
              eyebrow="Atanael"
              label="Atividades realizadas"
              value={totalAT}
              prev={totalATPrev}
              cor="#2DB881"
              onClick={() => setDrill({ kind: 'at-total' })}
            />
            <KpiCard
              eyebrow="Atanael"
              label="Negócios fechados"
              value={negociosFechadosAT}
              prev={negociosFechadosATPrev}
              cor="#34D399"
              onClick={negociosFechadosAT > 0 ? () => setDrill({ kind: 'at', tipo: 'negocio_fechado' }) : undefined}
            />
          </div>

          {/* Mini-funil JP */}
          {totaisJP.empresas_encontradas > 0 && (
            <section className="uci-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p className="section-label">Captação · João Pedro</p>
                <Link href="/captacao" style={{ fontSize: '0.7rem', color: '#4DA3F7', textDecoration: 'none' }}>
                  Ver detalhes →
                </Link>
              </div>
              <div className="dash-funil">
                <FunilStep label="Encontradas" value={totaisJP.empresas_encontradas} />
                <FunilArrow taxa={pct(totaisJP.leads_qualificados, totaisJP.empresas_encontradas)} />
                <FunilStep label="Qualificados" value={totaisJP.leads_qualificados} />
                <FunilArrow taxa={pct(totaisJP.leads_enviados_crm, totaisJP.leads_qualificados)} />
                <FunilStep label="Enviados ao CRM" value={totaisJP.leads_enviados_crm} accent />
              </div>
            </section>
          )}

          {/* Resumo AT — chips clicáveis */}
          {tiposPresentesAT.length > 0 && (
            <section className="uci-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p className="section-label">Contato · Atanael — distribuição por tipo</p>
                <Link href="/contato" style={{ fontSize: '0.7rem', color: '#2DB881', textDecoration: 'none' }}>
                  Ver detalhes →
                </Link>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {tiposPresentesAT.map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setDrill({ kind: 'at', tipo })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '5px 12px', background: 'var(--surface-elevated)',
                      border: '1px solid var(--border)', borderRadius: '20px',
                      fontSize: '0.72rem', fontWeight: 500, color: 'var(--foreground)',
                      fontFamily: "'Segoe UI', system-ui, sans-serif", cursor: 'pointer',
                      transition: 'border-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = COR_ATIVIDADE[tipo] }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: COR_ATIVIDADE[tipo] }} />
                    {LABEL_ATIVIDADE[tipo]}
                    <span style={{ marginLeft: '2px', fontWeight: 700, color: COR_ATIVIDADE[tipo] }}>
                      {totalPorTipoAT[tipo] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Gráfico unificado */}
          {graficoData.length > 0 && (
            <section className="uci-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p className="section-label">Atividade por dia</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                  {totalAT} ações AT · {totaisJP.leads_enviados_crm} enviados JP
                </span>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={graficoData} barCategoryGap="35%" margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--foreground)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    formatter={(value, name) => {
                      if (name === 'jp_enviados') return [value, 'JP · Enviados ao CRM']
                      return [value, LABEL_ATIVIDADE[name as TipoAtividade] ?? name]
                    }}
                  />
                  <Legend
                    iconType="circle" iconSize={7}
                    wrapperStyle={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', paddingTop: '0.5rem' }}
                    formatter={(value) => value === 'jp_enviados' ? 'JP · Enviados' : (LABEL_ATIVIDADE[value as TipoAtividade] ?? value)}
                  />
                  {tiposPresentesAT.map((t) => (
                    <Bar key={t} dataKey={t} name={t} fill={COR_ATIVIDADE[t]} radius={[2, 2, 0, 0]} opacity={0.92} stackId="at" cursor="pointer" onClick={() => setDrill({ kind: 'at', tipo: t })} />
                  ))}
                  {totaisJP.leads_enviados_crm > 0 && (
                    <Bar dataKey="jp_enviados" name="jp_enviados" fill="#4DA3F7" radius={[2, 2, 0, 0]} opacity={0.85} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Atalhos */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <ShortcutCard href="/captacao" label="Captação" detail="Métricas João Pedro" cor="#4DA3F7" />
            <ShortcutCard href="/contato" label="Contato" detail="Atividades Atanael" cor="#2DB881" />
            <ShortcutCard href="/metricas-tier" label="Métricas TIER" detail="Ligações por tier × tipo" cor="#A78BFA" />
            <ShortcutCard href="/historico" label="Histórico" detail="Auditoria por dia" cor="#FBBF24" />
          </section>
        </div>
      )}

      <DrillDownPanel
        open={drill !== null}
        onClose={() => setDrill(null)}
        title={drillTitle}
        subtitle={periodoLabel(periodo)}
        total={drillTotal}
        rows={drillRows}
      />

      <style jsx>{`
        .dash-hero-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .dash-hero-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .dash-hero-grid { grid-template-columns: 1fr; }
        }
        .dash-funil {
          display: flex;
          align-items: stretch;
          gap: 0;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .dash-funil { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </div>
  )
}

function KpiCard({ eyebrow, label, value, prev, cor, onClick }: {
  eyebrow: string
  label: string
  value: number
  prev: number
  cor: string
  onClick?: () => void
}) {
  const delta = deltaTexto(value, prev)
  const isClickable = !!onClick
  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick?.() } }}
      className={isClickable ? 'uci-card uci-card--clickable' : 'uci-card'}
      style={{ padding: '1rem 1.25rem', minHeight: '108px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: cor, marginBottom: '4px' }}>
            {eyebrow}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.3 }}>
            {label}
          </p>
        </div>
        {delta.positivo !== null && (
          <span style={{
            fontSize: '0.62rem', fontWeight: 600,
            color: delta.positivo ? 'var(--accent-success-fg)' : 'var(--accent-danger)',
            background: delta.positivo ? 'rgba(78,201,78,0.1)' : 'rgba(209,52,56,0.1)',
            padding: '2px 6px', borderRadius: '3px', flexShrink: 0,
          }}>
            {delta.texto}
          </span>
        )}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

function FunilStep({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: '120px', padding: '0.75rem 0.5rem' }}>
      <p style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.6rem', fontWeight: 600, color: accent ? '#4DA3F7' : 'var(--foreground)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}

function FunilArrow({ taxa }: { taxa: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0.75rem', flexShrink: 0, gap: '4px' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F0A830', fontVariantNumeric: 'tabular-nums' }}>{taxa}</span>
      <svg width="22" height="6" viewBox="0 0 28 8" fill="none" aria-hidden>
        <path d="M0 4H22M22 4L18 1M22 4L18 7" stroke="var(--border-hover)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ShortcutCard({ href, label, detail, cor }: { href: string; label: string; detail: string; cor: string }) {
  return (
    <Link href={href} className="uci-card uci-card--clickable" style={{
      display: 'flex', flexDirection: 'column', gap: '4px',
      padding: '0.875rem 1rem', textDecoration: 'none', color: 'var(--foreground)',
      borderLeft: `3px solid ${cor}`,
    }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.66rem', color: 'var(--muted-foreground)' }}>{detail}</span>
    </Link>
  )
}
