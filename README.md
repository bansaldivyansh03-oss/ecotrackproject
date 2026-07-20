# EcoTracker

A carbon-footprint tracking app: log daily activities across transport, electricity,
cooking, food, shopping, waste, and water; see your Carbon Score, streaks, and levels;
grow a virtual forest and Eco Pet; get AI-style tips from a rule-based assistant; and
try AI Eco Scan, OCR receipt scanning, and voice logging — all running entirely in
the browser, no backend or paid API keys required.

## Run locally

Requires Node.js 18.18+ (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it will redirect through the splash screen to onboarding,
then sign-in (Google/email are mocked locally; guest mode needs nothing), then the app.

To test a production build locally:

```bash
npm run build
npm run start
```

## Deploy to Vercel

**Option A — Vercel dashboard:** push this folder to a GitHub repo, then
[import it on vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js —
no configuration needed. Framework Preset: Next.js. Build Command: `next build`
(default). Output: handled automatically.

**Option B — Vercel CLI:**

```bash
npm install -g vercel
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```

No environment variables are required — everything (auth, activity data, AI
features) runs client-side and persists to the browser's localStorage.

## What's real vs. simulated

- **Real, fully working:** activity logging + emission-factor math, Carbon Score,
  XP/levels/streaks/achievements, Green Coins, charts (weekly/monthly/category/
  forecast), CSV/JSON export, virtual forest + pet animations, dark mode.
- **Real, but browser-dependent:** Voice Logging uses the Web Speech API
  (works in Chrome/Edge; not supported in all browsers). The OCR Receipt Scanner
  uses `tesseract.js`, which runs a real OCR model entirely on-device (first use
  downloads a small language model over the network, then works offline).
- **Simulated by design (no paid API keys used):** AI Eco Scan uses an on-device
  color/brightness heuristic to guess an object's category rather than true image
  recognition — the UI lets you correct it before logging. The Eco Assistant is a
  rule-based chatbot that reasons over your own logged data rather than calling a
  language model. Both are structured so you can later swap in a real vision/LLM
  API if you add your own key.
- **Local-only accounts:** "Sign in with Google" and email sign-in are mocked —
  they store a name/email in local state without any real OAuth or server. Data
  lives in your browser's localStorage per device/browser (see Profile → Export
  for a backup file).

## Project structure

- `src/lib/emissions.ts` — emission factors & carbon calculations
- `src/lib/analytics.ts` — score, trends, forecast, category breakdown
- `src/lib/achievements.ts` — badges, daily challenge selection
- `src/lib/store.ts` — global app state (zustand + localStorage persistence)
- `src/lib/assistant.ts`, `ecoscan.ts`, `voiceparse.ts` — the three "AI" features
- `src/app/(app)/*` — the main authenticated screens (dashboard, log, analytics,
  forest, profile, assistant, scan, voice)
