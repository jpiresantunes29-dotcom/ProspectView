# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version

This project uses **Next.js 16** with **React 19** — versions likely newer than your training data. Read `node_modules/next/dist/docs/` before writing code that relies on routing, rendering, or data-fetching APIs. The App Router is in use. Do not rely on Pages Router patterns or older App Router conventions.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build (also type-checks)
npm run lint     # ESLint
```

No test suite exists. Type safety is the main quality gate — `npm run build` will catch type errors.

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
