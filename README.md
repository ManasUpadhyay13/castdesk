# CastDeck

AI-powered pitch practice platform for startup founders. Upload your pitch deck, get it narrated in your voice, then get grilled by AI investor personas who've actually read your deck.

## What it does

1. **Upload your pitch deck** — PDF upload, AI extracts and summarizes every slide
2. **AI narration** — Each slide gets a narration script, voiced by your cloned voice or a preset AI voice (ElevenLabs)
3. **Live investor roleplay** — Voice-based Q&A with 8 distinct AI investor personas, each with unique attack styles
4. **Debrief report** — Readiness score, weak slides flagged, specific improvement suggestions

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Auth:** Clerk
- **Database:** PostgreSQL + Prisma ORM
- **AI:** OpenAI GPT-4o (narration + personas), ElevenLabs (TTS + voice cloning), Whisper (speech-to-text)
- **Payments:** Dodo Payments (credit-based)
- **Analytics:** PostHog

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (for auth)
- OpenAI API key
- ElevenLabs API key (for voice features)

### Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `OPENAI_API_KEY` | OpenAI API key |
| `ELEVENLABS_API_KEY` | ElevenLabs API key |

## Investor Personas

| Persona | Style | Core Attack |
|---------|-------|-------------|
| Marcus Reid — YC Partner | Terse, Socratic | "Why now?" three levels deep |
| Victoria Cross — Sequoia Skeptic | Analytical | Bottom-up TAM destruction |
| James Whitfield — Angel | Warm but surgical | Founder story, resilience |
| Sandra Blake — The Shark | Blunt, impatient | Revenue, CAC/LTV, burn rate |
| Oliver Strauss — Deep Tech VC | Curious, technical | Architecture deep-dive |
| Rachel Monroe — Consumer VC | High energy | Brand, retention, emotional job |
| Daniel Park — Revenue-Only | Skeptical | "Show me an invoice" |
| Sophia Laurent — Impact VC | Mission-driven | "Who loses if you win?" |

## Credit System

| Action | Credits |
|--------|---------|
| Deck upload + narration | 60 |
| Roleplay session (20 min) | 80 |
| Voice cloning | 40 |
| Slide regeneration | 5 |

**Packs:** Starter ₹499 (100 credits) · Founder ₹1,499 (400 credits) · Studio ₹3,499 (1,200 credits)

## Project Structure

```
src/
├── app/
│   ├── (admin)/          # Admin panel
│   ├── (auth)/           # Clerk sign-in/sign-up
│   ├── (dashboard)/      # Main app (dashboard, deck viewer)
│   ├── api/              # API routes
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Navbar
│   └── ui/               # Shadcn components
├── lib/
│   ├── ai.ts             # OpenAI integration
│   ├── auth.ts           # Clerk auth helpers
│   ├── db.ts             # Prisma client
│   ├── pdf.ts            # PDF processing
│   └── personas.ts       # 8 investor persona definitions
└── types/
    └── index.ts          # Shared types + credit constants
```

## License

Private — All rights reserved.
