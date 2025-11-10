# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Next.js App Router surfaces; `app/page.tsx` drives the landing narrative, `app/api/submit-lead` handles lead capture plus dossier generation, and `app/HubSpotScript.tsx` injects HubSpot tracking.
- `components/` contains UI atoms and compositions (see `components/ui` for shadcn-derived primitives) while `styles/` extends Tailwind tokens; keep new visual variants here instead of inside `app/page.tsx`.
- `lib/` stores shared logic; `lib/dossier-storage.ts` abstracts local vs. S3 dossier writes and should be the only place touching filesystem or env heuristics.
- `public/` keeps static imagery or icons, `docs/` stores marketing briefs and compliance copy, and `scripts/` gathers CTA/legal helpers plus `ensure-node-modules-tsconfig.mjs` (runs postinstall).
- Tests live under `tests/` (for example `tests/dossier-storage.test.ts`) and should mirror the structure of the code they cover.

## Build, Test, and Development Commands
- `npm run dev` launches the Next dev server with hot reload.
- `npm run build` compiles the production bundle; run before opening PRs to catch App Router errors.
- `npm run start` serves the `.next` build locally, matching Vercel.
- `npm run lint` executes `eslint.config.mjs` across the repo; required before merging.
- `npm run test` runs Vitest headlessly; add `-- --watch` for tight feedback loops.
- `pwsh -File scripts/sync_all.ps1` keeps legal and CTA collateral synchronized; only needed when updating assets shared with marketing.

## Coding Style & Naming Conventions
Use TypeScript everywhere. Follow the repo's 2-space indentation and prefer double quotes except where JSX attributes require single quotes to avoid escapes. Components, hooks, and providers use PascalCase; helper functions use camelCase; env constants are SCREAMING_SNAKE_CASE. Favor functional components with explicit prop types, Tailwind utility classes, and `clsx` or `class-variance-authority` for conditional styling. Always run `npm run lint` after editing `app/page.tsx`, where small typos ripple through multiple sections.

## Testing Guidelines
Vitest (`tests/*.test.ts`) is configured for pure logic, so focus on `lib` and API helpers. Follow the naming `feature-name.test.ts` and group assertions with `describe`. When env-sensitive logic is involved, mirror the existing `vi.stubEnv` pattern and reset `vi.unstubAllEnvs()` in `beforeEach`. Pull requests touching lead capture, dossier generation, or S3 switching must include at least one new or updated test.

## Commit & Pull Request Guidelines
Recent history mixes Spanish and English but consistently uses descriptive, sentence-style subjects that cite touched files (for example, `lib/dossier-storage.ts: usa siempre os.homedir() ...`). Continue that pattern: start with the scope (`lib/...`, `app/api/...`), state the action, and explain the why. PRs should include a summary of user-visible changes, screenshots for UI shifts, reproduction steps for API fixes, and links to Vercel previews or related tickets. Always call out updated env keys or scripts so deploys stay synced.

## Security & Configuration Tips
Populate `.env.local` by copying `.env.example` and never commit secrets. Dossier uploads default to `C:\Users\<you>\Documents\Dossiers_Personalizados_PlayaViva`; override via `DOSSIER_LOCAL_DIR` when developing on another OS. Production builds rely on S3 credentials, `RESEND_API_KEY`, and the new `ALTCHA_SECRET` for the CAPTCHA-less protection flow—define all of them locally and in Vercel before triggering a redeploy.
