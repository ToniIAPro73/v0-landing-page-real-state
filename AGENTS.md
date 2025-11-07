# Repository Guidelines

## Project Structure & Module Organization

This Next.js 16 App Router project keeps route segments, layout logic, and server components under `app/`. Shared UI pieces generated from v0 live in `components/`, while reusable helpers sit in `lib/`. Static marketing copy, CSVs, and downloadable assets go into `public/` for direct serving and `assets/` for raw design exports. Tailwind layers, tokens, and one-off overrides reside in `styles/`. Keep screenshots or large captures out of Git by parking them inside `assets/capturas/` and referencing optimized variants within `public/`.

## Build, Test, and Development Commands

Run `npm install` once per environment. `npm run dev` starts the local Vercel-style dev server on port 3000 with hot reloading. `npm run build` performs the production Next.js build used by Vercel (failures block deploys). `npm run start` serves the output of `next build` for smoke tests. `npm run lint` executes ESLint with the Next.js config and TypeScript checks; treat warnings as blockers before pushing.

## Coding Style & Naming Conventions

Use TypeScript + React Server Components where practical; client components must include "use client". Stick to functional components, hooks, and 2-space indentation. Component files should be PascalCase (e.g., `HeroBanner.tsx`), hooks use `useVerbNoun`, and utility modules are camelCase. Tailwind classes belong in `className` strings; extract shared styles into `styles/*.css` only when utility-first composition becomes noisy. Run `npm run lint` before committing to auto-fix trivial style issues.

## Testing Guidelines

There is no dedicated test runner yet, so combine `npm run lint` with manual responsive checks using Vercel previews. Document new components with quick viewport notes (e.g., "validated at 390px and 1440px") inside the pull request. Add unit tests under `__tests__/` if you introduce logic-heavy helpers in `lib/`; name files `<module>.test.ts`.

## Commit & Pull Request Guidelines

Recent history favors short, imperative Spanish summaries (e.g., `Balance padding iPhone landscape`). Keep commits scoped to a single UI or layout concern and reference the screen width/device touched. Pull requests should include: purpose, affected routes or sections, screenshots for each breakpoint touched, and links to any related Vercel preview or issue. Request a review before merging even for minor styling changes.
