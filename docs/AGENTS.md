# Repository Guidelines

## Project Structure & Module Organization
This landing runs on Next.js 16 (App Router). Page sections, client hooks, and orchestrators live in `app/` (`page.tsx` hosts the entire experience), reusable UI stays in `components/`, and shared logic belongs to `lib/`. Global tokens and Tailwind layers reside in `app/globals.css`, while `styles/` is reserved for legacy utilities. Static assets and the Python dossier generator (`public/assets/dossier/personalizar_dossier.py`) ship from `public/`; the generated files remain ignored under `public/assets/dossier/dossiers_generados/`. Long-form briefs, Lighthouse captures, and internal docs belong in `docs/`.

## Build, Test, and Development Commands
- `npm run dev` – hot reload server at `http://localhost:3000`.
- `npm run build` – production build; surfaces type/route blockers before deploying.
- `npm run start` – serves the compiled output for smoke tests.
- `npm run lint` – runs `node ./node_modules/eslint/bin/eslint.js .`, ensuring Windows users do not need a global `eslint`.
Run `npm install` before hacking so the Tailwind canary and Radix dependencies are in place; the `postinstall` script keeps `tsconfig.json` aligned with tooling expectations.

## Coding Style & Naming Conventions
Author everything in TypeScript, defaulting to server components unless the section needs hooks, listeners, or animations (`"use client"`). Use `PascalCase` for components, `camelCase` for utilities/hooks, and `kebab-case` for directories. Tailwind utilities follow the repo ordering: layout → spacing → color → effects. Colocate copy inside the `content` object in `app/page.tsx` so Spanish/English strings stay synchronized. Premium flourishes (hero badge, dossier card) should share helper components rather than duplicating markup.

## Testing Guidelines
There is no automated suite yet, so linting plus manual QA is mandatory. After each change, run `npm run lint`, then review the landing at 1440 px desktop and 390 px mobile widths, toggling both languages. Re-run Lighthouse (reports live in `docs/`) whenever you touch hero media, dossier CTA logic, or scripts inside `public/assets/dossier`. If you introduce Jest/Playwright later, colocate specs with the component (`components/Hero/Hero.spec.tsx`) and keep test names narrative (`rendersWynnStatsTimeline`).

## Commit & Pull Request Guidelines
Commits should be short, scoped, and imperative (e.g., `sincroniza badge del efecto wynn`). Reference tickets or Vercel deploy IDs when possible. Every PR must outline scope, list the commands executed (`npm run lint`, `npm run build`, Lighthouse), and attach before/after captures for visual shifts. Avoid mixing marketing copy with structural refactors; reviewers prefer one storyline per PR.

## Security & Operations Notes
Never commit credentials. Store secrets in `.env.local` and mirror them in Vercel. The dossier generator installs `requests`/`pypdf` on demand; document any extra Python dependency in `public/assets/dossier/requirements.txt`. When editing service workers or manifests in `public/`, verify cached asset paths (e.g., `/logo-playa-viva.png`) still exist to keep offline mode healthy.
