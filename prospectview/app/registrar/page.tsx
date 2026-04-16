'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AnimatedTitle from '@/components/animated-title'

type Usuario = 'joao_pedro' | 'atanael'

const hoje = () => new Date().toISOString().slice(0, 10)

const camposJoao = [
  { key: 'empresas_encontradas', label: 'Empresas encontradas' },
  { key: 'leads_qualificados', label: 'Leads qualificados' },
  { key: 'leads_enviados_crm', label: 'Leads enviados ao CRM' },
]

const camposAtanael = [
  { key: 'leads_contatados', label: 'Leads contatados' },
  { key: 'respostas', label: 'Respostas recebidas' },
  { key: 'interessados', label: 'Leads interessados' },
  { key: 'reunioes_marcadas', label: 'Reuniões marcadas' },
  { key: 'reunioes_realizadas', label: 'Reuniões realizadas' },
  { key: 'oportunidades', label: 'Oportunidades geradas' },
  { key: 'follow_ups', label: 'Follow-ups realizados' },
  { key: 'ligacoes_feitas', label: 'Ligações feitas' },
  { key: 'ligacoes_sucesso', label: 'Ligações com sucesso' },
  { key: 'ligacoes_falha', label: 'Ligações sem sucesso' },
]

const defaultValues = {
  empresas_encontradas: '',
  leads_qualificados: '',
  leads_enviados_crm: '',
  leads_contatados: '',
  respostas: '',
  interessados: '',
  reunioes_marcadas: '',
  reunioes_realizadas: '',
  oportunidades: '',
  follow_ups: '',
  ligacoes_feitas: '',
  ligacoes_sucesso: '',
  ligacoes_falha: '',
}

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
  appearance: 'textfield',
}

export default function RegistrarPage() {
  const [usuario, setUsuario] = useState<Usuario>('joao_pedro')
  const [data, setData] = useState(hoje())
  const [valores, setValores] = useState(defaultValues)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'erro'>('idle')

  const campos = usuario === 'joao_pedro' ? camposJoao : camposAtanael

  function handleChange(key: string, val: string) {
    setValores((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const allCampos = [...camposJoao, ...camposAtanael]
    const seen = new Set<string>()
    const payload: Record<string, number | string> = { data, usuario }
    for (const { key } of allCampos) {
      if (!seen.has(key)) {
        seen.add(key)
        payload[key] = parseInt(valores[key as keyof typeof valores] || '0', 10)
      }
    }
    const { error } = await supabase.from('registros').upsert(payload, { onConflict: 'data,usuario' })
    if (error) { console.error(error); setStatus('erro') }
    else { setStatus('ok'); setTimeout(() => setStatus('idle'), 3000) }
  }

  async function carregarExistente() {
    const { data: row } = await supabase
      .from('registros').select('*')
      .eq('data', data).eq('usuario', usuario).single()
    if (row) {
      setValores({
        empresas_encontradas: String(row.empresas_encontradas ?? 0),
        leads_qualificados: String(row.leads_qualificados ?? 0),
        leads_enviados_crm: String(row.leads_enviados_crm ?? 0),
        leads_contatados: String(row.leads_contatados ?? 0),
        respostas: String(row.respostas ?? 0),
        interessados: String(row.interessados ?? 0),
        reunioes_marcadas: String(row.reunioes_marcadas ?? 0),
        reunioes_realizadas: String(row.reunioes_realizadas ?? 0),
        oportunidades: String(row.oportunidades ?? 0),
        follow_ups: String(row.follow_ups ?? 0),
        ligacoes_feitas: String(row.ligacoes_feitas ?? 0),
        ligacoes_sucesso: String(row.ligacoes_sucesso ?? 0),
        ligacoes_falha: String(row.ligacoes_falha ?? 0),
      })
    } else {
      setValores(defaultValues)
    }
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #1F1F1F' }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Registro diário</p>
        <AnimatedTitle text={usuario === 'joao_pedro' ? 'João Pedro' : 'Atanael'} />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>Quem está registrando?</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['joao_pedro', 'atanael'] as Usuario[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => { setUsuario(u); setValores(defaultValues) }}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  border: '1px solid',
                  borderColor: usuario === u ? '#1C1917' : '#E7E5E4',
                  background: usuario === u ? '#1C1917' : 'transparent',
                  color: usuario === u ? '#F8F7F4' : '#9CA3AF',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {u === 'joao_pedro' ? 'João Pedro' : 'Atanael'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>Data</p>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            onBlur={carregarExistente}
            style={{ ...inputStyle, fontSize: '1rem', fontFamily: 'var(--font-geist)' }}
          />
          <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.4rem' }}>
            Registros existentes nesta data serão atualizados.
          </p>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>Métricas</p>
          {campos.map(({ key, label }) => (
            <div key={key} style={{ marginBottom: '0.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0rem', marginTop: '1.25rem' }}>
                {label}
              </label>
              <input
                type="number"
                min={0}
                value={valores[key as keyof typeof valores]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
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
            cursor: status === 'loading' ? 'wait' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? 'Salvando...' : 'Salvar registro'}
        </button>

        {status === 'ok' && (
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', marginTop: '1rem' }}>
            Registro salvo.
          </p>
        )}
        {status === 'erro' && (
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#DC2626', marginTop: '1rem' }}>
            Erro ao salvar. Verifique o console.
          </p>
        )}
      </form>
    </div>
  )
}
