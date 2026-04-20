# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🔵 REGRAS OPERACIONAIS — Vigência permanente

Estas regras se aplicam a **toda e qualquer interação** neste projeto, sem exceção.

### 1. Política de memória do projeto

- **Minimizar leituras de arquivos.** Antes de ler qualquer arquivo, verificar se a informação já está registrada neste CLAUDE.md.
- Só ler arquivos quando for estritamente necessário para implementar uma modificação.
- Este arquivo é a **fonte primária de contexto** do projeto.
- Após cada decisão relevante (arquitetura, estrutura, padrões, mudanças), registrar aqui imediatamente.

### 2. Registro contínuo de memória

Após cada mudança relevante, atualizar este CLAUDE.md com:
- Decisões arquiteturais tomadas
- Mudanças estruturais de páginas ou tabelas
- Padrões que passamos a seguir
- Anti-patterns identificados

### 3. Política de commits automáticos

- **Todo prompt que resultar em modificação de código gera commit automático + push**, sem esperar solicitação.
- Mensagem de commit deve ser clara e descritiva.
- O repositório remoto (GitHub) deve estar sempre sincronizado ao final da resposta.

### 4. Confirmação obrigatória ao final de cada resposta

Toda resposta que envolver modificação deve terminar com:

```
Memória atualizada: Sim / Não
Commit criado: Sim / Não
GitHub sincronizado: Sim / Não
```

---

## 🔴 PROTOCOLO OBRIGATÓRIO — Executar após TODA implementação

**Este bloco é de prioridade máxima. Toda vez que uma funcionalidade for implementada, um bug corrigido, ou qualquer alteração feita no projeto, Claude DEVE executar os passos abaixo antes de encerrar a resposta — sem exceção.**

### Passo 1 — Build & verificação
```bash
npm run build        # TypeScript + build check. NÃO commit se falhar.
```

### Passo 2 — Auto-reflexão (registrar no CLAUDE.md)
Antes de commitar, Claude DEVE responder internamente:
- **O que foi implementado?** (1-2 frases)
- **O que poderia ter sido feito diferente?** Exemplos:
  - Usei mais queries do que o necessário?
  - Criei código duplicado que deveria ser um componente?
  - Implementei sem confirmar detalhes visuais com o usuário primeiro?
  - Poderia ter proposto uma solução mais simples?
  - Fiz múltiplas rodadas quando podia ter sido uma?
- **Lição para o futuro** (1 frase acionável)

Adicionar à seção `## Lab Notes 🔬` do CLAUDE.md quando houver aprendizado relevante.

### Passo 3 — Commit + Push + Deploy
```bash
git add .
git commit -m "Tipo: Descrição clara do que foi feito"
git push origin main     # o post-commit hook faz o push automaticamente
vercel --prod            # SEMPRE fazer deploy após push
```

### Passo 4 — Confirmar ao usuário
Responder ao usuário com:
- ✅ O que foi implementado
- 🔗 URL do Vercel se houve deploy
- 💡 O que poderia ter sido feito melhor (1-2 pontos da auto-reflexão)

---

## 🟡 REGRAS DE EFICIÊNCIA — Reduzir tokens e retrabalho

1. **Medir antes de otimizar** — antes de qualquer melhoria de performance, medir o problema real (Network tab, console.time). Não assumir.
2. **Confirmar direção visual antes de codar** — para mudanças de UI, descrever textualmente o que será feito e esperar aprovação. Para bugs/lógica, implementar direto.
3. **Planejar completo antes de implementar** — quando o usuário reporta um problema (ex: "site lento", "usuário confuso"), levantar TODAS as causas possíveis antes de codar. Evita múltiplas rodadas.
4. **Extrair componentes na primeira duplicação** — se o mesmo padrão aparece pela segunda vez, criar componente reutilizável.
5. **Uma sessão = uma entrega completa** — não deixar metade no ar. Se iniciou um feature, terminar com build ✅ + commit + push + deploy.
6. **Verificar Vercel após todo push** — nunca assumir que integração GitHub está ativa. Após push, confirmar com `vercel ls` se o deploy disparou. Se não, rodar `vercel --prod` na hora.

---

## Project Overview

### What is ProspectView?

**ProspectView** is a **private lead-tracking and sales pipeline dashboard** designed for a two-person sales team. It provides real-time visibility into the lead funnel, from initial prospecting through opportunity conversion.

**Purpose:** Help João Pedro (lead qualification) and Atanael (sales contact) track metrics, monitor progress, and manage daily targets without external CRM tools.

**Key benefit:** Simple, focused dashboard with no authentication or account management — direct access to shared sales data.

### Who uses it?

- **João Pedro** — Prospecting manager (captação)
  - Finds and qualifies leads
  - Tracks "leads found" and "qualified leads" metrics
  - Monitors weekly/daily prospecting output
  
- **Atanael** — Sales contact manager (contato)
  - Contacts qualified leads
  - Books meetings and sales opportunities
  - Tracks contact attempts, responses, and meeting conversions

Both users see shared data in a unified dashboard but track different funnel stages.

### Main problems it solves

✅ **Single source of truth** — All sales metrics in one place
✅ **Real-time visibility** — See today's progress immediately
✅ **Daily goal tracking** — Monitor personal targets per user
✅ **Funnel analysis** — Understand conversion rates at each stage
✅ **No vendor lock-in** — Self-hosted, no expensive CRM subscription

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 16.2.3 |
| **Runtime** | React | 19.2.4 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui | — |
| **Database** | Supabase (PostgreSQL) | — |
| **Hosting** | Vercel (recommended) | — |
| **Version Control** | Git + GitHub | — |

### Why this stack?

- **Next.js 16 + React 19** — Latest features, best performance, TypeScript first-class support
- **TypeScript** — Type safety catches errors at compile time, not runtime
- **Tailwind CSS v4** — Utility-first, no custom CSS, design tokens as variables
- **shadcn/ui** — Pre-built, accessible components (Button, Card, Select, etc.)
- **Supabase** — PostgreSQL database with real-time API, perfect for small team projects
- **Vercel** — Built for Next.js, automatic deployments, edge functions support

### Architecture overview

```
ProspectView (Next.js App)
│
├── Frontend Layer
│   ├── app/          → Pages (routes) using App Router
│   ├── components/   → Reusable React components
│   └── lib/          → Utilities & helpers
│
├── State Management
│   ├── localStorage  → User goals (metas)
│   └── Supabase API  → Shared database (registros table)
│
└── Backend (Supabase)
    ├── registros     → Main data table (dates, metrics, users)
    └── SQL scripts   → Schema initialization
```

**Data flow:**
1. User enters data in `/registrar` page
2. Data sent to Supabase via `lib/supabase.ts`
3. All pages fetch from same table → synchronized view
4. Dashboard shows real-time metrics across both users

---

## Important: Next.js version

This project uses **Next.js 16** with **React 19** — versions likely newer than your training data. Read `node_modules/next/dist/docs/` before writing code that relies on routing, rendering, or data-fetching APIs. The App Router is in use. Do not rely on Pages Router patterns or older App Router conventions.

## Automated Browser Launch

**Important:** When you request to:
- Run the dev server (`npm run dev`)
- View the application
- Open the application

Claude will **automatically open Chrome** to the running application (usually `http://localhost:3000`) instead of just providing a link.

This happens automatically — no need to manually copy/paste URLs.

---

## Local Development Setup

### Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (v9 or higher) — Comes with Node.js
- **Git** (v2.30 or higher) — [Download](https://git-scm.com/)
- **Code editor** — VS Code recommended, with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (for better type support)

### Installation

1. **Clone the repository** (if starting fresh)
```bash
git clone https://github.com/jpiresantunes29-dotcom/ProspectView.git
cd ProspectView
```

2. **Install dependencies**
```bash
npm install
```
This installs all packages from `package.json` and creates `node_modules/`

3. **Configure environment variables**
```bash
# Copy the template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# Required:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

⚠️ **IMPORTANT:** Never commit `.env.local` — it contains sensitive keys

### Available Commands

```bash
npm run dev        # Start development server at localhost:3000
                   # Hot reload enabled — changes appear instantly
                   # Best for active development

npm run build      # Production build with type checking
                   # Catches TypeScript errors
                   # Creates optimized .next/ folder

npm run lint       # Run ESLint to check code quality
                   # Identifies style issues and potential bugs
                   # Run before committing

npm start          # Start production server (after npm run build)
                   # Used for production deployment only
```

### Development Workflow

#### Starting local development

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start dev server
npm run dev
```

Output:
```
> next dev
Local:        http://localhost:3000
```

**Open** http://localhost:3000 in your browser. The app reloads on file changes.

#### Making changes

```bash
# Edit files in the project
# For example: modify app/page.tsx, components/metric-card.tsx, etc.

# The dev server automatically reloads
# Check browser console (F12) for errors
```

**Key directories to modify:**
- `app/` — Pages and layouts (App Router)
- `components/` — Reusable React components
- `lib/` — Utility functions and helpers
- `app/globals.css` — Global styles and design tokens

#### Testing changes

```bash
# 1. Open browser to http://localhost:3000
# 2. Navigate through pages:
#    - / (Dashboard)
#    - /captacao (João Pedro's page)
#    - /contato (Atanael's page)
#    - /funil (Full funnel)
#    - /metas (Edit goals)
#    - /registrar (Data entry)

# 3. Check browser DevTools:
#    - Console (F12) for errors
#    - Network tab for API calls to Supabase
#    - Application tab for localStorage data

# 4. Test with different viewport sizes (mobile, tablet, desktop)
```

#### Code quality checks

Before committing, always run:

```bash
# Check for TypeScript errors and ESLint issues
npm run lint

# Run production build to catch type errors
npm run build
```

If either command fails, fix the issues before committing.

### Testing strategy

No automated test suite exists. Quality is ensured through:

1. **Type safety** — TypeScript catches errors at compile time
   ```bash
   npm run build  # Runs type checker
   ```

2. **Manual testing** — Test features locally before committing
   ```bash
   npm run dev    # Start dev server
   # Navigate through affected pages
   # Check browser console for errors
   # Test with actual Supabase data
   ```

3. **Code review** — Git commit history and GitHub repository visibility
   - Descriptive commits make changes easy to understand
   - GitHub shows all changes in pull requests (future enhancement)

4. **ESLint validation** — Catches common mistakes
   ```bash
   npm run lint   # Check code quality
   ```

### Common development tasks

#### Adding a new component

```bash
# 1. Create component file
# Example: components/my-component.tsx
export default function MyComponent() {
  return <div>Component content</div>
}

# 2. Import in page
# Example: in app/page.tsx or another component
import MyComponent from '@/components/my-component'

# 3. Run lint and build
npm run lint
npm run build

# 4. Test in dev server
npm run dev
# Visit http://localhost:3000 and verify it appears

# 5. Commit when complete
# (Automated process triggers)
```

#### Modifying a page

```bash
# 1. Edit page file
# Example: app/captacao/page.tsx

# 2. Check browser (dev server auto-reloads)
# http://localhost:3000/captacao

# 3. Verify Supabase data loads correctly
# Check browser Network tab for API calls

# 4. Run quality checks
npm run lint
npm run build

# 5. Commit when complete
```

#### Updating Supabase connection

```bash
# 1. If credentials change, update .env.local
NEXT_PUBLIC_SUPABASE_URL=https://new-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=new-key-here

# 2. Stop dev server (Ctrl+C) and restart
npm run dev

# 3. Test that data loads correctly
# Navigate to pages and check for Supabase errors

# 4. Do NOT commit .env.local
# (Already in .gitignore)
```

### Troubleshooting

#### Port 3000 already in use

```bash
# Option 1: Kill process on port 3000
lsof -i :3000  # Find process ID
kill -9 <PID>  # Kill it

# Option 2: Use different port
PORT=3001 npm run dev
```

#### Dependencies out of date

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript errors on startup

```bash
# Run build to see full error list
npm run build

# Most errors are in your IDE too (if configured)
# Fix them and run build again
```

#### Supabase connection errors

```bash
# 1. Verify .env.local has correct credentials
cat .env.local

# 2. Check browser Network tab (F12) for API errors
# Look for requests to .supabase.co

# 3. Verify Supabase project is active and credentials are valid

# 4. Restart dev server if credentials changed
npm run dev
```

#### Changes not appearing

```bash
# 1. Check if dev server is running
#    Terminal should show "Local: http://localhost:3000"

# 2. Hard refresh browser
#    Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# 3. Check browser console (F12) for errors
#    Scroll up to see initial load errors

# 4. Restart dev server
#    Stop with Ctrl+C, then npm run dev
```

### Performance tips

- **Hot reload:** Dev server reloads on file save (no manual refresh)
- **CSS in dev:** Tailwind classes compile on-demand, fast compilation
- **Console output:** Watch terminal for React warnings (red/yellow text)
- **Network throttling:** Use DevTools Network tab to simulate slow connections

### Browser DevTools (F12)

Essential tools for development:

| Tab | Use |
|-----|-----|
| **Console** | Check for JavaScript errors and warnings |
| **Network** | Monitor API calls to Supabase |
| **Application** | Inspect localStorage (goals), session storage |
| **Elements** | Inspect HTML and CSS classes |
| **Sources** | Debug JavaScript with breakpoints |

### Keyboard shortcuts (VS Code)

- `Ctrl+/` — Toggle comment
- `Alt+Up/Down` — Move line up/down
- `Ctrl+D` — Select word (use multiple times for multiple selections)
- `Shift+Alt+F` — Format document (requires Prettier extension)
- `Ctrl+Shift+P` — Command palette (run any VS Code command)

## Environment

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Application Architecture

### Data Model

**Core table:** `registros` (Supabase PostgreSQL)

One row per (date, user) pair with numeric fields for each funnel stage. Uses upsert on conflict to allow updates.

**Funnel stages** (in order):
1. `empresas_encontradas` — Prospects identified
2. `leads_qualificados` — Leads qualified (João Pedro's output)
3. `enviados_crm` — Forwarded to CRM system
4. `leads_contatados` — Contacted (Atanael's starting point)
5. `respostas` — Positive responses received
6. `interessados` — Prospects interested in product
7. `reunioes_marcadas` — Meetings scheduled
8. `oportunidades` — Sales opportunities

**Key fields:**
- `data` — Date of entry (YYYY-MM-DD)
- `usuario` — User identifier ("João Pedro" or "Atanael")
- Numeric fields for each funnel stage (integers)
- `created_at`, `updated_at` — Timestamps

**Example row:**
```
data: 2026-04-16
usuario: João Pedro
empresas_encontradas: 45
leads_qualificados: 12
enviados_crm: 8
...
```

### Goals (Metas)

Daily targets are stored in **browser localStorage** — not shared between machines/users.

**Structure:**
```typescript
{
  "João Pedro": {
    empresas_encontradas: 10,
    leads_qualificados: 3,
    enviados_crm: 2
  },
  "Atanael": {
    leads_contatados: 20,
    respostas: 5,
    reunioes_marcadas: 2
  }
}
```

**Why localStorage?**
- ✅ Different users can have different targets on different machines
- ✅ Targets are private to each user/device
- ✅ No need for authentication or user management
- ❌ Targets don't sync across machines (by design)

### Key Components & Files

#### Core utilities (`lib/`)

| File | Purpose |
|------|---------|
| `supabase.ts` | Supabase client initialization + `Registro` type definition |
| `metrics.ts` | Pure functions for calculations: `somarRegistros()`, `buildFunil()`, `pct()`, `diasUteis()`, `porDia()` |
| `metas.ts` | localStorage helpers: `getMetas()`, `saveMetas()`, `defaultMetas()` |
| `theme.tsx` | Design tokens and color constants |
| `utils.ts` | General utilities (formatting, date handling) |

#### Key components (`components/`)

| Component | Purpose |
|-----------|---------|
| `metric-card.tsx` | **Main display unit** — Shows single metric with count-up animation, delta vs previous period, progress bar towards goal |
| `filtro-periodo.tsx` | Period selector (`7d`, `30d`, `90d`, `mes`) — Used across all pages |
| `navbar.tsx` | Top navigation with green/gray user status dots + animated pill indicator |
| `count-up.tsx` | Animated counter component (increments smoothly from 0 to target) |
| `skeleton.tsx` | Loading placeholder while data fetches |
| `animated-title.tsx` | Dashboard title with animation |
| `ui/*` | shadcn/ui components (Button, Card, Select, Input, Label, Tabs) |

#### Pages (`app/`)

| Route | Purpose | Key Features |
|-------|---------|--------------|
| `/` | **Dashboard** — Overview of both users | 4 metric cards (metrics for each user), weekly bar chart, nav indicators |
| `/captacao` | **João Pedro's detail page** | 3 metric cards (empresas, qualificados, enviados), weekly/daily charts, specific KPIs |
| `/contato` | **Atanael's detail page** | 4 metric cards (contatados, respostas, interessados, reuniões), weekly chart, sales focus |
| `/funil` | **Full funnel view** | All 8 funnel stages, conversion rates between each stage, total volume |
| `/historico` | **Records table** | All historical data, filterable by user/date, edit capability |
| `/metas` | **Goal management** | Edit daily targets per person per metric, localStorage persistence |
| `/registrar` | **Data entry form** | Daily input form, upserts to Supabase, separate entries per user |
| `/diagnostico` | Development/debugging | (Not in main navigation) |
| `/metricas-tier` | Advanced metrics | (Not in main navigation) |
| `/quick-log` | Quick entry | (Not in main navigation) |

### Data Flow

```
User enters data in /registrar
        ↓
Form sends to Supabase via lib/supabase.ts
        ↓
Upserted into registros table (date + user unique)
        ↓
Other pages query Supabase on load
        ↓
lib/metrics.ts calculates aggregates (sum, percentage, rates)
        ↓
Components render metric cards with animations
        ↓
Navbar shows green/gray dots (data entered today?)
        ↓
Dashboard + detail pages show real-time metrics
```

### Component Hierarchy

```
layout.tsx (Root layout)
├── navbar.tsx
│   ├── Green/gray dots (user status)
│   └── Animated pill indicator
│
└── Pages
    ├── page.tsx (Dashboard)
    │   ├── metric-card.tsx × 4 (overview metrics)
    │   ├── filtro-periodo.tsx (period selector)
    │   └── Recharts BarChart (weekly data)
    │
    ├── /captacao/page.tsx
    │   ├── metric-card.tsx × 3
    │   ├── filtro-periodo.tsx
    │   ├── BarChart (weekly)
    │   └── LineChart (daily)
    │
    ├── /contato/page.tsx
    │   ├── metric-card.tsx × 4
    │   ├── filtro-periodo.tsx
    │   └── BarChart (weekly)
    │
    ├── /funil/page.tsx
    │   ├── Funnel visualization
    │   └── Conversion rate display
    │
    ├── /metas/page.tsx
    │   └── Input forms (goal editing)
    │
    └── /registrar/page.tsx
        └── Data entry form
```

### Styling System

**Tailwind CSS v4** with design tokens as CSS variables

Configuration in `app/globals.css`:
```css
:root {
  --color-captacao: #60A5FA;     /* João Pedro - blue */
  --color-contato: #34D399;      /* Atanael - green */
  --color-taxa: #FBBF24;         /* Rates - amber */
  --color-resultado: #F472B6;    /* Results - pink */
  --font-geist: ...;             /* Body font */
  --font-display: ...;           /* Numbers font */
}
```

**Color coding by role:**
- **Blue (#60A5FA)** — Captação (João Pedro)
- **Green (#34D399)** — Contato (Atanael)
- **Amber (#FBBF24)** — Conversion rates (taxa)
- **Pink (#F472B6)** — Results (resultado)

**Fonts:**
- **Geist** — Body text, regular content
- **Cormorant Garamond** — Display/numbers (large, elegant)

**Components:**
- All shadcn/ui components in `components/ui/`
- Customized with Tailwind for color coding
- Responsive design for mobile/tablet/desktop

### Navigation

**Top Navbar (always visible)**
- Logo + "ProspectView"
- Nav links: DASHBOARD, FUNIL, CAPTAÇÃO, CONTATO, etc.
- Green/gray dots showing which user entered data today
- Animated pill indicator for current page
- Mobile hamburger menu

**Pages accessible from navbar**
- Home (/)
- Funil (/funil)
- Captação (/captacao)
- Contato (/contato)
- Plus additional pages in dropdown

### Real-time Updates

**Navbar updates on every route change:**
- Queries Supabase to check if each user has data for today
- Shows green dot if data exists, gray if not
- Uses `useLayoutEffect` for animated pill movement

**Pages don't auto-refresh:**
- Load data on mount
- Updates only on page refresh or manual reload
- Future enhancement: WebSocket for real-time sync

## Version Control Workflow

This project is **version-controlled on GitHub** at: https://github.com/jpiresantunes29-dotcom/ProspectView

All code changes are tracked, committed, and synchronized with the remote repository to maintain a complete history of development.

### Repository setup

- **Remote:** `origin` → `https://github.com/jpiresantunes29-dotcom/ProspectView.git`
- **Primary branch:** `main`
- **Protection:** All significant changes must be committed and pushed
- **Local state:** Always synced with remote

### Automated commit strategy

**IMPORTANT: Automatic commits are triggered in two ways:**

#### 1. **On-Demand Automatic Commits** (Manual triggers)
Triggered when:
- ✅ A feature is completed and working
- ✅ You write "checkpoint" in a message
- ✅ You explicitly request it
- ✅ After significant code changes (components, pages, logic)

**AUTOMATIC WORKFLOW:**
1. `git add .` — Stage all changes (respecting .gitignore)
2. Create commit with descriptive message summarizing changes
3. `git push origin main` — Push to GitHub immediately

#### 2. **Scheduled Automatic Commits** (Every 2 hours)
A background scheduled task runs every 2 hours to:
1. Check for important changes in the working directory
2. Filter out unimportant files (node_modules, .next, .env.local, logs, OS files)
3. Commit only important changes:
   - `app/`, `components/`, `lib/` directories
   - Configuration files (*.json)
   - Documentation (*.md)
   - TypeScript files (*.ts, *.tsx)
4. Automatically push to `origin/main` if changes were committed

**Files that are NEVER committed (protected by .gitignore):**
- ❌ `node_modules/` — dependencies (reinstalled on npm install)
- ❌ `.next/` — build cache (auto-generated)
- ❌ `.env.local` — credentials (never uploaded)
- ❌ `*.log` — temporary logs
- ❌ `.vercel/`, `.vscode/` — generated configs
- ❌ OS files (`Thumbs.db`, `.DS_Store`)

**You don't need to do anything!** — Changes are automatically detected, filtered, and pushed to GitHub on schedule.

**Status of scheduled task:**
- ✅ Enabled: `auto-commit-github`
- ⏱️ Frequency: Every 2 hours
- 📍 Location: `.claude/scheduled-tasks/auto-commit-github/SKILL.md`
- 🔔 Notifications: Enabled (you'll see results in the sidebar)

This ensures the remote repository stays in sync with local work and maintains a clean, organized commit history.

### Standard synchronization process

When you complete work or say "checkpoint", this automated process runs:

```bash
# Step 1: Stage all changes (excluding .gitignore files)
git add .

# Step 2: Create a descriptive commit
git commit -m "Feat: Add new component

- Describe what was added or changed
- List multiple changes if applicable
- Use clear, concise language"

# Step 3: Push to GitHub immediately
git push origin main
```

**Result:** Your changes are now in the remote repository and backed up.

### Commit message guidelines

1. **Write descriptive commit messages**
   - Use imperative mood: "Add X" not "Added X"
   - Be specific about what changed: prefer "Add modal for editing goals" over "Update UI"
   - First line is the summary (max 72 characters)
   - Optional: Add detailed explanation after blank line
   - Example format:
     ```
     Add metric card animation and delta calculation
     
     - Implement count-up animation in metric-card.tsx
     - Add delta calculation vs previous period
     - Add meta progress bar visualization
     ```

2. **Group related changes in a single commit**
   - If a feature involves changes to multiple files (component + styles + logic), commit together
   - Keep related changes grouped, separate unrelated changes into different commits
   - One feature = one commit (unless it's large, then break logically)
   - Good grouping improves code review and git history readability

3. **Never commit sensitive files**
   - ❌ `.env.local` — contains Supabase keys (use `.env.local.example` instead)
   - ❌ `node_modules/` — already in .gitignore
   - ❌ `.next/` — build cache, already in .gitignore
   - ❌ `*.log` files — temporary logs
   - ❌ `.DS_Store`, `Thumbs.db` — OS files
   - ✅ Always verify changes with `git status` or `git diff` before committing

### Commit types

Use these prefixes for clarity and consistency:

| Type | Usage | Example |
|------|-------|---------|
| **Feat** | New feature or functionality | `Feat: Add goal editing modal` |
| **Fix** | Bug fix | `Fix: Correct metric calculation logic` |
| **Docs** | Documentation changes | `Docs: Update README with setup steps` |
| **Style** | Code style (formatting, etc.) | `Style: Format component imports` |
| **Refactor** | Code refactoring (no functionality change) | `Refactor: Extract metric utils` |
| **Perf** | Performance improvements | `Perf: Optimize dashboard queries` |
| **Test** | Test-related changes | `Test: Add unit tests for metrics` |
| **Chore** | Dependencies, build scripts | `Chore: Update Next.js to 16.2.4` |

### Development workflow (step by step)

```bash
# 1. Make changes to files
#    Edit components, pages, styles, logic, etc.

# 2. Test locally with dev server
npm run dev
#    Verify changes work as expected
#    Check browser console for errors
#    Test in both user accounts if needed

# 3. Once feature is complete OR you say "checkpoint"
#    Automatic process runs:
#    - git add .
#    - git commit -m "Feat: description..."
#    - git push origin main

# 4. Verify push was successful
#    Check GitHub repository to confirm changes are live
```

### Checking status and history (manual commands)

When you need to check the state of your repository:

```bash
git status                   # See unstaged changes and branch status
git log --oneline -10        # See recent commits (last 10)
git log --oneline            # See full commit history
git remote -v               # Verify GitHub remote configuration
git diff                     # Review changes before staging
git diff --cached            # Review staged changes
git show <commit-hash>       # View specific commit details
```

### Remote synchronization checklist

Before and after significant work:

- [ ] Run `npm run build` to catch type errors
- [ ] Run `npm run lint` to check code quality
- [ ] Test locally with `npm run dev`
- [ ] Review changes with `git status` and `git diff`
- [ ] Commit with clear message using appropriate type prefix
- [ ] Verify push was successful with `git log --oneline -1`
- [ ] Check GitHub repository to confirm remote is updated

### Common scenarios

**Scenario 1: Add a new component**
```bash
# After creating app/components/new-component.tsx
Feat: Add NewComponent with styling

- Implement NewComponent in components/
- Add TypeScript types and props
- Add Tailwind styling with design tokens
```

**Scenario 2: Fix a bug**
```bash
Fix: Correct metric calculation for accumulated totals

- Fix off-by-one error in somarRegistros()
- Add test case to verify fix
- Update related documentation
```

**Scenario 3: Refactor code**
```bash
Refactor: Extract metric utilities into separate module

- Move metrics functions to lib/metrics-utils.ts
- Update imports in affected components
- Maintain same functionality and API
```

### Important reminders

- 🔒 **Never push sensitive data** — .env files are always excluded
- 📝 **Commit messages matter** — They help future developers understand changes
- ⏱️ **Commit frequently** — Smaller commits are easier to review and revert if needed
- 🔄 **Keep main branch clean** — Always push working code
- 🌐 **Remote is source of truth** — GitHub repository is the official version

---

## Technical Decisions & Learnings

This section documents architectural choices, lessons learned, and practical insights from development.

### Architecture Decisions Made

#### 1. localStorage for Goals (Metas) — NOT Shared Between Machines

**Decision:** Store daily targets in browser localStorage instead of Supabase database.

**Why this decision:**
- ✅ Goals are personal to each user and machine
- ✅ Different users might have different targets on different days
- ✅ No need for authentication or user profiles
- ✅ Fast access (no network calls)
- ✅ Privacy — goals never leave the local machine

**Trade-off:**
- ❌ Goals don't sync across machines
- ❌ If user switches computers, must re-enter targets
- ❌ No historical goal tracking

**When this would change:**
- If users need goals synced across multiple devices
- If we want to track goal accuracy over time
- If we need admin to set team-wide targets

**Lesson:** Accept intentional limitations when they match user workflow. Both João Pedro and Atanael work from the same location.

---

#### 2. Single registros Table for Both Users

**Decision:** Share one PostgreSQL table with data from both João Pedro and Atanael instead of separate tables per user.

**Why:**
- ✅ Easy to compare metrics between users (same table)
- ✅ Unified dashboard showing both perspectives
- ✅ Simple data model (no complex joins)
- ✅ Natural partition by (data, usuario) unique constraint
- ✅ Simpler SQL queries

**Trade-off:**
- ❌ Must filter by `usuario` in most queries
- ❌ Both users can see each other's data (intentional — shared team dashboard)
- ❌ Harder to separate permissions if ever needed

**When this would change:**
- If we need per-user data privacy
- If we have 10+ users (harder to manage in single table)
- If we need different data schemas per role

**Lesson:** Simplicity > normalization for small projects with shared data. Premature separation creates unnecessary complexity.

---

#### 3. No Authentication or User Accounts

**Decision:** Direct access to app, no login/signup/password management. Just choose your name when entering data.

**Why:**
- ✅ App is internal-only (not public-facing)
- ✅ Only 2 users, no identity verification needed
- ✅ Faster development (no auth library, no password reset logic)
- ✅ Fewer moving parts = fewer bugs
- ✅ No user management overhead

**Trade-off:**
- ❌ No audit trail (can't see who changed what)
- ❌ No permission system (all data visible to all)
- ❌ Users could accidentally enter data for the other person

**When this would change:**
- If app becomes public
- If we need legal audit trails
- If we have multiple teams with private data
- If we need role-based access control

**Lesson:** Perfect for internal tools. But would need auth for public/multi-tenant scenarios.

---

#### 4. Calculated Metrics (No Persistence)

**Decision:** Calculate metrics on-the-fly from registros table using `lib/metrics.ts` functions. Don't store pre-calculated aggregates.

**Why:**
- ✅ Always fresh data (no sync issues between raw + aggregate)
- ✅ Single source of truth (registros table only)
- ✅ lib/metrics.ts functions are pure (testable, memoizable)
- ✅ Simple to understand data flow
- ✅ Fast calculations for small dataset

**Trade-off:**
- ❌ Slower with very large datasets (>100k rows)
- ❌ Recalculate on every page load (not cached)
- ❌ Database doesn't pre-compute aggregates

**Current performance:**
- Metrics calculation: <100ms (acceptable for 1k rows)
- Page load: 1-2 seconds (mostly Supabase latency)

**When this would change:**
- If dataset grows to 100k+ records (add caching layer)
- If metrics queries become slow (add database views/materialized views)
- If we need sub-second response times (add Redis cache)

**Lesson:** Premature optimization is evil. Wait for actual performance issues before optimizing. Current approach works perfectly for our scale.

---

#### 5. Supabase as Backend (Not Custom API)

**Decision:** Use Supabase directly from frontend (via `lib/supabase.ts`) instead of building custom backend API.

**Why:**
- ✅ Faster to build (no API server needed)
- ✅ Built-in real-time subscriptions
- ✅ PostgreSQL power without backend
- ✅ Automatic scaling (Supabase handles it)
- ✅ One less service to deploy

**Trade-off:**
- ❌ Front-end directly queries database (security risk in public apps)
- ❌ No business logic layer
- ❌ Harder to implement complex workflows

**Security note:** This works because app is internal-only. For public apps, would need API layer.

**When this would change:**
- If app becomes public (add API server, RLS policies)
- If we need complex business logic
- If we want to rate-limit queries
- If we need API versioning

**Lesson:** Direct database access is fine for small internal tools. Becomes problematic at scale or with public exposure.

---

### Recent Learnings

#### Learning 1: Repository Structure Bug (SOLVED ✅)

**Problem:** Initial GitHub push put all files in `prospectview/` subfolder. Repository showed as empty on GitHub (size: 0).

**Root cause:** Files were nested in subfolder instead of at repository root.

**Impact:** GitHub couldn't display files; users saw empty repo despite commits being pushed.

**How we fixed it:**
```bash
# Removed submodule mode
git rm --cached prospectview

# Moved all files to root
mv prospectview/* .
mv prospectview/.[a-zA-Z]* .

# Recommitted
git add .
git commit -m "Refactor: Reorganize repository structure"
git push origin main
```

**Lesson learned:** 
- ✅ Always put project files at repository root, not in subfolders
- ✅ GitHub respects .gitignore patterns but expects main files at root
- ✅ Verify repository visibility after first push (check size, file count)
- ✅ Restructuring is harder than getting it right first time

---

#### Learning 2: OneDrive Path Issues with Turbopack (SOLVED ✅)

**Problem:** Dev server failed with Turbopack panic when project was in OneDrive synced path.

**Error message:**
```
FATAL: failed to create directory "C:\Users\User\OneDrive - Grupo Marista\...\CLAUDE.md" 
for write to ".next\dev\static\chunks"
Caused by: Acesso negado (os error 5)
```

**Root cause:** OneDrive path contained special characters and had permission restrictions on `.next` folder creation.

**Impact:** Dev server crashed on startup, couldn't develop locally.

**How we fixed it:** Moved project to local directory `C:\Projetos\Gestao_Leads` (not synced with OneDrive).

**Lesson learned:**
- ✅ NEVER keep development projects in OneDrive/Google Drive/Dropbox
- ✅ Cloud sync + local development = permission nightmares
- ✅ Cloud sync interferes with build tools (Turbopack, webpack, esbuild)
- ✅ Use local directory for dev, push to GitHub for backup
- ✅ Check project location if getting permission errors in build tools

**Takeaway:** Local storage only for development. Use GitHub for remote backup.

---

#### Learning 3: Git Branch Mismatch Causes Empty Repo (SOLVED ✅)

**Problem:** Commits pushed to GitHub but repo showed size:0 and no files visible.

**Root cause:** Branch configuration mismatch:
- Local: pushing to `main` branch
- GitHub: repository defaulted to `master` branch
- Files were going to wrong branch

**How we fixed it:**
```bash
# Push main to master temporarily
git push origin main:master

# Created new repo with correct branch configuration
gh repo create ProspectView --public --source=. --remote=origin --push
```

**Lesson learned:**
- ✅ Verify remote branch configuration: `git branch -a`
- ✅ Check GitHub repository settings (default branch)
- ✅ When in doubt, create new repository with correct branch
- ✅ Always verify first push worked (check GitHub directly)

**Takeaway:** Branch mismatches are silent failures. Always verify remote state after first push.

---

### Known Limitations

1. **No automated tests**
   - Type safety via TypeScript is the only quality gate
   - Manual testing required before commit
   - Would add Jest + React Testing Library if codebase grows

2. **No real-time sync between users**
   - Pages don't auto-refresh when other user enters data
   - Users must manually refresh page to see new data
   - Navbar shows user status (who entered today) but that's all
   - Future: Add WebSocket for real-time updates

3. **No audit trail**
   - No record of who changed what and when
   - Can't track metric corrections or mistakes
   - Future: Add audit log table

4. **Small dataset optimization**
   - Current approach works for ~1,000 records
   - At 100k+ records, would need:
     - Database indexing on (data, usuario)
     - Cached metric calculations
     - Pagination in /historico page
     - Virtual scrolling for tables

5. **Goals not shared between machines**
   - localStorage = local to one browser
   - Each machine has its own goals
   - Intentional design, would need database if goals should sync

6. **No data export**
   - Can view data in /historico but can't export to CSV/Excel
   - Data lives in Supabase; manual export from dashboard possible

---

### Future Improvements (Not Yet Implemented)

**High Priority:**
- [ ] WebSocket integration for real-time page updates (users see data change instantly)
- [ ] Automated test suite (Jest + React Testing Library)
- [ ] Advanced filtering in /historico (date range, user, metric ranges)

**Medium Priority:**
- [ ] Data export to CSV/Excel from /historico
- [ ] Mobile app (React Native) sharing same Supabase backend
- [ ] Audit log (who changed what/when)
- [ ] Recurrence rules for goals (set once, auto-apply daily)
- [ ] SMS/email notifications (goal hit, goal missed, milestone reached)

**Low Priority (Not Needed):**
- [ ] Dark mode (focused on readability, current design sufficient)
- [ ] Multiple teams (built for 2 people; would need auth + permissions)
- [ ] Advanced analytics (current dashboard sufficient)

---

### Deployment & Environment

#### Local Development
```bash
npm run dev              # Dev server at localhost:3000
# Database: Supabase (shared test instance)
# Config: .env.local (contains credentials, not committed)
```

#### Production (Not Yet Deployed)

**Recommended:** Vercel (native Next.js support)
```bash
npm run build            # Create optimized build
vercel deploy            # Deploy to Vercel
```

**Alternative options:**
- Railway, Render, Heroku (any Node.js host)
- Requires: Supabase (separate prod instance recommended)

**Configuration:**
- `.env.local` — Contains Supabase credentials (NOT committed, use .env.local.example)
- `.env.production` — Production Supabase credentials (set via Vercel dashboard)
- Build output: `.next/` folder (auto-generated, not committed)

**Setup checklist:**
- [ ] Create production Supabase instance
- [ ] Run `supabase-setup.sql` in production database
- [ ] Set environment variables in deployment platform
- [ ] Test deployment with real data
- [ ] Set up monitoring/error tracking

---

### Performance Considerations

#### What We've Optimized

✅ **Component animations use CSS, not JavaScript**
- Count-up animation uses CSS transitions
- Navbar pill indicator uses `offsetLeft` + `useLayoutEffect`
- Result: Smooth 60fps animations

✅ **Metrics calculated with pure functions**
- `lib/metrics.ts` functions are pure (no side effects)
- Easy to memoize with React.memo if needed
- Result: <100ms calculation time

✅ **Navbar fetches efficiently**
- Uses `useLayoutEffect` (not useEffect) to avoid layout shift
- Runs on route change (not on every render)
- Result: Smooth visual indicator animation

#### What Could Be Optimized (If Needed)

[ ] Memoize metric calculations for 100k+ rows
[ ] Virtual scrolling for /historico table (if data > 1000 rows)
[ ] Incremental Static Generation (ISG) for pages
[ ] Database indexes on (data, usuario) for faster queries
[ ] Redis cache for metric aggregates (if response time > 2s)

#### Current Performance Baseline

- **Page load:** 1-2 seconds (mostly Supabase latency)
- **Metrics calculation:** <100ms
- **Animations:** 60fps (smooth)
- **Bundle size:** ~150kb (gzipped)

---

### Security Notes

#### What's Protected ✅

- ✅ `.env.local` — Never committed, contains Supabase credentials
- ✅ `node_modules/` — Never committed, regenerated on `npm install`
- ✅ Build output (`.next/`) — Never committed, generated on build

#### What's NOT Protected (Intentional Design)

- Data is visible to both users (it's a shared team dashboard)
- No per-record permissions (all users see all data)
- Direct Supabase access from frontend (works because internal-only)

#### For Production Deployment

Consider implementing:
- [ ] Supabase Row-Level Security (RLS) policies if making multi-team
- [ ] Separate test/prod Supabase instances
- [ ] Add authentication if ever making public
- [ ] API layer to enforce business logic
- [ ] Rate limiting on Supabase queries

**Current security assumption:** App is internal-only, accessed by trusted team members only.

---

## Main Features & Functionality

### 1. Dashboard (`/`)

**Real-time sales overview for both team members**

**What it shows:**
- **4 key metric cards** — Current period performance
  - João Pedro's metrics (captação focus)
  - Atanael's metrics (contato focus)
  - Animated count-up for visual impact
  - Delta (change vs previous period) displayed
  - Progress bar towards daily goals
- **Weekly bar chart** — Last 7 days trend
- **User status indicators** — Green/gray dots showing who entered data today

**Use case:** Check team performance at a glance, see if daily targets are on track

### 2. Captação Detail (`/captacao`)

**João Pedro's prospecting metrics in depth**

**What it shows:**
- **3 primary metric cards:**
  - Empresas encontradas (prospects found)
  - Leads qualificados (qualified leads)
  - Enviados ao CRM (forwarded to CRM)
- **Weekly bar chart** — 7-day trend for each metric
- **Daily line chart** — Intra-week performance
- **Period selector** — View 7d, 30d, 90d, or current month

**Use case:** Track prospecting volume, identify productive days, monitor qualification rate

### 3. Contato Detail (`/contato`)

**Atanael's sales contact metrics in depth**

**What it shows:**
- **4 primary metric cards:**
  - Leads contatados (contacts made)
  - Respostas (positive responses)
  - Interessados (prospects interested)
  - Reuniões marcadas (meetings booked)
- **Weekly bar chart** — Contact volume and conversion
- **Period selector** — View different time windows
- **Conversion tracking** — See response and interest rates

**Use case:** Monitor sales activity, track meeting bookings, measure contact-to-meeting conversion

### 4. Full Funnel View (`/funil`)

**Complete lead pipeline with conversion rates**

**What it shows:**
- **All 8 funnel stages** in sequence:
  1. Empresas encontradas → 2. Leads qualificados → 3. Enviados CRM
  4. Leads contatados → 5. Respostas → 6. Interessados
  7. Reuniões marcadas → 8. Oportunidades
- **Volume at each stage** — How many at each funnel level
- **Conversion rates between stages** — % that move forward
- **Bottleneck identification** — Where do most leads drop?

**Use case:** Understand sales process efficiency, identify pipeline leaks, improve process

### 5. Daily Data Entry (`/registrar`)

**Input form for daily metrics**

**What it does:**
- **Separate entry per user** — João Pedro enters his metrics, Atanael enters his
- **All 8 funnel stages** — Enter complete data or just what changed
- **Date selection** — Can backfill past data if needed
- **Smart upsert** — Updates existing record if date+user already exists
- **Validation** — Ensures numeric input

**Use case:** Record daily prospecting and sales activities, keep data current

**Example flow:**
```
João Pedro enters:
  Date: 2026-04-16
  Empresas encontradas: 45
  Leads qualificados: 12
  Enviados CRM: 8
  
Clicks "Registrar"
  ↓
Data upserted to Supabase registros table
  ↓
Dashboard updates with new metrics
```

### 6. Goal Management (`/metas`)

**Set and track daily targets per person**

**What it does:**
- **Individual goal setting** — Each user sets own targets
- **Per-metric goals** — Set separate targets for each funnel stage
- **localStorage persistence** — Goals saved locally (not shared)
- **Progress visualization** — Metric cards show progress bar to goal

**Use case:** Set ambitious targets, track daily progress, motivate team

**Example goals:**
```
João Pedro targets:
  - 50 empresas encontradas/day
  - 15 leads qualificados/day
  - 10 enviados CRM/day

Atanael targets:
  - 30 leads contatados/day
  - 8 respostas/day
  - 3 reuniões marcadas/day
```

### 7. Historical Records (`/historico`)

**Access all past entries and trends**

**What it shows:**
- **Complete data table** — All historical entries
- **Filterable by user** — See only João Pedro's or Atanael's data
- **Sortable by date** — Newest first or oldest first
- **Edit capability** — Update past entries if needed
- **Export-ready format** — Copy data for analysis

**Use case:** Review history, correct errors, analyze trends over time

### 8. Analytics & Metrics (Automatic)

**Automatic calculations across all pages**

**What's calculated:**
- **Daily totals** — Sum of metrics per day
- **Period aggregates** — Total for selected period (7d, 30d, 90d, month)
- **Conversion rates** — % moving between funnel stages
- **Deltas** — Change vs previous period
- **Working days** — Exclude weekends from trends

**Examples:**
```
empresas_encontradas: 450 (total found this month)
leads_qualificados: 135 (28% of found → qualified)
taxa_resposta: 42% (5 responses / 12 contacted)
Δ (delta): +15% (vs previous month)
```

### 9. Visual Design & UX

**Role-based color coding**

Each role has a distinct visual identity:
- **João Pedro (Captação)** — Blue (#60A5FA)
- **Atanael (Contato)** — Green (#34D399)
- **Conversion rates** — Amber (#FBBF24)
- **Results/Outcomes** — Pink (#F472B6)

**Key visual elements:**
- Animated metric cards (count-up animation)
- Smooth transitions on data load
- Color-coded charts and bars
- Status indicators (green/gray dots)
- Responsive design (works on mobile, tablet, desktop)
- Clean, minimal layout focusing on metrics

### 10. Performance Tracking

**Automatic insights**

**Available metrics:**
- **Daily performance** — How did each day compare?
- **Weekly trends** — Is activity increasing or decreasing?
- **Period comparison** — This month vs last month
- **Funnel health** — Are conversion rates improving?
- **Goal progress** — On track for daily/period targets?

---

## Feature Summary Table

| Feature | João Pedro | Atanael | Both |
|---------|-----------|---------|------|
| Dashboard overview | ✓ | ✓ | ✓ |
| Detail page metrics | ✓ | ✓ | — |
| Data entry form | ✓ | ✓ | — |
| Full funnel view | ✓ | ✓ | ✓ |
| Historical data | ✓ | ✓ | ✓ |
| Goal setting | ✓ | ✓ | — |
| Metric visualizations | ✓ | ✓ | ✓ |
| User status (who entered today) | ✓ | ✓ | ✓ |
| Period selection (7d/30d/90d) | ✓ | ✓ | ✓ |
| Conversion rate tracking | ✓ | ✓ | ✓ |

---

## Lab Notes 🔬

This section documents real development experiences, mistakes, successes, and anti-patterns. Think of this as a researcher's notebook — what worked, what failed, what should never be repeated.

### ✅ What Worked Well

#### 1. **TypeScript-First Development**
**What:** Writing all components with full TypeScript types from the start.

**Why it worked:**
- Caught 15+ potential bugs at compile time (before reaching runtime)
- Made refactoring safer — rename a type and find all usages
- Reduced debugging time significantly
- Provided excellent IDE autocomplete

**Lesson:** Types are not overhead; they're insurance. Invest in them early.

---

#### 2. **Splitting Metrics Logic into lib/metrics.ts**
**What:** All calculation functions in one pure utility file, not scattered in components.

**Why it worked:**
- Easy to test each metric function independently
- Reusable across multiple pages (dashboard, captacao, contato, funil)
- Easy to understand data transformation pipeline
- Can memoize if performance becomes issue

**Example benefit:** When we realized conversion rates were calculated wrong, we fixed ONE place and all pages got the fix.

**Lesson:** Extract pure business logic to utilities. Components should only handle UI concerns.

---

#### 3. **Component-Driven Development**
**What:** Build reusable components (metric-card, filtro-periodo, skeleton) instead of duplicating code.

**Why it worked:**
- Reduced codebase by ~30%
- Styling changes apply everywhere (color consistency)
- If metric-card animation improves, all pages benefit
- Adding new page required 1 hour instead of 1 day

**Lesson:** Reusable components save time and ensure consistency.

---

#### 4. **Design Tokens as CSS Variables**
**What:** Define colors and spacing in `:root` CSS variables instead of hardcoded values.

**Why it worked:**
- Color scheme is cohesive (blue for captacao, green for contato)
- If brand colors change, update one place
- Easy to add dark mode later (just swap variables)
- Developers don't need to remember hex codes

**Lesson:** CSS variables are underrated. Use them for all design tokens.

---

#### 5. **Automated Commit & Push Workflow**
**What:** Commit and push immediately after features complete (not accumulating changes).

**Why it worked:**
- Cleaner git history (each feature is one commit)
- Easier to review individual changes

---

#### 6. **Unifying Two Pages into One with Mode Toggle**
**What:** Merged `/quick-log` and `/registrar` into a single page with Rápido/Manual toggle.

**Why it worked:**
- Single entry point from the navbar (less confusion for users)
- Both modes share the same fields and data — no duplication
- `/quick-log` now redirects automatically to `/registrar` (no broken links)
- UX cleaner: user learns one place for all registration tasks

**Lesson:** When two pages do the same thing differently, merge them with a mode toggle. Don't maintain two separate pages.

---

#### 7. **Corporate Design Without Emojis**
**What:** Replaced emoji buttons with text-only uppercase labels + color-coded borders.

**Why it worked:**
- Consistent with the Fluent Design system already used in the project
- Numbers are the focus (displayed large with display font)
- `+1` badge communicates the action without needing an icon
- Professional appearance suitable for business context

**Lesson:** Emojis add noise in corporate dashboards. Use color, typography, and spacing instead.
- Lower risk of merge conflicts
- Team can see progress in real-time

**Lesson:** Frequent small commits > rare large commits.

---

### ❌ What Failed (and How We Fixed It)

#### 1. **Putting Project in OneDrive Path**
**What:** Started with project in `C:\Users\User\OneDrive - Grupo Marista\...`

**What happened:**
- Turbopack crashed on startup (permission denied)
- Build system couldn't create `.next` folder
- Dev server unusable for 30 minutes

**Root cause:** OneDrive syncing interferes with build tools creating temp files.

**Fix:** Moved to local path `C:\Projetos\Gestao_Leads`

**Lesson:** 🚫 NEVER use cloud-synced folders for development. Use local disk only.

---

#### 2. **Nested Project Structure in Repository**
**What:** Initial push put all code in `prospectview/` subfolder instead of root.

**What happened:**
- GitHub showed repo as empty (size: 0 bytes)
- Users saw no files despite successful push
- Looked like push failed, was confusing

**Root cause:** Created `prospectview/` folder, then made it a git submodule by accident.

**Fix:** Refactored to move all files from `prospectview/*` to repository root.

**Lesson:** 🚫 NEVER nest main project files in subfolders. Put them at repository root for maximum clarity.

---

#### 3. **Git Branch Mismatch (main vs master)**
**What:** Pushed to `main` branch locally, but GitHub repo defaulted to `master`.

**What happened:**
- Commits went to `main` branch
- GitHub was showing `master` branch (empty)
- Looks like push failed or repo is empty

**Root cause:** Didn't verify default branch in GitHub settings before pushing.

**Fix:** Created new repo, verified branch settings before push.

**Lesson:** 🚫 ALWAYS verify remote branch configuration BEFORE first push. Use `git branch -a` to check.

---

#### 4. **Trying to Delete GitHub Repo from CLI**
**What:** Attempted `gh repo delete` without proper permissions.

**What happened:**
- Command failed with "Must have admin rights"
- GitHub CLI required `delete_repo` scope
- Added unnecessary complexity when just needed new repo

**Root cause:** Assumed delete would work, didn't read error properly.

**Fix:** Created new repo instead of fighting permissions.

**Lesson:** 🚫 DON'T try to force delete GitHub repos from CLI. Create new repo if structure is wrong. Simpler and safer.

---

#### 5. **Assuming First Push Would Be Visible Immediately**
**What:** Pushed code and expected to see it on GitHub.com right away.

**What happened:**
- GitHub API showed size: 0
- Took several minutes to show files
- Seemed like push failed

**Root cause:** GitHub caches repo size and file listings; not instant.

**Fix:** Waited 2-3 minutes and refreshed, files appeared.

**Lesson:** 🚫 DON'T panic if GitHub doesn't show files immediately after push. It has caching. Wait 1-2 minutes and refresh.

---

#### 6. **Vercel Ghost Project via `--name` Flag (SOLVED ✅)**

**What:** Used `vercel --prod --name prospectview-app` when a previous deploy failed due to invalid project name.

**What happened:**
- Created a second Vercel project (`prospectview-app`) alongside the correct one (`prospectview`)
- Both projects were connected to the same GitHub repo
- Every `git push` triggered builds on BOTH — the ghost project failed every time
- User received error emails from Vercel on every single push

**Root cause:** `--name` flag silently creates a new project without asking. We didn't check existing projects first.

**Fix:** Ran `vercel project ls` to discover the ghost, then `vercel project rm prospectview-app`.

**Lesson:** 🚫 ALWAYS run `vercel project ls` before any deploy. Never use `--name` without checking existing projects first.

---

#### 7. **useEffect Stale Closure in Manual Mode (SOLVED ✅)**

**What:** `ModoManual` component used `useEffect(() => { carregarExistente() }, [data, usuario])` without cleanup.

**What happened:**
- When user quickly changed date or switched users, multiple async queries ran simultaneously
- Earlier query resolved after later one, overwriting correct state with stale data
- Form submitted stale/incorrect values → Supabase error

**Root cause:** No `cancelled` flag to abort in-flight requests when effect re-runs.

**Fix:**
```typescript
useEffect(() => {
  let cancelled = false
  async function carregar() {
    const { data: row } = await supabase...
    if (cancelled) return  // ← guard
    setValores(...)
  }
  carregar()
  return () => { cancelled = true }  // ← cleanup
}, [data, usuario])
```

**Lesson:** 🚫 ALWAYS add `cancelled` cleanup to async `useEffect` calls. Without it, race conditions are guaranteed on fast user interaction.

---

#### 8. **Generic Error Messages Hide Real Problems**

**What:** Error handler showed "Erro ao salvar. Verifique o console." instead of the actual error.

**What happened:**
- User tested, got generic message, couldn't self-diagnose
- Required a full debug cycle: user reports → Claude investigates → fix → redeploy

**Root cause:** `setStatus('erro')` without capturing `error.message`.

**Fix:**
```typescript
if (error) {
  setErroMsg(error.message)  // ← show real message
  setStatus('erro')
}
// In JSX:
{status === 'erro' && <p>{erroMsg || 'Erro desconhecido'}</p>}
```

**Lesson:** 🚫 NEVER show generic error messages. Always surface the real error (Supabase, API, network) directly in the UI.

---

### 🚫 Anti-Patterns to Avoid

#### 1. **❌ DO NOT Commit Sensitive Files**
**Wrong:**
```bash
git add .
git commit -m "Add env setup"
git push  # This includes .env.local with credentials!
```

**Right:**
```bash
# Add to .gitignore FIRST
echo ".env.local" >> .gitignore

# Then commit only .env.local.example
git add .gitignore .env.local.example
git commit -m "Add environment template"
```

**Why:** Credentials in git history are permanent. Even if you delete the file later, history is there.

---

#### 2. **❌ DO NOT Work in Cloud-Synced Directories**
**Wrong:**
```
C:\Users\User\OneDrive - Google Workspace\Projects\ProspectView
C:\Users\User\Dropbox\Development\ProspectView
C:\Users\User\iCloud\code\ProspectView
```

**Right:**
```
C:\Projetos\ProspectView           (local disk)
~/dev/prospect-view                (local disk)
/Users/user/Projects/ProspectView  (local disk)
```

**Why:** Cloud sync + build tools = permission conflicts. Always fails mysteriously.

---

#### 3. **❌ DO NOT Accumulate Large Changesets Before Committing**
**Wrong:**
```bash
# Make 10 changes across 5 files over 3 days
# Then commit everything at once
git add .
git commit -m "Update stuff"  # Vague, hard to understand
```

**Right:**
```bash
# Commit after each logical feature
git commit -m "Feat: Add metric-card animation"
# Later...
git commit -m "Fix: Correct funnel conversion rates"
# Later...
git commit -m "Docs: Update CLAUDE.md with new features"
```

**Why:** Small commits are easier to review, understand, and revert if needed.

---

#### 4. **❌ DO NOT Skip npm run build Before Committing**
**Wrong:**
```bash
# Made changes, looks good in dev server
git add .
git commit -m "Add new page"
git push
# Later: CI fails because TypeScript errors
```

**Right:**
```bash
# Before any commit:
npm run lint    # Check code quality
npm run build   # Type check + optimize
# If both pass, then commit
git add .
git commit -m "Add new page"
```

**Why:** Type errors slip through in dev mode. `npm run build` catches them.

---

#### 5. **❌ DO NOT Assume .env.local Is Properly Ignored**
**Wrong:**
```bash
# Forgot to check .gitignore
git add .
git commit -m "Setup"
# Later discover .env.local was committed with credentials
```

**Right:**
```bash
# First, verify .gitignore has the entry
cat .gitignore | grep env.local

# Second, verify git isn't tracking it
git status | grep env.local
# Should show nothing

# Then add and commit
git add .
```

**Why:** Easy to make mistake. Credentials in public repos = security breach.

---

#### 6. **❌ DO NOT Modify .gitignore After Files Are Committed**
**Wrong:**
```bash
# Accidentally committed .env.local earlier
# Later added to .gitignore
echo ".env.local" >> .gitignore

# File still in git history!
```

**Right:**
```bash
# Remove from git tracking
git rm --cached .env.local

# Add to .gitignore
echo ".env.local" >> .gitignore

# Commit the removal
git commit -m "Remove .env.local from tracking"
```

**Why:** Just adding to .gitignore doesn't remove from history. Must explicitly remove.

---

#### 7. **❌ DO NOT Trust Automatic File Watchers for Deployment**
**Wrong:**
```bash
# Started dev server, left it running
# Assumed changes auto-deploy to production
npm run dev
```

**Right:**
```bash
# For production, always explicitly deploy
npm run build
vercel deploy  # or your deployment platform
```

**Why:** Dev server is for local development only. Production needs explicit deployment.

---

#### 8. **❌ DO NOT Skip Verifying Remote Configuration**
**Wrong:**
```bash
git push  # Assume it goes to right place
# Later: changes on wrong branch or wrong repo
```

**Right:**
```bash
git remote -v              # Verify remote URL
git branch -a              # Verify local + remote branches
git push origin main       # Explicit: repo (origin), branch (main)
```

**Why:** Explicit is better than implicit. Know exactly where your code goes.

---

### 📝 Lessons from This Project

#### Overall Learnings

1. **Start with clean repository structure**
   - Root level for main files
   - Verify branch settings before first push
   - Check git remotes explicitly

2. **Environment matters more than you think**
   - OneDrive/cloud sync = blocker for dev
   - Local filesystem is essential
   - Permission issues are hard to debug

3. **Small commits save time**
   - Easier to understand changes
   - Easier to test each feature
   - Easier to revert if needed

4. **Type safety is worth the effort**
   - TypeScript caught ~15+ bugs
   - Saved debugging time
   - Made refactoring safe

5. **Invest in reusable components early**
   - metric-card saves 30% code duplication
   - filtro-periodo used in 6 pages
   - Design tokens ensure consistency

---

### Future Mistakes to Avoid

Based on what we've learned, here's what to watch out for:

- [ ] 🚫 Never develop in cloud-synced folders (learned the hard way)
- [ ] 🚫 Never assume git push went to right place (verify with git remote -v)
- [ ] 🚫 Never commit .env.local (add to .gitignore FIRST)
- [ ] 🚫 Never accumulate big changesets (commit frequently)
- [ ] 🚫 Never skip npm run build before committing (catches TypeScript errors)
- [ ] 🚫 Never nest main project files in subfolders (put at root)
- [ ] 🚫 Never trust file watchers for production (explicit deploy steps)
- [ ] 🚫 Never modify .gitignore after committing sensitive files (remove from history)
- [ ] 🚫 Never use `--name` in `vercel --prod` without running `vercel project ls` first (creates ghost projects that spam error emails on every push)
- [ ] 🚫 Never show generic "verifique o console" — always surface the real Supabase/API error message in the UI
- [ ] 🚫 Never use `useEffect` with external state without `cancelled` cleanup flag (stale closure causes race conditions on fast user interaction)
- [ ] 🚫 Never implement + deploy before confirming ALL details with user (visual, fields, error behavior) — avoids multiple fix cycles
- [ ] 🚫 Never implement features without confirmar se elas já estão no ar no Vercel — sempre rodar `vercel --prod` após cada push se o deploy automático não estiver configurado
- [ ] 🚫 Never implement UX improvements sem primeiro mostrar um screenshot ao usuário para validar a direção — evita retrabalho de design
- [ ] 🚫 Never leave Supabase queries sem cache em projetos com múltiplas páginas — implementar `lib/queryCache.ts` desde o início
- [ ] 🚫 Never assume que git push vai disparar Vercel automaticamente — verificar se o projeto usa integração GitHub ou CLI; se CLI, deploy manual é necessário

---

## Sessão de Melhorias — Abril 2026

### O que foi implementado nesta sessão

#### Performance

**1. Cache de queries Supabase (`lib/queryCache.ts`)**
- Cada página fazia 2 queries independentes ao Supabase a cada navegação
- Criado módulo de cache com sessionStorage e TTL de 5 minutos
- `fetchRegistros(inicio, fim, usuario?)` — retorna do cache se disponível
- `invalidateRegistrosCache()` — chamado após salvar dados novos
- Resultado: Dashboard → Captação → Contato = 0 queries adicionais (cache hit)

**2. Prefetch ao hover na navbar**
- `prefetchPage(href)` disparado no `onMouseEnter` de cada link
- Quando o usuário passa o mouse, as queries da próxima página já começam
- O clique humano leva ~150ms — tempo suficiente para a query chegar antes da página montar

**3. Warmup automático no startup**
- `CacheWarmer` component invisível no layout dispara `warmupCache()` com 300ms de delay
- Busca em background os dados 30d de todos os usuários assim que o app abre
- Cache aquecido antes do primeiro clique

**Impacto real:**
| Navegação | Antes | Depois |
|-----------|-------|--------|
| Dashboard → Captação | ~1s | instantâneo |
| Captação → Contato | ~1s | instantâneo |
| Qualquer página (hover prefetch) | ~1s | instantâneo |

---

#### UX — Clareza sem ruído

**Problema:** Usuário demorou para entender como usar o site.

**Princípio adotado:** Ajuda contextual, não descritiva. Só aparece quando faz sentido, invisível para quem já sabe.

**Implementações:**

1. **Empty state no Dashboard**
   - Aparece APENAS quando não há dados no período
   - Botão `+ Registrar agora` leva direto para `/registrar`
   - Usuários ativos nunca veem isso

2. **Tooltips nas métricas** (`components/metric-card.tsx`)
   - Prop `tooltip?` opcional em MetricCard
   - Ícone `?` minúsculo ao lado do label
   - Descrição aparece apenas no hover (CSS puro)
   - Experientes ignoram; novatos descobrem

3. **Label de usuário no Registrar**
   - Modo Manual mostra `■ JOÃO PEDRO — CAPTAÇÃO` em azul
   - Troca para Atanael → `■ ATANAEL — CONTATO COMERCIAL` em verde
   - Deixa claro quem está preenchendo sem instrução permanente

4. **Tooltips nos links da navbar**
   - `nav-tip-wrap` + `nav-tip-box` com CSS hover
   - Ex: hover em "Captação" → *"Métricas de prospecção — João Pedro"*
   - Mesma mecânica dos metric cards

5. **Funil com descrições por etapa**
   - Cada uma das 8 etapas tem uma linha explicando o que representa
   - Ex: *"Empresas identificadas por João Pedro como potenciais clientes"*
   - Sempre visível mas pequena; não polui quem já conhece

6. **Guia de primeira visita** (`components/first-visit-guide.tsx`)
   - Card no Dashboard que aparece APENAS na primeira visita (localStorage flag)
   - Explica o fluxo em 3 passos: Registrar → Acompanhar → Analisar
   - Botão `×` descarta para sempre

---

### O que Claude poderia ter feito melhor (auto-análise)

#### 1. Diagnosticar antes de implementar
**O que aconteceu:** Implementei cache de queries sem primeiro medir o tempo real das queries. Assumi que eram lentas com base na reclamação do usuário.

**O que deveria ter feito:** Antes de qualquer implementação de performance, adicionar `console.time()` ou usar o DevTools Network para medir latência real. Pode ser que o problema fosse outro (bundle size, render blocking, cold start do Vercel) e a solução mais eficaz seria diferente.

**Lição:** Meça antes de otimizar. Dados reais > suposições.

---

#### 2. Verificar deploy antes de mostrar resultado
**O que aconteceu:** Implementei UX improvements e mostrei ao usuário. Ele depois reclamou que "não estava no servidor online". Precisei fazer um deploy manual extra.

**O que deveria ter feito:** Após cada `git push`, verificar imediatamente com `vercel ls` se o deploy foi disparado. Se não, fazer `vercel --prod` na hora. Nunca deixar o usuário descobrir que o servidor está desatualizado.

**Lição:** Depois de todo push → verificar Vercel. Não assumir que integração GitHub está ativa.

---

#### 3. Agrupar UX improvements em menos sessões
**O que aconteceu:** Implementei UX em duas rodadas separadas:
- Rodada 1: empty state + tooltips métricas + label registrar
- Rodada 2: guia first-visit + tooltips navbar + funil explicado

**O que deveria ter feito:** Na primeira vez que o usuário deu o feedback de "difícil de entender", propor o plano completo das 6 melhorias de uma vez e implementar tudo em um único bloco. Economizaria 1 ciclo de conversa + 1 deploy.

**Lição:** Quando o usuário dá feedback de UX, pensar em todas as superfícies afetadas de uma vez antes de começar a implementar.

---

#### 4. Confirmar direção visual antes de codar
**O que aconteceu:** Em sessões anteriores, implementei UI sem mostrar prévia ao usuário, gerando retrabalho.

**O que deveria ter feito:** Descrever textualmente a solução proposta ("vou adicionar um card azul no topo que..."), esperar aprovação do usuário, depois implementar. Evita refações de design.

**Lição:** Para mudanças visuais, confirmar a direção primeiro. Para bugs/lógica, pode implementar direto.

---

#### 5. Reutilizar padrão de tooltip existente
**O que aconteceu:** Implementei tooltips nas métricas (CSS + `?` icon) e depois, em outra sessão, implementei tooltips na navbar com a mesma mecânica mas código duplicado.

**O que deveria ter feito:** Na primeira vez que criei tooltips, extrair um componente `<Tooltip>` reutilizável. Na segunda vez, apenas importar o componente.

**Lição:** Quando implementar um padrão pela segunda vez, é sinal de que deveria ser um componente.

---

### How to Use This Section

**When something fails:**
1. Document what happened
2. Explain root cause
3. Show how it was fixed
4. Extract the lesson

**When something works well:**
1. Document what was done
2. Explain why it works
3. Show the benefit
4. Make it repeatable

**This becomes the project's institutional memory.** New developers can learn from past mistakes without repeating them.

---

### Development Automation

**Browser Launch on Dev Server Start:**

When you request:
- "Run the dev server"
- "Start the application"
- "Open the app"
- "View the application"

Claude automatically:
1. Starts `npm run dev`
2. Waits for server to be ready
3. **Opens Chrome** to `http://localhost:3000`
4. No manual link copying needed

This streamlines the development workflow — get the app running and visible in one request.

---

## Sessão de Reestruturação — Abril 2026 (wizard Contato, remoção Funil, Histórico)

### O que foi implementado

- **Wizard de registro** (`/contato`): fluxo guiado em 4 etapas para Atanael registrar atividades na tabela `atividades` (nova). Ordem: Tier → Tipo → Tentativa → Status.
- **Dashboard simplificado**: gráfico empilhado por `tipo_atividade` com filtros 7d/30d/90d e exportação Excel.
- **Remoção do Funil**: página removida da navbar, redireciona para `/`.
- **Histórico simplificado**: substituído tabela densa por lista com chips de métricas.
- **Registrar → Atanael**: quick-log substituído por card de redirecionamento para `/contato`.
- **Navbar pill corrigida**: ref movido de `HTMLDivElement` para `HTMLAnchorElement`.

---

### 🔬 Reflexão técnica — O que foi ineficiente

#### 1. 🚫 Tabela SQL implementada DEPOIS do código que a usa

**O que aconteceu:** O wizard do Contato foi codificado, commitado e deployado antes de o usuário criar a tabela `atividades` no Supabase. Resultado: o usuário bateu no erro "Could not find the table 'public.atividades'" em produção, foram necessárias 3 mensagens de vai-e-vem até a tabela ser criada.

**Custo real:** ~2 deploys desnecessários + múltiplas mensagens + frustração do usuário.

**Regra futura:** 🚫 NUNCA implementar código que depende de uma tabela nova sem antes confirmar que ela existe. O fluxo correto é:
1. Mostrar o SQL ao usuário
2. Aguardar confirmação "pronto" (ou executar via CLI se tiver acesso)
3. Só então escrever e deployar o código

---

#### 2. 🚫 Ordem dos steps implementada errada sem validar com o usuário

**O que aconteceu:** Implementei o wizard com a ordem `status → tentativa`. O usuário pediu para inverter para `tentativa → status` após o deploy já estar no ar. Foram necessários um novo ciclo de código + build + commit + deploy para corrigir.

**Custo real:** 1 ciclo completo de implementação desperdiçado.

**Regra futura:** 🚫 Para fluxos com múltiplas etapas sequenciais (wizards, formulários multi-step), sempre descrever a ordem proposta em texto antes de codar — "Vou implementar: Tier → Tipo → Status → Tentativa. Confirma?" — e só implementar após aprovação explícita.

---

#### 3. 🚫 TypeScript dead branch não detectado antes do build

**O que aconteceu:** `escolherTipo` tinha `else if (t === 'cold_call')` após uma condição que já cobria `cold_call`. O TypeScript detectou o erro em tempo de build, mas o código foi escrito com a lógica errada desde o início.

**Custo real:** 1 build quebrado + correção reativa.

**Regra futura:** Antes de submeter qualquer função com ramificação condicional baseada em union types, traçar mentalmente cada branch e verificar se há overlaps ou dead code.

---

#### 4. 🚫 Múltiplos deploys para mudanças relacionadas

**O que aconteceu:** Foram feitos 3 deploys separados para mudanças que eram parte da mesma entrega funcional (dashboard + funil + navbar num commit; wizard reordenado + histórico num segundo; histórico simplificado num terceiro).

**Custo real:** Tempo de build × 3 no Vercel, mais mensagens de confirmação intermediárias.

**Regra futura:** Quando o usuário descreve um conjunto de mudanças relacionadas ("1. página Contato 2. Dashboard 3. remover Funil"), implementar tudo no mesmo ciclo de código → build → commit → deploy, salvo se houver bloqueio externo (ex: SQL pendente).

---

#### 5. ✅ O que funcionou bem

- **`IF NOT EXISTS`** em todo o SQL: zero risco de quebrar ao reexecutar.
- **Remoção do Funil via `redirect()`**: solução limpa, sem apagar código — rotas antigas continuam funcionando.
- **`refreshKey`** no histórico do Contato: padrão simples e eficaz para forçar reload após salvar sem WebSocket.
- **Chips de métricas** no Histórico: decisão de design acertada — reduz cognitive load sem perder informação essencial.
- **Ref em `HTMLAnchorElement`** para pill da navbar: fix correto, sem gambiarra.

---

### Lições acionáveis para próximas sessões

| # | Situação | Ação correta |
|---|----------|-------------|
| 1 | Nova tabela necessária | SQL primeiro, código depois — aguardar "pronto" |
| 2 | Fluxo multi-step | Descrever ordem em texto, aguardar aprovação |
| 3 | Union type com branches | Traçar cada caso antes de escrever |
| 4 | Conjunto de mudanças relacionadas | Um único ciclo build → deploy |
| 5 | Usuário reclama de página complexa | Perguntar "quais colunas/campos são essenciais?" antes de redesenhar |
