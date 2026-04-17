'use client'

import { useEffect, useState } from 'react'
import type { Registro } from '@/lib/supabase'
import { fetchRegistros } from '@/lib/queryCache'
import { somarRegistros, pct, diasUteis, porDia, buildFunil } from '@/lib/metrics'
import MetricCard from '@/components/metric-card'
import { MetricCardSkeleton } from '@/components/skeleton'
import FiltroPeriodo, { periodoParaDatas, periodoAnteriorDatas, type Periodo } from '@/components/filtro-periodo'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import AnimatedTitle from '@/components/animated-title'
import { getMetas, type Metas } from '@/lib/metas'

const BORDER = '1px solid #3D3D3D'
const MUTED = '#9E9E9E'

const funilColors = ['#4DA3F7','#4DA3F7','#4DA3F7','#2DB881','#2DB881','#F0A830','#F0A830','#9B72CF']

export default function DashboardPage() {
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
        fetchRegistros(inicio, fim),
        fetchRegistros(pInicio, pFim),
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
  const funil = buildFunil(t)

  const porSemana: Record<string, { semana: string; enviados: number; contatados: number }> = {}
  registros.forEach((r) => {
    const d = new Date(r.data + 'T00:00:00')
    const dom = new Date(d); dom.setDate(d.getDate() - d.getDay())
    const key = dom.toISOString().slice(0, 10)
    if (!porSemana[key]) porSemana[key] = { semana: key.slice(5), enviados: 0, contatados: 0 }
    porSemana[key].enviados += r.leads_enviados_crm
    porSemana[key].contatados += r.leads_contatados
  })
  const graficoData = Object.values(porSemana)

  return (
    <div>
      {/* Header da página */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: BORDER,
      }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>Visão geral</p>
          <AnimatedTitle text="Dashboard" />
        </div>
        <FiltroPeriodo value={periodo} onChange={setPeriodo} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {[4, 4, 3].map((count, si) => (
            <section key={si}>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '1rem' }}>
                {Array.from({ length: count }).map((_, i) => <MetricCardSkeleton key={i} />)}
              </div>
            </section>
          ))}
        </div>
      ) : registros.length === 0 ? (
        /* Empty state — só aparece quando não há nenhum dado no período */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '5rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #2E2E2E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A4A4A" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9E9E9E' }}>
            Nenhum registro encontrado
          </p>
          <p style={{ fontSize: '0.75rem', color: '#5A5A5A', maxWidth: '260px', lineHeight: 1.6 }}>
            Ainda não há dados para o período selecionado. Comece registrando as atividades do dia.
          </p>
          <a href="/registrar" style={{
            marginTop: '0.5rem',
            padding: '8px 18px',
            background: '#1A3A5C',
            border: '1px solid #2A5A8A',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#4DA3F7',
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}>
            + Registrar agora
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* Captação */}
          <section>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.875rem',
              paddingBottom: '0.625rem',
              borderBottom: '1px solid #2E2E2E',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '1px', background: '#4DA3F7', flexShrink: 0, opacity: 0.9 }} />
              <p className="section-label" style={{ color: '#4DA3F7' }}>João Pedro</p>
              <span style={{ fontSize: '0.65rem', color: MUTED, fontWeight: 500 }}>Captação</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <MetricCard label="Empresas encontradas" value={t.empresas_encontradas} color="captacao"
                prev={prevT.empresas_encontradas} meta={metas?.empresas_encontradas} dias={dias}
                tooltip="Total de empresas prospectadas por João Pedro" />
              <MetricCard label="Leads qualificados" value={t.leads_qualificados} sub={`Taxa: ${pct(t.leads_qualificados, t.empresas_encontradas)}`} color="captacao"
                prev={prevT.leads_qualificados} meta={metas?.leads_qualificados} dias={dias}
                tooltip="Empresas que passaram pelo critério de qualificação" />
              <MetricCard label="Enviados ao CRM" value={t.leads_enviados_crm} sub={`Taxa: ${pct(t.leads_enviados_crm, t.leads_qualificados)}`} color="captacao"
                prev={prevT.leads_enviados_crm} meta={metas?.leads_enviados_crm} dias={dias}
                tooltip="Leads aprovados e encaminhados para contato comercial" />
              <MetricCard label="Enviados por dia" value={porDia(t.leads_enviados_crm, dias)} color="produtividade"
                tooltip="Média diária de leads enviados ao CRM no período" />
            </div>
          </section>

          {/* Contato */}
          <section>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.875rem',
              paddingBottom: '0.625rem',
              borderBottom: '1px solid #2E2E2E',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '1px', background: '#2DB881', flexShrink: 0, opacity: 0.9 }} />
              <p className="section-label" style={{ color: '#2DB881' }}>Atanael</p>
              <span style={{ fontSize: '0.65rem', color: MUTED, fontWeight: 500 }}>Contato comercial</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <MetricCard label="Leads contatados" value={t.leads_contatados} color="contato"
                prev={prevT.leads_contatados} meta={metas?.leads_contatados} dias={dias}
                tooltip="Leads efetivamente contatados por Atanael" />
              <MetricCard label="Respostas" value={t.respostas} sub={`Taxa: ${pct(t.respostas, t.leads_contatados)}`} color="contato"
                prev={prevT.respostas} meta={metas?.respostas} dias={dias}
                tooltip="Leads que responderam positivamente ao contato" />
              <MetricCard label="Interessados" value={t.interessados} color="contato"
                prev={prevT.interessados} meta={metas?.interessados} dias={dias}
                tooltip="Leads que demonstraram interesse no produto" />
              <MetricCard label="Reunioes marcadas" value={t.reunioes_marcadas} color="taxa"
                prev={prevT.reunioes_marcadas} meta={metas?.reunioes_marcadas} dias={dias}
                tooltip="Reuniões de venda agendadas no período" />
            </div>
          </section>

          {/* Resultado */}
          <section>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.875rem',
              paddingBottom: '0.625rem',
              borderBottom: '1px solid #2E2E2E',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '1px', background: '#9B72CF', flexShrink: 0, opacity: 0.9 }} />
              <p className="section-label" style={{ color: '#9B72CF' }}>Resultado</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <MetricCard label="Oportunidades geradas" value={t.oportunidades} color="resultado"
                prev={prevT.oportunidades} meta={metas?.oportunidades} dias={dias}
                tooltip="Negócios com potencial real de fechamento" />
              <MetricCard label="Conversao geral" value={pct(t.oportunidades, t.leads_enviados_crm)} sub="enviados para oportunidades" color="taxa"
                tooltip="% de leads enviados ao CRM que viraram oportunidades" />
              <MetricCard label="Contatados por dia" value={porDia(t.leads_contatados, dias)} color="produtividade"
                tooltip="Média diária de leads contatados por Atanael" />
            </div>
          </section>

          {/* Funil */}
          <section>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              paddingBottom: '0.625rem',
              borderBottom: '1px solid #2E2E2E',
            }}>
              <p className="section-label">Funil resumido</p>
            </div>
            <div style={{
              background: '#0F1A2E',
              border: BORDER,
              borderRadius: '4px',
              padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
                {funil.map((etapa, i) => {
                  const maxVal = funil[0].valor || 1
                  const pctH = Math.max((etapa.valor / maxVal) * 100, 3)
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.65rem', color: '#8AAFD0', fontWeight: 600 }}>{etapa.valor}</span>
                      <div style={{ width: '100%', height: `${pctH}%`, background: funilColors[i], borderRadius: '2px 2px 0 0', opacity: 0.85 }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '3px', marginTop: '8px', borderTop: '1px solid #152035', paddingTop: '8px' }}>
                {funil.map((etapa, i) => (
                  <div key={i} style={{ flex: 1, fontSize: '0.55rem', color: MUTED, textAlign: 'center', lineHeight: 1.3, fontWeight: 500, letterSpacing: '0.02em' }}>
                    {etapa.label}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gráfico semanal */}
          {graficoData.length > 0 && (
            <section>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.625rem',
                borderBottom: '1px solid #2E2E2E',
              }}>
                <p className="section-label">Evolucao semanal</p>
                <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                  {[
                    { color: '#2899F5', label: 'Enviados ao CRM' },
                    { color: '#2EAD7A', label: 'Contatados' },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                      <span style={{ fontSize: '0.62rem', color: MUTED, fontWeight: 500 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                background: '#0F1A2E',
                border: BORDER,
                borderRadius: '4px',
                padding: '1.25rem 1.5rem',
              }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={graficoData} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="1 6" stroke="#1A2D45" vertical={false} />
                    <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#637EA0', fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#637EA0', fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        background: '#0B1220',
                        border: '1px solid #1A2D45',
                        borderRadius: 4,
                        color: '#E4ECF7',
                        fontFamily: 'var(--font-body)',
                      }}
                      cursor={{ fill: '#ffffff04' }}
                    />
                    <Bar dataKey="enviados" name="Enviados ao CRM" fill="#2899F5" radius={[2, 2, 0, 0]} opacity={0.85} />
                    <Bar dataKey="contatados" name="Contatados" fill="#2EAD7A" radius={[2, 2, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
