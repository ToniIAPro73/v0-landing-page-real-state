# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Playa Viva Landing Page** - A real estate investment landing page for luxury beachfront properties in Al Marjan Island, Ras Al Khaimah. Built with Next.js 16 and deployed via Vercel, this project was initially generated using v0.app and is synchronized with v0 deployments.

The landing page features bilingual content (Spanish/English), animated hero sections, apartment galleries, investment information, and lead capture with automated workflows.

## Development Commands

```powershell
# Install dependencies (run after each pull)
npm install

# Start development server at http://localhost:3000 with hot reload
npm run dev

# Run linting (ESLint + TypeScript checks)
npm run lint

# Production build and start (identical to Vercel deployment)
npm run build
npm run start
```

## Git Workflow

**IMPORTANT**: Claude Code works ONLY on the `development` branch. Never work on `preview` or `production` branches.

```
development → preview → production
     ↑
  (Claude works here)
```

- **development**: Active development branch (Claude Code commits here)
- **preview**: Testing/QA environment (user promotes from development)
- **production**: Live public deployment (user promotes from preview)

**Promotion process**: User is responsible for promoting changes from `development` → `preview` → `production` using Vercel or custom scripts.

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
  - `dossier-storage.ts` - Storage configuration for personalized PDFs (auto-detects environment)
  - `altcha.ts` - ALTCHA challenge creation and verification (CAPTCHA alternative)

- **`app/api/`** - API Routes
  - `submit-lead/route.ts` - Lead submission endpoint with HubSpot integration, PDF personalization, SMTP email delivery, and S3 storage
  - `local-dossiers/[file]/route.ts` - Secure endpoint to serve locally stored personalized PDFs (fallback when S3 fails)
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
- Floating navigation buttons (scroll to top/bottom) with smart position detection
- Simple language toggle (ES | EN) with opacity changes

**Analytics**: Vercel Analytics integrated via `@vercel/analytics/next`

**Security & Bot Protection**:
- ALTCHA integration for form verification (privacy-preserving proof-of-work)
- Custom translations for ES/EN verification messages
- Server-side payload verification with configurable TTL

