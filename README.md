# MakeMyResume

A mobile-first, manual-first resume builder. Users write their own content in structured sections, pick from five genuinely different templates, see a live preview, and export print-quality PDFs. Nothing is generated or rewritten for them.

The product name is configurable via `NEXT_PUBLIC_APP_NAME` (defaults to “MakeMyResume”).

## Features

- **Auth** — email/password (bcrypt), Google OAuth (optional), forgot/reset password, protected routes, onboarding.
- **Dashboard** — search, sort and filter (template, visibility); live thumbnails; completion %; ATS badge; edit, duplicate, rename, download, share, delete (with confirmation).
- **Editor** — personal info (+ optional photo), summary, experience, education, skills, projects, certifications, achievements, languages, volunteering and custom sections. Drag-and-drop **and** keyboard / move up-down reordering for sections and entries; hide sections; undo on delete.
- **Live preview** — updates on every keystroke with page-break guides. Desktop: sections · preview · design. Mobile/tablet: Edit / Preview / Design tabs.
- **Templates** — Classic, Modern, Minimal (ATS friendly, single column), Executive, Creative. All render the same normalized data; switching is lossless.
- **Design controls** — accent color, font, font size, line height, section spacing, margins, date format, A4 / US Letter (all bounded).
- **Autosave** — 900 ms debounce, one request in flight, revision check against stale tabs, local draft backup, offline queue + retry, “Saving / Saved / Save failed” status, unsaved-changes warning, draft restore.
- **Import** — PDF, DOCX, TXT (≤ 10 MB, extension + MIME + magic-byte checks). Rule-based extraction (no AI), per-section report (Found / Review / Not found), full review & edit before saving. Files are processed in memory and never stored.
- **Reuse** — duplicate or “use as base” (deep copy with a new name/template). The original is never modified. Template switches snapshot the previous version (`ResumeRevision`).
- **Export** — server-side PDF via headless Chromium (same components and CSS as the preview): selectable text, working links, `break-inside: avoid` on entries, headings kept with content. Filename like `Vedang_Shelatkar_Resume.pdf`. Print / Ctrl+P with dedicated print CSS.
- **Sharing** — Private / Unlisted / Public links at `/r/[slug]`, copy / open / disable. Public pages have title, description, Open Graph and canonical; unlisted pages are `noindex`.
- **PWA** — manifest, generated icons (incl. maskable), service worker with offline shell, install prompt.
- **Plans (₹, one-time, no auto-renewal)** — Free forever: 1 resume, 3 shareable links, Classic/Modern/Minimal. Job Pass ₹99 / 30 days, Pro ₹249 / 3 months ("Most popular"), Pro ₹599 / year ("Best value"). Limits are enforced server-side, with upgrade prompts in the UI.
- **Plan requests by email** — no payment gateway yet. "Get plan" opens a pre-filled Gmail message (plan, price, name, account email, current plan) to `NEXT_PUBLIC_PLAN_REQUEST_EMAIL`. After payment, activate with `npm run plan:grant -- user@example.com PRO_QUARTERLY`.
- **SEO** — keyword-focused metadata, `en-IN` locale, Open Graph image, JSON-LD (WebSite, Organization, SoftwareApplication, FAQPage, Article, Product offers in INR), sitemap with guides, robots rules, canonical URLs, resume guides at `/guides`.
- **Analytics scaffold** — typed events (`resume_created`, `resume_imported`, `template_selected`, `resume_exported`, …) with no resume content.

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui (Radix) · Framer Motion · Lucide · Zod · React Hook Form · Auth.js v5 · Prisma 6 + PostgreSQL · dnd-kit · unpdf + mammoth (import) · playwright-core (PDF) · Vitest · Playwright.

## Project structure

```
prisma/                 schema, migrations, seed
public/sw.js            service worker
scripts/                local database helpers
src/app/                routes (marketing, auth, app, api, print, public /r)
src/components/         ui (shadcn), landing, dashboard, resume/editor, resume/import, settings, pwa
src/lib/resume/         schema (Zod), defaults, sections, dates, links, completion, samples
src/lib/import/         resume text parser (pure, unit-tested)
src/server/             db, session, repository (ownership-scoped), actions, pdf, import, rate limit
src/templates/          template registry, shared blocks, 5 templates, ResumeRenderer
tests/unit, tests/e2e   Vitest and Playwright suites
```

## Setup

