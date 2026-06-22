# Effective Learning Preschool & Aftercare Institute — Website

A Next.js site with:
- **`/`** — landing page (hero, mission, programs, what-to-bring checklist, fees, FAQ)
- **`/register`** — separate route with a 4-step registration form (child + program + uniform size → parent info → required document uploads → payment method + review)
- **`/api/register`** — handles form submission + file uploads on the server

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How registration submissions work right now

When a parent submits the form, the API route:
1. Validates all required fields and required documents (NIB card, health certificate, birth certificate, parent ID — report card is optional).
2. Saves uploaded files (JPG/PNG/HEIC/PDF, 8MB max each) to `uploads/<submission-id>/` along with a `submission.json` containing all the form data.

**This is a placeholder, not a production backend.** Right now submissions just save to local disk — nobody gets notified. Before this goes live, you'll want one of:
- Wire `/src/app/api/register/route.ts` to email you (e.g. via Resend or SendGrid) on each submission, **and/or**
- Save submissions to a real database (Supabase is a natural fit since you already use it at OhanaHelps) instead of local files, **and/or**
- Add a simple `/admin` page that lists submissions so your mom can review them without digging through folders.

I can build any of these next — just say which.

## Editing fees, programs, or requirements

- Fees, programs, and FAQ copy: `src/app/page.tsx`
- Registration form fields/steps: `src/app/register/page.tsx`
- Colors/fonts: `src/app/globals.css` (look for `--orange`, `--sky`, `--pink`, etc.)

## Deploying

Easiest path is **Vercel** (made by the creators of Next.js, free tier is plenty for this):
1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo → Deploy.
3. Point your domain at it once it's live.

Note: file uploads currently save to local disk, which **does not persist on Vercel** (serverless functions reset). Before deploying for real, swap the upload handling in `route.ts` for cloud storage (Supabase Storage, since you already use Supabase, is the easiest fit) — happy to wire that up.
