'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type Periodo = '7d' | '30d' | '90d' | 'mes'

export type RangeDatas = { inicio: string; fim: string }

export function periodoParaDatas(periodo: Periodo): RangeDatas {
  const hoje = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  if (periodo === '7d') {
    const inicio = new Date(hoje)
    inicio.setDate(hoje.getDate() - 6)
    return { inicio: fmt(inicio), fim: fmt(hoje) }
  }
  if (periodo === '30d') {
    const inicio = new Date(hoje)
    inicio.setDate(hoje.getDate() - 29)
    return { inicio: fmt(inicio), fim: fmt(hoje) }
  }
  if (periodo === '90d') {
    const inicio = new Date(hoje)
    inicio.setDate(hoje.getDate() - 89)
    return { inicio: fmt(inicio), fim: fmt(hoje) }
  }
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  return { inicio: fmt(inicio), fim: fmt(hoje) }
}

export function periodoAnteriorDatas(periodo: Periodo): RangeDatas {
  const { inicio, fim } = periodoParaDatas(periodo)
  const start = new Date(inicio + 'T00:00:00')
  const end = new Date(fim + 'T00:00:00')
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const prevEnd = new Date(start)
  prevEnd.setDate(prevEnd.getDate() - 1)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - days + 1)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { inicio: fmt(prevStart), fim: fmt(prevEnd) }
}

type Props = {
  value: Periodo
  onChange: (v: Periodo) => void
}

export default function FiltroPeriodo({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Periodo)}>
      <SelectTrigger style={{
        width: '10rem',
        background: '#0F1A2E',
        border: '1px solid #1A2D45',
        color: '#8AAFD0',
        fontSize: '0.72rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        borderRadius: '4px',
        height: '34px',
      }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent style={{
        background: '#0F1A2E',
        border: '1px solid #1A2D45',
        color: '#E4ECF7',
        borderRadius: '4px',
      }}>
        <SelectItem value="7d">Últimos 7 dias</SelectItem>
        <SelectItem value="30d">Últimos 30 dias</SelectItem>
        <SelectItem value="90d">Últimos 90 dias</SelectItem>
        <SelectItem value="mes">Este mês</SelectItem>
      </SelectContent>
    </Select>
  )
}
