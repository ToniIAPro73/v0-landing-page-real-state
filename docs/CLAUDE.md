# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Playa Viva Landing Page** - A real estate investment landing page for luxury beachfront properties in Al Marjan Island, Ras Al Khaimah. Built with Next.js 16 and deployed via Vercel, this project was initially generated using v0.app and is synchronized with v0 deployments.

The landing page features bilingual content (Spanish/English), animated hero sections, apartment galleries, investment information, and lead capture with automated workflows.

## Development Commands

\`\`\`powershell
# Install dependencies (run after each pull)
npm install

# Start development server at http://localhost:3000 with hot reload
npm run dev

# Run linting (ESLint + TypeScript checks)
npm run lint

# Production build and start (identical to Vercel deployment)
npm run build
npm run start
\`\`\`

## Project Architecture

### Core Structure

- **`app/`** - Next.js App Router (v16)

  - `page.tsx` - Main landing page (Client Component with complex state management)
  - `layout.tsx` - Root layout with metadata, Analytics integration
  - `globals.css` - Tailwind v4 configuration with custom color palette
  - `head.js` - Custom head configuration

- **`components/`** - Reusable UI components

  - `ui/` - shadcn/ui components (Button, etc.)
  - `theme-provider.tsx` - Theme management (next-themes)

- **`lib/`** - Utility functions

  - `utils.ts` - `cn()` helper for merging Tailwind classes (clsx + tailwind-merge)

- **`public/`** - Static assets served directly
  - `assets/imagenes/` - Image galleries (compressed to <300 KB)
  - `assets/dossier/` - Investment PDF documents
  - `assets/planos/` - Floor plan images
  - `assets/Videos/` - Video content
  - `hero-background.png`, `logo-playa-viva.png`, `favicon_playa_viva.png`

### Key Technical Details

**Tailwind CSS v4**: Uses PostCSS plugin (`@tailwindcss/postcss`). Custom color palette defined in `globals.css` using CSS custom properties (oklch color space):

- `--gold-warm: #a29060`
- `--taupe-medium: #817964`
- `--olive-brown: #70623d`

**Next.js Configuration** (`next.config.mjs`):

- TypeScript build errors ignored (`ignoreBuildErrors: true`)
- Images unoptimized (`unoptimized: true`)

**TypeScript Paths**: `@/*` maps to root directory (defined in `tsconfig.json`)

**Client-Side Features** (`app/page.tsx`):

- Bilingual state management (ES/EN)
- Complex animation sequencing for hero section
- Gallery tabs (servicios, interior, sitios, video)
- Apartment showcase tabs (studio, oneBed, twoBed, threeBed)
- FAQ accordion with hover interactions
- Lead form with automation payload structure for HubSpot integration
- Viewport-responsive hero scaling for mobile landscape

**Analytics**: Vercel Analytics integrated via `@vercel/analytics/next`

## Development Guidelines

### Component Patterns

- Use functional TypeScript components
- Mark as `"use client"` only when necessary (state, effects, event handlers)
- Follow PascalCase for components, camelCase for helpers
- Hooks prefixed with `use`

### Styling

- 2-space indentation
- Tailwind classes ordered semantically (layout → color → effects)
- Reuse shadow/elevation effects defined in Tailwind
- Keep new images in `public/assets/imagenes` compressed (<300 KB)

### State Management

The main landing page manages multiple state concerns:

- Language switching (ES/EN)
- Animation sequences with timed transitions
- Section visibility tracking with Intersection Observer pattern
- Form data and submission states
- Active tab states for galleries and apartments

### Testing

- No automated test suite currently
- Manual validation required: iPhone 12 Pro (portrait/landscape), iPad, desktop 1440px
- Run `npm run lint` before commits
- Document tested tabs/sections and language in PRs

## Current Context (from CONTEXTO.md)

**Active Work**: The `app/page.tsx` file maintains its Client Component structure and compiles correctly.

**Recent Changes**:

- Dossier hero section displays premium badge "Dossier de Inversión Exclusivo" with corrected tilde
- FAQ section uses compact panel with hover show/hide
- Dossier form divides fields with different proportions (firstName narrower than lastName)
- Simulated automation for HubSpot + Python script + internal storage

**Pending Tasks**:

1. Re-insert two descriptive paragraphs before highlights in dossier section
2. Adjust CTA card dimensions (~620px width needs height/padding reduction for better proportions)
3. Visual verification at 100% zoom desktop and mobile after changes

## Deployment

- **Production**: Deployed on Vercel
- **v0.app Integration**: Changes from v0.app are automatically pushed to this repository
- **Vercel URL**: Check README.md for current deployment link

## Important Notes

- **Environment Variables**: Prefix with `NEXT_PUBLIC_` for client-side access
- **PDF Assets**: Verify `public/assets/dossier/*.pdf` files after marketing updates to avoid broken links
- **No Turbopack Lock**: Ensure the Client Component compiles without Turbopack locks
- **Commit Style**: Short, imperative, bilingual if affecting copy (e.g., "Refina tabs Apartamentos ES/EN")

## PR Requirements

Each PR should include:

- Objective and impacted sections
- Screenshots per breakpoint and language
- Vercel preview link
- Manual testing checklist
- References to related issues or Notion tasks
- UX/Content reviewer mentions when needed
