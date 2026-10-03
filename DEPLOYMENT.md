# Deploying MakeMyResume (Vercel + Render)

MakeMyResume is a single Next.js app: the UI, API routes, server actions and PDF export live in one codebase. You don't deploy a separate "backend".

| Piece | Where |
|---|---|
| Next.js app (frontend + API) | **Vercel** |
| PostgreSQL database | **Render** |

---

## 1. Push the code to GitHub

```bash
git add -A
git commit -m "Prepare MakeMyResume for deployment"
git branch -M main
git remote add origin https://github.com/codewithvedang/makemyresume.git
git push -u origin main
```

Make sure `.env` is **not** committed (it is already in `.gitignore`).

## 2. Create the database on Render

1. Sign in at https://dashboard.render.com, then **New → PostgreSQL**.
2. Name `makemyresume-db`, database `makemyresume`, region **Singapore** (closest to India), plan Free or Starter.
3. Click **Create Database** and wait until the status is *Available*.
4. Open the database page and copy the **External Database URL**.
5. Append SSL and pool settings:

   ```
   postgresql://USER:PASSWORD@HOST.singapore-postgres.render.com/makemyresume?sslmode=require&connection_limit=5
   ```

   This is your `DATABASE_URL`.

> Render's free Postgres expires after 30 days. Use a paid plan (Starter) for production so you don't lose data.

## 3. Create the project on Vercel

1. Sign in at https://vercel.com, then **Add New → Project**, and import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave the build command empty. Vercel runs the `vercel-build` script, which does `prisma generate && prisma migrate deploy && next build`, so migrations run on every deploy.
3. Region (Settings → Functions): **Mumbai (bom1)**, close to both users and the Render Singapore database.
4. Add **Environment Variables** (Production and Preview):

| Name | Value |
|---|---|
| `DATABASE_URL` | Render URL from step 2 |
| `AUTH_SECRET` | output of `npx auth secret` or `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` (or `https://<project>.vercel.app` first) |
| `NEXT_PUBLIC_PLAN_REQUEST_EMAIL` | `shelatkarvedang2@gmail.com` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | optional, from Search Console |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional, Google login |
| `RESEND_API_KEY` / `EMAIL_FROM` | optional, password-reset emails |

Do **not** set `RELAX_RATE_LIMITS` or `CHROMIUM_EXECUTABLE_PATH` on Vercel.

5. Click **Deploy**.

## 4. Seed the demo account (optional)

Run from your computer against the production database:

```bash
# PowerShell
$env:DATABASE_URL="<render url>"; $env:ALLOW_PRODUCTION_SEED="true"; npm run db:seed
```

Skip this if you don't want a demo account in production.

## 5. Custom domain

1. Vercel: **Settings → Domains**, then add `makemyresume.in` (or your domain) and follow the DNS instructions.
2. Update `NEXT_PUBLIC_APP_URL` to the final domain and **Redeploy**. Canonical URLs, the sitemap and share links use it.

## 6. Google login (optional)

1. https://console.cloud.google.com, then **APIs & Services → Credentials → Create OAuth client ID** (Web).
2. Authorized redirect URI: `https://your-domain.com/api/auth/callback/google`.
3. Put the client ID and secret into `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, then redeploy.

## 7. Get indexed by Google

1. https://search.google.com/search-console, then add the property for your domain.
2. Choose the HTML tag method, copy the `content` value into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, redeploy and verify.
3. **Sitemaps → submit** `https://your-domain.com/sitemap.xml`.

## 8. Activating paid plans

When a user emails a plan request and pays:

```bash
$env:DATABASE_URL="<render url>"; npm run plan:grant -- user@example.com PRO_QUARTERLY
```

## 9. Smoke test after deploy

- [ ] Home, `/pricing`, `/guides` load; `/sitemap.xml` and `/robots.txt` respond.
- [ ] Sign up, create a resume, edit it, reload: data persists.
- [ ] **Download PDF** works (uses serverless Chromium on Vercel).
- [ ] Import a PDF/DOCX.
- [ ] Share link opens in a private window; disabling the link returns 404.
- [ ] "Get Pro 3 months" opens Gmail with your details.
- [ ] On a phone: "Add to Home Screen" / install works.

## Troubleshooting

| Problem | Fix |
|---|---|
| `P1001 Can't reach database` | Use the **External** URL, include `?sslmode=require`, and check that the Render DB is *Available*. |
| PDF download fails on Vercel | Check the function logs. Set the function memory to 1024 MB+ (Settings → Functions). If the Chromium version is incompatible, pin `@sparticuz/chromium` to the version matching your `playwright-core` Chromium. |
| PDF route times out | The Hobby plan allows up to 60 s; the first cold start downloads Chromium, so retry once. |
| Login loop / `UntrustedHost` | Set `AUTH_TRUST_HOST=true` and the correct `NEXT_PUBLIC_APP_URL`. |
| Too many DB connections | Lower `connection_limit` in `DATABASE_URL`, or use Render's connection pooler. |

## Alternative: everything on Render

If you'd rather host the app on Render too: **New → Web Service** from the repo with Environment **Docker**, using a Dockerfile based on `mcr.microsoft.com/playwright:v1.63.0-jammy` that runs `npm ci && npm run build` and `npm run start`. Set `INTERNAL_APP_URL=http://127.0.0.1:10000`. Vercel + Render DB is simpler and faster for this app.
