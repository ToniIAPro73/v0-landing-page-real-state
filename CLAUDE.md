# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Playa Viva Landing Page** - A real estate investment landing page for luxury beachfront properties in Al Marjan Island, Ras Al Khaimah. Built with Next.js 16 and deployed via Vercel, this project was initially generated using v0.app and is synchronized with v0 deployments.

The landing page features bilingual content (Spanish/English), animated hero sections, apartment galleries, investment information, and lead capture with automated workflows.

## Development Commands

\`\`\`powershell

\# Install dependencies (run after each pull)

npm install

\# Start development server at <http://localhost:3000> with hot reload

npm run dev

\# Run linting (ESLint + TypeScript checks)

npm run lint

\# Production build and start (identical to Vercel deployment)

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
  - `dossier-storage.ts` - Storage configuration for personalized PDFs (local/S3 with path normalization)
  - `altcha.ts` - ALTCHA challenge creation and verification (CAPTCHA alternative)

- **`app/api/`** - API Routes

  - `submit-lead/route.ts` - Lead submission endpoint with HubSpot integration, PDF personalization, and multi-storage support
  - `local-dossiers/[file]/route.ts` - Secure endpoint to serve locally stored personalized PDFs
  - `altcha/challenge/route.ts` - ALTCHA challenge generation endpoint

- **`public/`** - Static assets served directly
  - `assets/imagenes/` - Image galleries (compressed to <300 KB)
  - `assets/dossier/` - Investment PDF documents (ES/EN versions)
  - `assets/planos/` - Floor plan images
  - `assets/Videos/` - Video content
  - `hero-background.png`, `logo-playa-viva.png`, `favicon_playa_viva.png`
- **`public/fonts/`** - Custom fonts for PDF personalization
  - `Allura-Regular.ttf` - Script font for personalized lead names in dossiers

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
- Lead form with ALTCHA verification (privacy-focused CAPTCHA alternative)
- Lead submission with automation payload for HubSpot integration
- Viewport-responsive hero scaling for mobile landscape

**Analytics**: Vercel Analytics integrated via `@vercel/analytics/next`

**Security & Bot Protection**:

- ALTCHA integration for form verification (privacy-preserving proof-of-work)
- Custom translations for ES/EN verification messages
- Server-side payload verification with configurable TTL

**PDF Personalization System** (`app/api/submit-lead/route.ts`):

- Dynamic PDF generation using pdf-lib with custom fonts (Allura-Regular.ttf)
- Multi-language support: generates personalized dossiers in Spanish or English based on form language
- Dual storage strategy:
  - **Local storage**: Normalized path handling for Windows environments (supports `DOSSIER_LOCAL_DIR` env var)
  - **S3 storage**: AWS S3/compatible services with presigned URLs (configurable with `S3_*` env vars)
  - Automatic fallback system when base PDFs are missing
- Email notifications via Resend when PDF generation fails (language-aware recipients)
- Secure file serving via `/api/local-dossiers/[file]/route.ts` endpoint

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

## Current Context

**Active Work**: Full PDF personalization system with multi-storage support and ALTCHA security integration.

**Recent Changes** (Last 2 weeks):

- **PDF Personalization**: Complete system for generating personalized dossiers with lead names using pdf-lib
  - Base PDFs available in both languages: `Dossier-Playa-Viva-ES.pdf` and `Dossier-Playa-Viva-EN.pdf`
  - Custom font integration (Allura-Regular.ttf) for elegant name rendering
  - Fallback to `Dossier-Personalizado.pdf` when language-specific PDFs are unavailable
- **Storage Infrastructure** (`lib/dossier-storage.ts`):
  - Local storage with Windows path normalization (fixes backslash/forward-slash issues)
  - S3-compatible storage with automatic endpoint/bucket parsing
  - Environment-based storage selection (Vercel → S3, local dev → filesystem)
- **ALTCHA Integration**: Privacy-preserving bot protection replacing traditional CAPTCHAs
  - Challenge generation endpoint (`/api/altcha/challenge`)
  - Server-side verification with configurable TTL
  - Bilingual widget translations (ES/EN)
- **Lead Submission Flow** (`app/api/submit-lead/route.ts`):
  - HubSpot form submission with UTM tracking
  - PDF personalization with name overlay
  - Multi-storage support (local + S3)
  - Language-aware error notifications via Resend
  - Secure PDF serving via dedicated endpoint
- **Removed Python Script**: PDF generation now handled entirely in TypeScript/Node.js (removed `personalizar_dossier.py`)

**Known Issues & Maintenance Notes**:

- Base PDF files (`Dossier-Playa-Viva-ES.pdf`, `Dossier-Playa-Viva-EN.pdf`) must exist in `public/assets/dossier/`
- When PDFs are missing and Resend is configured, automated alerts are sent:
  - Spanish form submissions → tony@uniestate.co.uk
  - English form submissions → michael@uniestate.co.uk
- Local storage directory must be configured via `DOSSIER_LOCAL_DIR` env var for Windows dev environments

## Deployment

- **Production**: Deployed on Vercel
- **v0.app Integration**: Changes from v0.app are automatically pushed to this repository
- **Vercel URL**: Check README.md for current deployment link

## Important Notes

- **Environment Variables**:
  - Prefix with `NEXT_PUBLIC_` for client-side access
  - Required for production: `RESEND_API_KEY`, `ALTCHA_SECRET`, S3 credentials (`S3_Endpoint`, `S3_Bucket`, `S3_Region_Code`, `S3_Access_Key_ID`, `S3_Secret_Access_Key`)
  - Optional for local dev: `DOSSIER_LOCAL_DIR` (defaults to `~/Documents/Dossiers_Personalizados_PlayaViva`)
  - Storage behavior flags: `DISABLE_S3_STORAGE`, `FORCE_S3_STORAGE`
- **PDF Assets**:
  - Verify `public/assets/dossier/*.pdf` files after marketing updates to avoid broken links
  - Base PDFs required: `Dossier-Playa-Viva-ES.pdf` and `Dossier-Playa-Viva-EN.pdf`
  - Fallback PDF: `Dossier-Personalizado.pdf` (used when language-specific versions are missing)
- **Path Handling**: Use forward slashes in code; `lib/dossier-storage.ts` normalizes paths for Windows compatibility
- **No Turbopack Lock**: Ensure the Client Component compiles without Turbopack locks
- **Commit Style**: Short, imperative, bilingual if affecting copy (e.g., "Refina tabs Apartamentos ES/EN")

## Key Dependencies

- **pdf-lib** + **@pdf-lib/fontkit**: PDF manipulation and custom font embedding
- **altcha**: Privacy-preserving proof-of-work CAPTCHA alternative
- **resend**: Transactional email service for error notifications
- **@aws-sdk/client-s3** + **@aws-sdk/s3-request-presigner**: S3-compatible storage with presigned URLs

## PR Requirements

Each PR should include:

- Objective and impacted sections
- Screenshots per breakpoint and language
- Vercel preview link
- Manual testing checklist
- References to related issues or Notion tasks
- UX/Content reviewer mentions when needed
