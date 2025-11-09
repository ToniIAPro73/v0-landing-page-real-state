# Repository Guidelines

## Project Structure & Module Organization
Playa Viva is a Next.js 16 App Router project. Screens live in `app/` (with `layout.tsx` for shared chrome and `page.tsx` for the home experience), shared UI sits in `components/`, and data/helpers belong to `lib/`. Static assets, SEO files, and downloads live under `public/`, while long-form references and analyses stay in `docs/`. Keep Tailwind tokens in `app/globals.css`, and treat `styles/` as the place for rare global overrides or animations that do not fit utility classes.

## Build, Test, and Development Commands
- `npm run dev`: launches the hot-reload dev server at `http://localhost:3000`.
- `npm run build`: compiles the production bundle and surfaces type/route warnings that Vercel would block on.
- `npm run start`: serves the last build for smoke tests that mimic the hosted environment.
- `npm run lint`: runs ESLint + TypeScript rules configured by Next; fix all warnings before pushing.

## Coding Style & Naming Conventions
Write everything in TypeScript, defaulting to server components unless the feature needs interactivity (`'use client'`). Use 2-space indentation, `PascalCase` for components, `camelCase` for utilities/hooks, and `kebab-case` for directories. Group Tailwind classes by layout → spacing → color → effects to stay consistent with existing sections. Prefer composable Radix primitives, and colocate component-specific helpers next to the component file when possible. Run `npm run lint` before committing; it catches unused imports, `clsx` mistakes, and Tailwind typos.

## Testing Guidelines
No automated suite ships yet, so combine `npm run lint` with manual checks on desktop (1440 px), tablet, and iPhone 12 views. Record Lighthouse scores (HTML reports live in `docs/`) when hero, booking CTA, or animation work changes. If you add Jest or Playwright later, place specs beside the feature (`components/Hero/Hero.spec.tsx`) and follow descriptive test names such as `rendersAmenitiesGrid`.

## Commit & Pull Request Guidelines
History favors short, imperative Spanish messages (e.g., `mejoras organizativas de la documentación`). Keep commits focused on one concern, reference related issues, and include before/after screenshots for UI changes. Pull requests should describe scope, list commands executed (`npm run lint`, `npm run build`, Lighthouse), and attach the latest Vercel preview URL so reviewers can compare deployments.

## Security & Configuration Tips
Never commit secrets—store them in `.env.local` and set matching keys in Vercel. When introducing analytics or embeds, document required environment variables in `docs/config.md`. Review `next.config.mjs` when toggling experimental flags to avoid breaking the automatic sync with v0.app.