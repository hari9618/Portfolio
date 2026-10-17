# Hari Krishna | AI Engineer portfolio

A cinematic single-page portfolio for full-time roles and freelance work: AI agents, n8n automation, Playwright
browser automation, hybrid RAG, and LLM observability / end-to-end evals as a service.

**Stack:** Next.js 15 (App Router, static export) · Tailwind CSS · Framer Motion · Lenis · simple-icons.
Fonts: Geist, Geist Mono, Instrument Serif.

## What's on the page

- **Cinematic intro gate:** boot-log preloader, then *Enter the experience*. The click starts a soundscape
  synthesized live with the Web Audio API (riser → sub-bass impact → shimmer → pad that settles into an ambient bed)
  and the curtains split open. Browsers only allow sound after a click, which is why the gate exists. Sound can be
  toggled from the nav. Code: `components/IntroGate.tsx`, `lib/cinematic-audio.ts`.
- **Hero:** a turning 3D mesh of agents with packets of work flowing between them (`components/AgentMesh.tsx`), plus
  floating live windows: a Playwright bot logging in, a Langfuse trace, an agent log, and an n8n flow
  (`components/LiveWindows.tsx`).
- **What I ship:** nine image cards, then **LLM observability & evals** with a live dashboard
  (`components/Observability.tsx`), **Playwright automation & testing** with self-typing code, a test runner and a
  headless browser (`components/BrowserAutomation.tsx`), a multi-agent workflow replay, case studies, experience,
  the tools grid, FAQ and contact.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
```

## Edit content

Words and numbers live in [`lib/content.ts`](lib/content.ts); tools and logos in [`lib/tools.ts`](lib/tools.ts).
Card art is in `public/ship-*.webp`; the résumé is `public/Hari_Krishna_AI_Engineer_Resume.pdf`.

## Deploy (Vercel, free)

Import the repo on vercel.com (set **Root Directory** to `portfolio` if it lives inside a monorepo). Optionally set
`NEXT_PUBLIC_SITE_URL` to your domain so share previews use absolute URLs. The build is static (`out/`), so Netlify,
Cloudflare Pages or GitHub Pages work too.
