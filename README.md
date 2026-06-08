# DT Logo Design Questionnaire

A structured logo-feedback form for the Driven Talent team — replaces vague email feedback with concrete preferences the designers can act on.

Cloned from `kirsten-brand-intake` and rebranded for DT (black + gold, Barlow Condensed display, warm-cream paper).

## What it captures

5 sections, ~5 minutes to fill out:

1. **Identity** — one-word energy, three adjectives, primary audience (workers / employers / both / partners)
2. **Visual style pairs** — 6 button-pair this-or-that questions (bold/subtle, geometric/organic, modern/established, industrial/polished, wordmark-led/symbol-led, monochrome/color-led)
3. **References** — 2-3 logos that feel right + 1-2 that feel wrong (URL + why)
4. **Specific elements** — primary visible text (DT vs Driven Talent), imagery preferences, color beyond black+gold, things to avoid
5. **Contact** — name, email, role, final thoughts

## On submission

- Renders a clean markdown "Logo Preferences" brief
- Emails the brief to Antonio (`NOTIFICATION_EMAIL`) via Resend
- Sends a confirmation email back to the submitter
- Persists the full submission JSON to Vercel Blob under the `dt-logo-submissions/` prefix
- Falls back to Vercel server logs if email or blob storage aren't configured

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Resend · Vercel Blob

## Env vars

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | recommended | Sends email notifications |
| `NOTIFICATION_EMAIL` | optional | Where briefs land. Defaults to `artemisexecutiveclub@gmail.com` |
| `FROM_EMAIL` | optional | Verified Resend sender |
| `BLOB_READ_WRITE_TOKEN` | recommended | Durable submission persistence |
| `ADMIN_TOKEN` | optional | Bearer token for `GET /api/submissions` |

## Local dev

```bash
npm install
cp .env.example .env
npm run dev
```

## Deploy

See `DEPLOY.md`.
