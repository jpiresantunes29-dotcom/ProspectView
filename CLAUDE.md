# CLAUDE.md — Núcleo de memória do ProspectView

> Arquivos de apoio: `project_map.md` · `decisions.md` · `session_log.md`

---

## 🔵 REGRAS OPERACIONAIS — Vigência permanente

1. **Memória**: usar `project_map.md`, `decisions.md`, `session_log.md` como fonte primária. Ler arquivos do projeto só quando necessário para implementar.
2. **Atualização**: após toda mudança relevante, atualizar os arquivos de memória apropriados.
3. **Commits automáticos**: todo prompt que resultar em modificação → commit + push imediato, sem esperar solicitação.
4. **Resposta concisa**: não explicar código nem descrever longamente, salvo pedido explícito.
5. **Confirmação obrigatória** ao final de toda resposta com modificação:
   ```
   Memória atualizada: Sim / Não
   Commit criado: Sim / Não
   GitHub sincronizado: Sim / Não
   ```

---

## 🔴 PROTOCOLO PÓS-IMPLEMENTAÇÃO

```bash
npm run build        # obrigatório antes de qualquer commit
git add .
git commit -m "Tipo: descrição"
git push origin main
vercel --prod        # sempre após push
```

---

## Projeto

**ProspectView** — dashboard interno de vendas para 2 usuários.

| Usuário | Papel | Tabela principal |
|---------|-------|-----------------|
| João Pedro | Captação (prospecção) | `registros` |
| Atanael | Contato comercial | `atividades` |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2.3 (App Router) |
| Runtime | React 19 |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS v4 + CSS variables |
| Banco | Supabase (PostgreSQL) |
| Deploy | Vercel — https://prospectview.vercel.app |
| Repo | https://github.com/jpiresantunes29-dotcom/ProspectView |

---

## Arquitetura

- **Páginas principais**: `/` (dashboard), `/captacao`, `/contato`, `/historico`, `/registrar`, `/metas`
- **Removidas/redirect**: `/funil` → `/`, `/quick-log` → `/registrar`
- **Banco**: 3 tabelas — `registros`, `eventos`, `atividades` (ver `project_map.md`)
- **Cache**: `lib/queryCache.ts` — sessionStorage TTL 5min + prefetch on hover + warmup startup
- **Metas**: localStorage, não sincronizadas entre máquinas (by design)
- **Auth**: nenhuma — app interno, acesso direto ao Supabase via anon key

---

## Convenções de código

- Inline styles com CSS variables (`var(--border)`, `var(--foreground)`, etc.) — não Tailwind classes diretas
- Cores por papel: João Pedro `#4DA3F7` (azul) · Atanael `#2DB881` (verde)
- Tipos centralizados em `lib/supabase.ts`
- Métricas calculadas on-the-fly em `lib/metrics.ts` (funções puras)
- Componentes com `fontFamily: "'Segoe UI', system-ui, sans-serif"` nos botões/textos inline

---

## Regras críticas (anti-patterns)

- 🚫 Nova tabela no banco → confirmar existência no Supabase ANTES de escrever código
- 🚫 Wizard multi-step → validar ordem das etapas com usuário ANTES de implementar
- 🚫 Nunca `vercel --prod --name <x>` sem `vercel project ls` primeiro
- 🚫 Nunca desenvolver em pastas OneDrive/Dropbox
- 🚫 Nunca mostrar erro genérico — sempre exibir `error.message` real na UI
- 🚫 useEffect com fetch externo → sempre usar flag `cancelled` para cleanup
