# decisions.md — Decisões técnicas e arquiteturais

## 2026-04-20 — Wizard de atividades para Atanael

- **Decisão**: Atanael para de usar a tabela `registros` para registro diário e passa a usar um wizard guiado que salva na tabela `atividades`.
- **Motivo**: modelo antigo era formulário genérico sem contexto. Novo modelo captura tier, tipo, tentativa e status por atividade individual.
- **Impacto**: `/registrar` para Atanael agora redireciona para `/contato`. Dashboard lê `atividades`, não `registros` para Atanael.

## 2026-04-20 — Remoção da página Funil

- **Decisão**: Página `/funil` removida da navbar. Rota mantida com `redirect('/')`.
- **Motivo**: Usuário não usava mais. Simplificação da navegação.

## 2026-04-20 — Dashboard baseado em atividades

- **Decisão**: Dashboard reescrito para ler `atividades` (não `registros`).
- **Estrutura**: gráfico empilhado por `tipo_atividade` por data, filtros 7d/30d/90d, export Excel (xlsx).

## 2026-04-19 — Wizard step order: tentativa antes de status

- **Decisão**: No fluxo cold_call, o usuário informa a tentativa (1–10) ANTES de informar o status (como foi o contato).
- **Fluxo correto**: Tier → Tipo → Tentativa → Status → salva automaticamente.

## 2026-04-19 — Cache de queries com sessionStorage

- **Decisão**: Queries Supabase cacheadas em sessionStorage com TTL 5 min via `lib/queryCache.ts`.
- **Extras**: prefetch on hover nos links da navbar; warmup automático 300ms após startup.

## 2026-04-19 — Separação de tabelas por perfil

- **Decisão**: João Pedro usa `registros` (modelo agregado diário). Atanael usa `atividades` (modelo por evento individual).
- **Motivo**: workflows diferentes — JP registra totais do dia, Atanael registra cada atividade individualmente com contexto.

## 2026-04 — localStorage para metas

- **Decisão**: Metas diárias armazenadas em localStorage, não no banco.
- **Motivo**: são pessoais por máquina; não precisam sincronizar entre usuários.

## 2026-04 — Supabase direto do frontend (sem API layer)

- **Decisão**: App acessa Supabase diretamente via anon key, sem backend intermediário.
- **Motivo**: app interno, 2 usuários, sem necessidade de auth ou isolamento.
- **Revisitar se**: app se tornar público ou multi-tenant.

## 2026-04 — Cálculo de métricas on-the-fly

- **Decisão**: Métricas calculadas em `lib/metrics.ts` a cada load, sem persistência de agregados.
- **Motivo**: dataset pequeno (<1k rows), simplicidade > otimização prematura.

## Anti-patterns registrados

- 🚫 Nunca implementar código que depende de nova tabela sem confirmar que ela existe no Supabase primeiro.
- 🚫 Nunca implementar wizard multi-step sem validar a ordem das etapas com o usuário antes.
- 🚫 Nunca usar `--name` no `vercel --prod` sem verificar projetos existentes com `vercel project ls`.
- 🚫 Nunca desenvolver em pastas sincronizadas com OneDrive/Dropbox (conflito com Turbopack).
