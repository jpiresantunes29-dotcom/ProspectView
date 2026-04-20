# project_map.md — Mapa estrutural do ProspectView

## Raiz
```
app/              → páginas (Next.js App Router)
components/       → componentes reutilizáveis
lib/              → utilitários e clientes
public/           → assets estáticos
```

## app/ — Páginas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `app/page.tsx` | Dashboard: gráfico atividades por dia + export Excel |
| `/captacao` | `app/captacao/page.tsx` | Métricas João Pedro (registros table) |
| `/contato` | `app/contato/page.tsx` | Wizard 4 etapas Atanael + histórico atividades |
| `/historico` | `app/historico/page.tsx` | Lista simplificada de registros com chips |
| `/registrar` | `app/registrar/page.tsx` | JP: quick-log + manual. Atanael: redirect para /contato |
| `/metas` | `app/metas/page.tsx` | Edição de metas diárias (localStorage) |
| `/funil` | `app/funil/page.tsx` | `redirect('/')` — página removida |
| `/quick-log` | `app/quick-log/page.tsx` | Legacy redirect para /registrar |

## components/

| Arquivo | Uso |
|---------|-----|
| `navbar.tsx` | Navegação global + pill indicator + status JP/AT |
| `metric-card.tsx` | Card de métrica com animação, delta, progress bar, tooltip |
| `filtro-periodo.tsx` | Seletor 7d/30d/90d/mes |
| `animated-title.tsx` | Título com animação de entrada |
| `first-visit-guide.tsx` | Card de boas-vindas (1x, localStorage flag) |
| `cache-warmer.tsx` | Warmup silencioso do cache no startup |
| `skeleton.tsx` | Placeholder de loading |
| `count-up.tsx` | Contador animado |

## lib/

| Arquivo | Uso |
|---------|-----|
| `supabase.ts` | Cliente Supabase + todos os types (Registro, Atividade, Evento, TipoAtividade, StatusContato, etc.) |
| `queryCache.ts` | Cache sessionStorage TTL 5min + prefetchPage() + warmupCache() |
| `metrics.ts` | Funções puras: somarRegistros, buildFunil, pct, diasUteis, porDia |
| `metas.ts` | getMetas(), saveMetas() — localStorage |
| `theme.tsx` | ThemeProvider + useTheme hook |

## Banco de dados (Supabase)

| Tabela | Quem usa | Campos-chave |
|--------|---------|--------------|
| `registros` | JP + AT (legacy AT) | data, usuario, empresas_encontradas, leads_qualificados, leads_enviados_crm, leads_contatados, respostas, interessados, reunioes_marcadas, oportunidades, follow_ups, ligacoes_feitas, ligacoes_sucesso, ligacoes_falha |
| `eventos` | Quick-log (JP + AT) | id, data, usuario, tipo, criado_em, motivo_falha, tier, sequencia_ligacao |
| `atividades` | Wizard /contato (Atanael) | id, data, usuario, tier, tipo_atividade, status_contato, tentativa, criado_em |

## Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=https://xvtuhtkfhnmzehsfmgsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

## Deploy
- **Produção**: https://prospectview.vercel.app
- **Repositório**: https://github.com/jpiresantunes29-dotcom/ProspectView
- **Branch principal**: main
- **Auto-push**: post-commit hook em `.git/hooks/post-commit`
