'use client'

import { useState, useEffect } from 'react'
import AnimatedTitle from '@/components/animated-title'
import { getMetas, saveMetas, defaultMetas, type Metas } from '@/lib/metas'
import { showToast } from '@/components/toast'

const grupos: { titulo: string; cor: string; campos: { key: keyof Metas; label: string }[] }[] = [
  {
    titulo: 'João Pedro',
    cor: '#60A5FA',
    campos: [
      { key: 'empresas_encontradas', label: 'Empresas encontradas / dia útil' },
      { key: 'leads_qualificados',   label: 'Leads qualificados / dia útil' },
      { key: 'leads_enviados_crm',   label: 'Leads enviados ao CRM / dia útil' },
    ],
  },
  {
    titulo: 'Atanael',
    cor: '#34D399',
    campos: [
      { key: 'leads_contatados',  label: 'Leads contatados / dia útil' },
      { key: 'respostas',         label: 'Respostas / dia útil' },
      { key: 'interessados',      label: 'Interessados / dia útil' },
      { key: 'reunioes_marcadas', label: 'Reuniões marcadas / dia útil' },
      { key: 'oportunidades',     label: 'Oportunidades / dia útil' },
      { key: 'follow_ups',        label: 'Follow-ups / dia útil' },
      { key: 'ligacoes_feitas',   label: 'Ligações feitas / dia útil' },
      { key: 'ligacoes_sucesso',  label: 'Ligações com sucesso / dia útil' },
      { key: 'ligacoes_falha',    label: 'Ligações sem sucesso esperadas / dia útil' },
    ],
  },
]

export default function MetasPage() {
  const [metas, setMetas] = useState<Metas>(defaultMetas)
  const [erros, setErros] = useState<Partial<Record<keyof Metas, boolean>>>({})

  useEffect(() => {
    setMetas(getMetas())
  }, [])

  function handleChange(key: keyof Metas, val: string) {
    const num = parseInt(val || '0', 10)
    setMetas(prev => ({ ...prev, [key]: num }))
    setErros(prev => ({ ...prev, [key]: num < 1 }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const todosOsCampos = grupos.flatMap(g => g.campos.map(c => c.key))
    const novosErros: Partial<Record<keyof Metas, boolean>> = {}
    let temErro = false
    for (const key of todosOsCampos) {
      if ((metas[key] ?? 0) < 1) {
        novosErros[key] = true
        temErro = true
      }
    }
    setErros(novosErros)
    if (temErro) {
      showToast('Todos os campos precisam ter valor maior que zero.', { type: 'error' })
      return
    }
    saveMetas(metas)
    showToast('Metas salvas com sucesso.', { type: 'success' })
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Metas diárias</p>
        <AnimatedTitle text="Metas" />
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Configure quantos resultados cada pessoa deve atingir por dia útil.
        O progresso aparece como barra nos cards do Dashboard, Captação e Contato.
      </p>

      <form onSubmit={handleSubmit}>
        {grupos.map(({ titulo, cor, campos }) => (
          <div key={titulo} style={{ marginBottom: '2.5rem' }}>
            <p className="section-label" style={{ marginBottom: '0.75rem', color: cor }}>{titulo}</p>
            {campos.map(({ key, label }) => {
              const temErro = erros[key]
              return (
                <div key={key} style={{ marginBottom: '0.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '1.25rem' }}>
                    {label}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={metas[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0',
                      fontSize: '1.5rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      color: temErro ? '#F87171' : 'var(--foreground)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${temErro ? '#F87171' : 'var(--border)'}`,
                      outline: 'none',
                      appearance: 'textfield' as const,
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                  />
                  {temErro && (
                    <p style={{ fontSize: '0.65rem', color: '#F87171', marginTop: '3px' }}>
                      Digite um valor maior que zero
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.9rem',
            background: 'var(--primary)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            transition: 'opacity 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          Salvar metas
        </button>
      </form>
    </div>
  )
}
