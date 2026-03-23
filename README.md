# CastDeck

AI-powered pitch practice platform for startup founders. Upload your pitch deck, review the extracted text, then get grilled by 8 distinct AI investor personas who've actually read your deck.

## What it does

1. **Upload your pitch deck** — PDF upload, text extracted from every slide
2. **Review & approve** — See the extracted text, verify it looks right
3. **Pick your investor** — Choose from 8 AI personas, each with a unique attack style
4. **Live roleplay** — Text-based Q&A where the investor challenges your real numbers, claims, and assumptions
5. **Debrief report** — Readiness score, weak slides flagged, specific improvement suggestions

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Auth:** Clerk
- **Database:** PostgreSQL + Prisma ORM
- **AI:** OpenAI GPT-4o (persona responses + analysis), Whisper (speech-to-text)
- **Payments:** Dodo Payments (credit-based, INR + USD)
- **Analytics:** PostHog

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (for auth)
- OpenAI API key

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
| `DODO_PAYMENTS_API_KEY` | Dodo Payments API key |

## Investor Personas

| Persona | Style | Core Attack |
|---------|-------|-------------|
| Marcus Reid — YC Partner | Terse, Socratic | "Why now?" three levels deep |
| Victoria Cross — Sequoia Skeptic | Analytical, data-driven | Bottom-up TAM destruction |
| James Whitfield — Angel | Warm but surgical | Founder story, resilience |
| Sandra Blake — The Shark | Blunt, impatient | Revenue, CAC/LTV, burn rate |
| Oliver Strauss — Deep Tech VC | Curious, technically precise | Architecture deep-dive |
| Rachel Monroe — Consumer VC | High energy, narrative-obsessed | Brand, retention, emotional job |
| Daniel Park — Revenue-Only | Polite but immovable | "Show me an invoice" |
| Sophia Laurent — Impact VC | Mission-driven, systems thinker | "Who loses if you win?" |

## Credit System

| Action | Credits |
|--------|---------|
| Deck upload | 60 |
| Roleplay session | Free |
| Debrief report | Free |

**Packs:** Starter ₹499/$5 (100 credits) · Founder ₹1,499/$15 (400 credits) · Studio ₹3,499/$39 (1,200 credits)

Pricing auto-detects INR/USD based on user timezone, with a manual currency toggle.

## Project Structure

```
src/
├── app/
│   ├── (admin)/              # Admin panel
│   ├── (auth)/               # Clerk sign-in/sign-up
│   ├── (dashboard)/          # Main app
│   │   ├── dashboard/        # Deck list + upload
│   │   ├── deck/[id]/        # 3-step wizard (review → persona → start)
│   │   ├── session/[id]/     # Live chat session
│   │   ├── report/[id]/      # Debrief report
│   │   └── credits/          # Credit balance + purchase
│   ├── api/                  # API routes
│   │   ├── deck/             # Upload, approve, slides
│   │   ├── session/          # Start, message, end
│   │   ├── credits/          # Balance, purchase, webhook
│   │   └── report/           # Session report
│   └── page.tsx              # Landing page
├── components/
│   ├── landing-pricing.tsx   # Geo-detected pricing component
│   ├── promo-banner.tsx      # Dismissible promo banner
│   ├── layout/               # Dashboard navbar
│   ├── session/              # Voice recorder
│   └── ui/                   # shadcn components
├── lib/
│   ├── ai.ts                 # OpenAI GPT-4o integration
│   ├── auth.ts               # Clerk auth helpers + promo credits
│   ├── constants/
│   │   ├── persona-prompts.ts # Rich system prompts for all 8 personas
│   │   └── promo.ts          # Promo period config
│   ├── db.ts                 # Prisma client
│   ├── payments.ts           # Dodo Payments integration
│   ├── pdf.ts                # PDF text extraction
│   └── personas.ts           # Persona metadata + prompt references
└── types/
    └── index.ts              # Shared types, credit costs, pricing packs
```

## License

Private — All rights reserved.
