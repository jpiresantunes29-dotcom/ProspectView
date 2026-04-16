# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Architecture

**ProspectView** is a private lead-tracking dashboard for two people:
- **João Pedro** — captação (finding/qualifying leads)
- **Atanael** — contato comercial (contacting leads, booking meetings)

All data lives in Supabase. There is no auth — the app is private and accessed directly.

### Data model

Single table: `registros` — one row per (date, user) pair, with numeric fields for each stage of the lead funnel. Upserted on conflict `(data, usuario)`.

Funnel order: empresas encontradas → leads qualificados → enviados ao CRM → leads contatados → respostas → interessados → reuniões marcadas → oportunidades.

Goals (metas) are stored in `localStorage` per browser — they are **not** shared between users/machines.

### Key files

- `lib/supabase.ts` — Supabase client + `Registro` type
- `lib/metrics.ts` — pure functions: `somarRegistros`, `buildFunil`, `pct`, `diasUteis`, `porDia`
- `lib/metas.ts` — localStorage-backed goals: `getMetas`, `saveMetas`, `defaultMetas`
- `components/metric-card.tsx` — main display unit; handles count-up animation, delta vs previous period, and meta progress bar
- `components/filtro-periodo.tsx` — shared period selector (`7d`, `30d`, `90d`, `mes`); exports `periodoParaDatas` and `periodoAnteriorDatas`

### Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard overview — metrics for both users + weekly bar chart |
| `/captacao` | João Pedro's detail page — 3 metric cards + weekly/daily charts |
| `/contato` | Atanael's detail page — 4 metric cards + weekly chart |
| `/funil` | Full funnel view with conversion rates between steps |
| `/historico` | All-records table |
| `/metas` | Edit daily goals per person |
| `/registrar` | Daily data entry form (upserts by date + user) |

### Styling

- **Tailwind v4** — configured via `@import "tailwindcss"` in `globals.css`, not `tailwind.config.js`
- **shadcn/ui** components in `components/ui/` (Button, Card, Select, Input, Label, Tabs)
- Most page layout uses inline styles; design tokens are CSS variables defined in `:root` in `globals.css` (e.g. `--color-captacao: #60A5FA`)
- Two fonts: `Geist` (body, `--font-geist`) and `Cormorant Garamond` (display/numbers, `--font-display`)
- Color coding by role: captação = blue `#60A5FA`, contato = green `#34D399`, taxa = amber `#FBBF24`, resultado = pink `#F472B6`

### Navbar

The navbar fetches from Supabase on every route change to show green/gray dots indicating whether each user has registered data today. The animated pill indicator uses `offsetLeft` from element refs — it runs in `useLayoutEffect`.

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
