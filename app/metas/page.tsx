'use client'

import { useState, useEffect } from 'react'
import AnimatedTitle from '@/components/animated-title'
import { getMetas, saveMetas, defaultMetas, type Metas } from '@/lib/metas'

const BORDER = '1px solid #1F1F1F'

const grupos: { titulo: string; cor: string; campos: { key: keyof Metas; label: string }[] }[] = [
  {
    titulo: 'João Pedro',
    cor: '#60A5FA',
    campos: [
      { key: 'empresas_encontradas', label: 'Empresas encontradas / dia útil' },
      { key: 'leads_qualificados', label: 'Leads qualificados / dia útil' },
      { key: 'leads_enviados_crm', label: 'Leads enviados ao CRM / dia útil' },
    ],
  },
  {
    titulo: 'Atanael',
    cor: '#34D399',
    campos: [
      { key: 'leads_contatados', label: 'Leads contatados / dia útil' },
      { key: 'respostas', label: 'Respostas / dia útil' },
      { key: 'interessados', label: 'Interessados / dia útil' },
      { key: 'reunioes_marcadas', label: 'Reuniões marcadas / dia útil' },
      { key: 'oportunidades', label: 'Oportunidades / dia útil' },
      { key: 'follow_ups', label: 'Follow-ups / dia útil' },
      { key: 'ligacoes_feitas', label: 'Ligações feitas / dia útil' },
      { key: 'ligacoes_sucesso', label: 'Ligações com sucesso / dia útil' },
      { key: 'ligacoes_falha', label: 'Ligações sem sucesso esperadas / dia útil' },
    ],
  },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 0',
  fontSize: '1.5rem',
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  color: '#FAFAF9',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #2A2A2A',
  outline: 'none',
  appearance: 'textfield' as const,
}

export default function MetasPage() {
  const [metas, setMetas] = useState<Metas>(defaultMetas)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMetas(getMetas())
  }, [])

  function handleChange(key: keyof Metas, val: string) {
    setMetas((prev) => ({ ...prev, [key]: parseInt(val || '0', 10) }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveMetas(metas)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: BORDER }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Metas diárias</p>
        <AnimatedTitle text="Metas" />
      </div>

      <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Configure quantos resultados cada pessoa deve atingir por dia útil.
        O progresso aparece como barra nos cards do Dashboard, Captação e Contato.
      </p>

      <form onSubmit={handleSubmit}>
        {grupos.map(({ titulo, cor, campos }) => (
          <div key={titulo} style={{ marginBottom: '2.5rem' }}>
            <p className="section-label" style={{ marginBottom: '0.75rem', color: cor }}>{titulo}</p>
            {campos.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: '0.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#9CA3AF', marginTop: '1.25rem' }}>
                  {label}
                </label>
                <input
                  type="number"
                  min={0}
                  value={metas[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        ))}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.9rem',
            background: '#1C1917',
            color: '#F8F7F4',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Salvar metas
        </button>

        {saved && (
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', marginTop: '1rem' }}>
            Metas salvas com sucesso.
          </p>
        )}
      </form>
    </div>
  )
}
