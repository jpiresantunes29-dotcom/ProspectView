export type WidgetType =
  | 'kpi-empresas_encontradas'
  | 'kpi-leads_qualificados'
  | 'kpi-leads_enviados_crm'
  | 'kpi-reunioes_marcadas'
  | 'kpi-reunioes_realizadas'
  | 'kpi-ligacoes_feitas'
  | 'kpi-ligacoes_sucesso'
  | 'kpi-negocios_fechados'
  | 'chart-capt-diario'
  | 'chart-ativ-diario'
  | 'matrix-tier'
  | 'toplist-motivos'
  | 'toplist-atividades'
  | 'diagnostico'

export type WidgetConfig = {
  id: string
  type: WidgetType
  colSpan: number  // 1..12
  rowSpan?: number
}

export type DashboardLayout = {
  id: string
  label: string
  widgets: WidgetConfig[]
}

const KEY_PREFIX = 'pv-dashboard:'

export const DEFAULT_LAYOUTS: Record<string, DashboardLayout> = {
  executivo: {
    id: 'executivo',
    label: 'Executivo',
    widgets: [
      { id: 'w1', type: 'kpi-empresas_encontradas', colSpan: 3 },
      { id: 'w2', type: 'kpi-leads_qualificados', colSpan: 3 },
      { id: 'w3', type: 'kpi-leads_enviados_crm', colSpan: 3 },
      { id: 'w4', type: 'kpi-negocios_fechados', colSpan: 3 },
      { id: 'w5', type: 'chart-ativ-diario', colSpan: 8 },
      { id: 'w6', type: 'toplist-atividades', colSpan: 4 },
    ],
  },
  captacao_jp: {
    id: 'captacao_jp',
    label: 'Captação (JP)',
    widgets: [
      { id: 'w1', type: 'kpi-empresas_encontradas', colSpan: 4 },
      { id: 'w2', type: 'kpi-leads_qualificados', colSpan: 4 },
      { id: 'w3', type: 'kpi-leads_enviados_crm', colSpan: 4 },
      { id: 'w4', type: 'chart-capt-diario', colSpan: 12 },
    ],
  },
  tier_at: {
    id: 'tier_at',
    label: 'Contato (AT)',
    widgets: [
      { id: 'w1', type: 'kpi-ligacoes_feitas', colSpan: 3 },
      { id: 'w2', type: 'kpi-ligacoes_sucesso', colSpan: 3 },
      { id: 'w3', type: 'kpi-reunioes_marcadas', colSpan: 3 },
      { id: 'w4', type: 'kpi-negocios_fechados', colSpan: 3 },
      { id: 'w5', type: 'matrix-tier', colSpan: 8 },
      { id: 'w6', type: 'toplist-motivos', colSpan: 4 },
    ],
  },
}

export function getLayout(dashboardId: string): DashboardLayout {
  if (typeof window === 'undefined') return DEFAULT_LAYOUTS[dashboardId] ?? DEFAULT_LAYOUTS.executivo
  try {
    const raw = localStorage.getItem(KEY_PREFIX + dashboardId)
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardLayout
      if (parsed.widgets?.length) return parsed
    }
  } catch {}
  return DEFAULT_LAYOUTS[dashboardId] ?? DEFAULT_LAYOUTS.executivo
}

export function saveLayout(dashboardId: string, layout: DashboardLayout) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_PREFIX + dashboardId, JSON.stringify(layout))
}

export function resetLayout(dashboardId: string) {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY_PREFIX + dashboardId)
}