Requirements: Node.js 20.9+ (22 recommended) and PostgreSQL 14+.

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL and AUTH_SECRET
npx auth secret               # or: openssl rand -base64 32  → AUTH_SECRET
npx playwright install chromium   # browser used for PDF export (and E2E tests)
```

### Database

Use any PostgreSQL (local, Docker, Supabase, Neon…). Without one installed:

```bash
npm run db:local    # embedded native PostgreSQL on :5433 (keep running)
# or, where native binaries can't open sockets:
npm run db:pglite   # PostgreSQL-in-WASM on :5434, single connection (see .env.example)
```

Then:

```bash
npm run db:deploy   # apply migrations (or `npm run db:migrate` while developing the schema)
npm run db:seed     # demo account: demo@example.com / demo-password-1, three "Demo Resume"s
```

Demo resumes are flagged `isDemo`, labelled in the UI and can be deleted like any other resume. The seed refuses to run against production.

### Development

```bash
npm run dev         # http://localhost:3000
```

Password-reset emails are sent through Resend when `RESEND_API_KEY` and `EMAIL_FROM` are set; otherwise, in development only, the reset link is printed to the server console.

### Production build

```bash
npm run build
npm run start
```

## Environment variables

See [`.env.example`](.env.example). Required: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`. Optional: `NEXT_PUBLIC_APP_NAME`, `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, `AUTH_TRUST_HOST`, `RESEND_API_KEY`/`EMAIL_FROM`, `CHROMIUM_EXECUTABLE_PATH`, `INTERNAL_APP_URL`, `NEXT_PUBLIC_PLAN_REQUEST_EMAIL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `ANALYTICS_DEBUG`, `RELAX_RATE_LIMITS` (dev/E2E only; ignored in production).

## PDF generation

`GET /api/resumes/:id/pdf` checks the session and ownership, then opens `/print/:id?token=…` in headless Chromium with a 60-second HMAC token bound to that resume, and returns `page.pdf()` using the resume’s `@page` size and margins. Chromium is launched once and reused.

Deployment notes: the server needs a Chromium binary. Either run `npx playwright install --with-deps chromium` in the image, or set `CHROMIUM_EXECUTABLE_PATH` (e.g. `@sparticuz/chromium` on serverless). If the app can’t reach itself through the public URL, set `INTERNAL_APP_URL` (e.g. `http://127.0.0.1:3000`).

## PWA

- `src/app/manifest.ts` → `/manifest.webmanifest` (standalone, theme colors, shortcuts).
- `src/app/icons/[name]` generates 192/512/maskable/apple-touch PNGs at build time.
- `public/sw.js` (registered in production only): cache-first for build assets, network-first for public marketing pages, `/offline` fallback. Private pages, APIs, print and public resume routes are never cached, so personal data isn’t stored by the service worker. An open editor keeps working offline via its local draft and syncs on reconnect.

## Plans & activation

```bash
npm run plan:grant -- user@example.com JOB_PASS        # 30 days
npm run plan:grant -- user@example.com PRO_QUARTERLY   # 90 days
npm run plan:grant -- user@example.com PRO_YEARLY      # 365 days
npm run plan:grant -- user@example.com FREE            # revoke
```

Granting while a plan is active extends it from the current end date. When a plan expires the account returns to Free; existing resumes stay editable and downloadable.

## SEO checklist after deploy

1. Set `NEXT_PUBLIC_APP_URL` to the real domain (used for canonical URLs, sitemap and structured data).
2. Add the site to Google Search Console, set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, and submit `/sitemap.xml`.
3. Add more guides in `src/lib/content/guides.ts`; they appear in the sitemap automatically.

## Testing

```bash
npm run lint
npm run typecheck
npm test               # Vitest: schema/validation, completion, dates, links, parser, templates, PDF filename, print tokens, upload checks
npm run test:e2e       # Playwright (desktop + mobile); starts `npm run start` unless E2E_BASE_URL is set
```

E2E covers signup/onboarding, filling sections, validation messages, switching through all templates without data loss, autosave + reload, PDF download, duplicate (original unchanged), rename, delete, custom sections, PDF/DOCX/TXT import with review, unsupported files, signed-out redirects, cross-user access denial, public link share/disable, and mobile layouts. Set `RELAX_RATE_LIMITS=true` locally since E2E creates many accounts from one IP.

## Security notes

- Every resume query is scoped by `userId`; foreign ids return 404 (pages, actions, PDF route).
- All mutations are server actions (built-in origin/CSRF checks) with Zod validation; the same schemas validate in the editor.
- Templates render text only (no `dangerouslySetInnerHTML`); links allow only `http(s)`.
- Uploads: size, extension, MIME and magic-byte checks; PDFs ≤ 20 pages; never stored.
- Rate limits on login, signup, password reset, import and PDF export (in-memory; use Redis for multiple instances).
- Security headers (`X-Frame-Options`, `nosniff`, HSTS, referrer and permissions policies); private pages are `noindex`.

## Deployment

1. Provision PostgreSQL and set environment variables.
2. `npm ci && npm run build` (runs `prisma generate`).
3. `npm run db:deploy` on release.
4. Ensure a Chromium binary is available for PDF export (see above).
5. `npm run start` behind HTTPS; set `AUTH_TRUST_HOST=true` behind a proxy.

## Known limitations

- Import is heuristic. Unusual layouts (multi-column PDFs, tables) may need more manual correction; scanned/image-only PDFs aren’t supported (no OCR). Legacy `.doc` is not supported.
- The editor preview shows approximate page breaks; the PDF is authoritative.
- No payment gateway; paid plans are activated manually with `npm run plan:grant` after an emailed request.
- Rate limiting and the PDF browser are per-instance.
- Revision snapshots are stored (template changes) but there is no version-history UI yet.
- Email change and email verification are not implemented.

## Credits

Designed and developed by [CodeWithVedang](https://github.com/codewithvedang).