**PDF Personalization System** (`app/api/submit-lead/route.ts`):
- Dynamic PDF generation using pdf-lib with custom fonts (Allura-Regular.ttf)
- Multi-language support: generates personalized dossiers in Spanish or English based on form language
- Custom text styling: Gold-bronze gradient (#8B7355) with shadow for premium look
- Automatic line splitting for long names
- Dual storage strategy:
  - **S3 storage (primary)**: AWS S3-compatible services with presigned URLs (24-hour expiry)
  - **Local storage (fallback)**: Automatic fallback when S3 fails or is disabled
  - Environment detection: Vercel/Production → S3, Local Dev → filesystem
- Secure file serving via `/api/local-dossiers/[file]/route.ts` endpoint

**Email System** (`app/api/submit-lead/route.ts`):
- **SMTP delivery** via nodemailer (uniestate.co.uk mail server)
- Language-based sender routing:
  - Spanish: tony@uniestate.co.uk (Tony - Uniestate Playa Viva)
  - English: michael@uniestate.co.uk (Michael - Uniestate Playa Viva)
- Rich HTML emails with:
  - Two premium gold gradient buttons (Download Dossier + Schedule Meeting)
  - HubSpot Meetings integration for booking
  - Three footer images (Complex, Logo, Casino) with exact dimensions
  - Backup links in P.D. sections
- Complete email delivery logging for debugging

**Storage Infrastructure** (`lib/dossier-storage.ts`):
- **Automatic environment detection** (no manual configuration needed):
  - Vercel/Production: Uses `/tmp/dossiers` (Linux temporary directory)
  - Local Development: Uses `Documents/Dossiers_Personalizados_PlayaViva` (Windows)
- S3 configuration with automatic endpoint normalization (adds `https://` if missing)
- Storage decision logic based on environment variables and platform detection

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
- Scroll position for floating navigation buttons

### Testing
- No automated test suite currently
- Manual validation required: iPhone 12 Pro (portrait/landscape), iPad, desktop 1440px
- Run `npm run lint` before commits
- Test both languages (ES/EN) for all interactive features
- Verify email delivery and PDF generation in both languages

## Current Context (January 2025)

**Active Work**: Full PDF personalization system with S3 storage, SMTP email delivery, and automated environment detection.

**Recent Changes** (Last session):

1. **S3 Storage Integration**:
   - Fixed endpoint URL issue (added automatic `https://` prefix)
   - S3 now working correctly in Vercel deployments
   - PDFs stored in `dossier-playa-viva` bucket with presigned URLs
   - Automatic fallback to local storage if S3 fails

2. **Environment Detection** (`lib/dossier-storage.ts`):
   - Removed `DOSSIER_LOCAL_DIR` environment variable (no longer needed)
   - Automatic path detection based on environment:
     - Vercel/Production: `/tmp/dossiers`
     - Local/Development: `C:\Users\Usuario\Documents\Dossiers_Personalizados_PlayaViva`
   - Simplified deployment (no manual path configuration needed)

3. **Email System Improvements**:
   - Complete migration from Resend to SMTP (nodemailer)
   - Language-based sender routing (Tony for ES, Michael for EN)
   - Rich HTML emails with premium styling
   - HubSpot Meetings integration for booking
   - Three footer images with exact dimensions (240x160, 149x64, 240x160)

4. **UI/UX Enhancements**:
   - Simple language toggle (ES | EN) with opacity indicators
   - Floating navigation buttons (up/down) with smart position detection
   - Premium brown-gold gradient styling throughout

5. **Debugging & Logging**:
   - Added comprehensive S3 configuration logging at startup
   - SMTP delivery logging for troubleshooting
   - Environment detection logging

**Current Status**:
- ✅ PDF personalization working (both languages)
- ✅ SMTP email delivery working (both languages)
- ✅ HubSpot integration working
- ✅ ALTCHA verification working
- ✅ S3 storage fixed and working (awaiting final production test)
- ✅ Environment detection automatic (no manual configuration)

**Known Issues**:
- None currently - all major issues resolved

## Deployment

### Vercel URLs

**Production (stable)**: https://landing-page-playa-viva.vercel.app/
- This URL never changes
- User promotes from `preview` → `production` when ready

**Preview (temporary)**: Changes with each deployment
- Example: `https://eslatamlandingpageplayavivauniestate-xxxxx.vercel.app/`
- Used for testing before promoting to production

**Project Dashboard**: https://vercel.com/toniIAPro73s-projects/es_latam_landing_page_playa_viva_uniestate

### Deployment Process

1. Claude Code commits to `development` branch
2. User promotes `development` → `preview` (via Vercel or scripts)
3. User tests in preview environment
4. User promotes `preview` → `production` when satisfied

## Environment Variables

### Required for Production (Vercel)

```bash
# HubSpot
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=147219365
HUBSPOT_FORM_GUID=34afefab-a031-4516-838e-f0edf0b98bc7

# Site URL
NEXT_PUBLIC_SITE_URL=https://landing-page-playa-viva.vercel.app

# SMTP Configuration
SMTP_HOST=mail.uniestate.co.uk
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER_ES=tony@uniestate.co.uk
SMTP_PASS_ES=<password>
SMTP_USER_EN=michael@uniestate.co.uk
SMTP_PASS_EN=<password>

# HubSpot Meetings
HUBSPOT_MEETINGS_URL_ES=https://meetings-eu1.hubspot.com/toni-ballesteros-alonso
HUBSPOT_MEETINGS_URL_EN=https://meetings-eu1.hubspot.com/toni-ballesteros-alonso

# S3 Storage
S3_Endpoint=s3.eu-west-4.idrivee2.com
S3_Region_Code=eu-west-4
S3_Access_Key_ID=<your-key>
S3_Secret_Access_Key=<your-secret>
S3_BUCKET_NAME=dossier-playa-viva

# ALTCHA
ALTCHA_SECRET=<your-secret>
ALTCHA_CHALLENGE_TTL=300
```

### Notes on Environment Variables

- **Storage paths**: NO LONGER NEEDED - automatic detection based on environment
- **S3 Endpoint**: Protocol (`https://`) is added automatically if missing
- **DISABLE_S3_STORAGE**: Optional flag to force local storage (default: false)
- **Email**: SMTP credentials must be configured per language (ES/EN)

## Important Notes

- **Branch Strategy**: Claude Code works ONLY in `development` branch
- **PDF Assets**: Base PDFs must exist in `public/assets/dossier/`:
  - `Dossier-Playa-Viva-ES.pdf`
  - `Dossier-Playa-Viva-EN.pdf`
- **Storage**: Automatic environment detection (no manual configuration)
- **S3**: Endpoint URL is normalized automatically (adds `https://` if missing)
- **Email**: Two separate SMTP accounts for Spanish and English
- **Testing**: Always test in both languages before promoting to production

## Key Dependencies

- **pdf-lib** + **@pdf-lib/fontkit**: PDF manipulation and custom font embedding
- **altcha**: Privacy-preserving proof-of-work CAPTCHA alternative
- **nodemailer**: SMTP email delivery
- **@aws-sdk/client-s3** + **@aws-sdk/s3-request-presigner**: S3-compatible storage with presigned URLs

## PR Requirements

Each PR should include:
- Objective and impacted sections
- Screenshots per breakpoint and language (ES/EN)
- Vercel preview link
- Manual testing checklist (both languages tested)
- References to related issues or Notion tasks
- UX/Content reviewer mentions when needed

## Next Steps

1. **User to promote to production** and test complete workflow:
   - Fill form in both languages
   - Verify email delivery (both Tony and Michael accounts)
   - Confirm PDF downloads from S3
   - Check HubSpot lead creation
   - Verify PDFs are stored in S3 bucket

2. **Monitor S3 storage** in first production uses:
   - Check bucket for uploaded PDFs
   - Verify presigned URLs expire after 24 hours
   - Monitor storage costs

3. **Future enhancements** (if needed):
   - Add automated tests for PDF generation
   - Implement email template versioning
   - Add analytics for dossier downloads
   - Consider CDN for PDF delivery
