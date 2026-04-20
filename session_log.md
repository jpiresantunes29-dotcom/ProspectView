# session_log.md — Log das últimas sessões

## 2026-04-20 (sessão atual)

### Modificações
- `app/contato/page.tsx` — Wizard reescrito: nova ordem (tentativa → status), status salva automaticamente ao clicar, `HistoricoAtividades` adicionado abaixo do wizard
- `app/page.tsx` — Dashboard reescrito: gráfico empilhado por tipo_atividade, filtros 7d/30d/90d, export Excel
- `app/funil/page.tsx` — Substituído por `redirect('/')`
- `app/historico/page.tsx` — Tabela densa substituída por lista com chips de métricas
- `app/registrar/page.tsx` — Atanael: quick-log substituído por card redirect para /contato
- `components/navbar.tsx` — Funil removido dos mainLinks; ref movido para `HTMLAnchorElement` (fix pill indicator)
- `lib/supabase.ts` — Adicionado: TipoAtividade, StatusContato, Atividade, LABEL_ATIVIDADE, COR_ATIVIDADE, LABEL_STATUS
- `CLAUDE.md` — Condensado; regras operacionais adicionadas no topo
- `project_map.md` — Criado
- `decisions.md` — Criado
- `session_log.md` — Criado

### SQL executado no Supabase
Tabela `atividades` criada com RLS + índices. Ver `decisions.md` para detalhes.

### Commits desta sessão
- `18f5d20` Docs: regras operacionais permanentes
- `90e4071` Docs: reflexão técnica sessão reestruturação
- `bbd8116` Refactor: historico simplificado
- `46d895c` Fix: wizard contato reordenado + historico + registrar Atanael
- `fe03bc4` Feat: dashboard de atividades + remoção Funil + correções navbar

---

## 2026-04-19

### Modificações
- Performance: cache sessionStorage TTL 5min (`lib/queryCache.ts`), prefetch on hover, warmup no startup
- UX: empty state no dashboard, tooltips nas métricas, first-visit guide, tooltips navbar, descrições no funil
- Config: hooks PostToolUse + Stop no `.claude/settings.json`, post-commit hook para auto-push
- CLAUDE.md: protocolo obrigatório de commit + regras de eficiência adicionados
