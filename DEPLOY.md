# Deploy

Run on the M4 from a Terminal.

```bash
# 1. Move source to ~/Projects to avoid Box-sync breaking git locks
cp -r /Volumes/Working/dt-logo-questionnaire ~/Projects/dt-logo-questionnaire
cd ~/Projects/dt-logo-questionnaire

# 2. GitHub
gh repo create Notverysocial/dt-logo-questionnaire --public \
  --description "DT Logo Design Questionnaire — structured logo feedback for the DT team"
git init -b main
git add -A
git commit -m "Initial commit: DT Logo Design Questionnaire"
git remote add origin https://github.com/Notverysocial/dt-logo-questionnaire.git
git push -u origin main

# 3. Vercel
vercel link --yes --project dt-logo-questionnaire --scope notverysocials-projects
vercel deploy --prod --yes --scope notverysocials-projects
```

## Env vars (after first deploy)

```bash
# Reuse Kirsten's Resend key
vercel env pull /tmp/kirsten.env --scope notverysocials-projects \
  --environment production --project kirsten-brand-intake

vercel env add RESEND_API_KEY production       # paste from /tmp/kirsten.env
vercel env add NOTIFICATION_EMAIL production   # artemisexecutiveclub@gmail.com
vercel env add FROM_EMAIL production           # onboarding@resend.dev (or your verified sender)
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add ADMIN_TOKEN production          # any random string

vercel deploy --prod --yes
```

## Without env vars

The form still works — submissions just land in Vercel server logs instead of email/blob.
