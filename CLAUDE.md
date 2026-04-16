# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**IMPORTANT: Automatic commits are triggered when:**
- ✅ A feature is completed and working
- ✅ You write "checkpoint" in a message
- ✅ You explicitly request it
- ✅ After significant code changes (components, pages, logic)

**AUTOMATIC WORKFLOW TRIGGERED:**
1. `git add .` — Stage all changes (respecting .gitignore)
2. Create commit with descriptive message summarizing changes
3. `git push origin main` — Push to GitHub immediately

This ensures the remote repository stays in sync with local work and maintains a clean commit history.

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
