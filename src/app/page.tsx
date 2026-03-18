import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { INVESTOR_PERSONAS } from "@/lib/personas";
import { CREDIT_PACKS } from "@/types";
import {
  ArrowRight,
  Upload,
  UserCheck,
  Mic2,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { generateOgMetadata } from "@/lib/metadata";

export const metadata = generateOgMetadata({
  title: "CastDeck — Practice Your Pitch Against AI Investors",
  description: "Upload your pitch deck. Hear it narrated in your voice. Get grilled by 8 distinct investor personas who attack your real numbers, not generic questions.",
  path: "/",
});

// ─── Attack style map ────────────────────────────────────────────────────────
// Each persona's first "attack" vector is its defining pressure. We surface it
// as a single-line "attack style" on the card.
const PERSONA_ACCENT: Record<string, string> = {
  "marcus-reid": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "victoria-cross": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "james-whitfield": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "sandra-blake": "bg-red-500/10 text-red-400 border-red-500/20",
  "oliver-strauss": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "rachel-monroe": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "daniel-park": "bg-green-500/10 text-green-400 border-green-500/20",
  "sophia-laurent": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

const PERSONA_INITIALS: Record<string, string> = {
  "marcus-reid": "MR",
  "victoria-cross": "VC",
  "james-whitfield": "JW",
  "sandra-blake": "SB",
  "oliver-strauss": "OS",
  "rachel-monroe": "RM",
  "daniel-park": "DP",
  "sophia-laurent": "SL",
};

const PERSONA_AVATAR_BG: Record<string, string> = {
  "marcus-reid": "bg-violet-500/20",
  "victoria-cross": "bg-blue-500/20",
  "james-whitfield": "bg-amber-500/20",
  "sandra-blake": "bg-red-500/20",
  "oliver-strauss": "bg-cyan-500/20",
  "rachel-monroe": "bg-pink-500/20",
  "daniel-park": "bg-green-500/20",
  "sophia-laurent": "bg-teal-500/20",
};

// ─── How It Works steps ───────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Your Deck",
    description:
      "Drop in your PDF. Our AI extracts every slide, builds a structured summary, and narrates it in your voice — or a preset voice — slide by slide.",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Pick Your Investor",
    description:
      "Choose from 8 distinct investor personas — a YC partner, a Sequoia skeptic, an old-school angel, a deep tech VC, and more. Each has a different attack style.",
  },
  {
    step: "03",
    icon: Mic2,
    title: "Get Grilled",
    description:
      "Live voice roleplay powered by your actual deck. Every question is based on your real numbers, your market claims, your team slide. No generic questions.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center">
              <Mic2 className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CastDeck</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#personas" className="hover:text-foreground transition-colors">Investors</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="size-[600px] rounded-full bg-primary/5 blur-[120px]" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/4 -translate-x-1/2"
          >
            <div className="size-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <Badge
              variant="outline"
              className="mb-6 inline-flex items-center gap-1.5 border-border/60 text-muted-foreground px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="size-3" />
              AI-powered pitch practice
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] text-balance mb-6">
              Practice your pitch against{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-muted-foreground">
                AI investors
              </span>{" "}
              who&apos;ve actually read your deck.
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-10 text-balance">
              Upload your deck. Hear it narrated in your voice. Get grilled by 8
              distinct investor personas. Walk into the real meeting prepared.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2 border-border/60 hover:border-border text-sm font-medium"
                >
                  Try Free Demo
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 text-sm font-medium"
                >
                  Get Started
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground/70 tracking-wide">
              Built for founders preparing for YC, Shark Tank India, and Series A rounds
            </p>
          </div>

          {/* Deck mockup preview strip */}
          <div className="relative mx-auto mt-20 max-w-5xl px-4">
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="size-2.5 rounded-full bg-red-500/60" />
                <div className="size-2.5 rounded-full bg-yellow-500/60" />
                <div className="size-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-muted-foreground/50 font-mono">castdesk.app / session</span>
              </div>
              <div className="grid grid-cols-12 divide-x divide-border/40 min-h-[220px]">
                {/* Slides panel */}
                <div className="col-span-3 p-3 space-y-1.5 bg-muted/10">
                  {["Problem", "Solution", "Market", "Traction", "Team"].map((slide, i) => (
                    <div
                      key={slide}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                        i === 1
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <span className="text-muted-foreground/40 mr-2 font-mono">0{i + 1}</span>
                      {slide}
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div className="col-span-6 p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-3">
                      Solution · Slide 02
                    </div>
                    <div className="h-3 w-2/3 rounded bg-muted/60 mb-2" />
                    <div className="h-3 w-full rounded bg-muted/40 mb-2" />
                    <div className="h-3 w-4/5 rounded bg-muted/40" />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                      <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] text-primary font-medium">Marcus Reid is listening…</span>
                    </div>
                  </div>
                </div>
                {/* Chat panel */}
                <div className="col-span-3 p-3 space-y-2 bg-muted/10">
                  <div className="rounded-md bg-muted/40 px-2.5 py-2">
                    <div className="text-[10px] font-medium text-muted-foreground/70 mb-1">Marcus Reid</div>
                    <div className="h-2 w-full rounded bg-muted/60 mb-1" />
                    <div className="h-2 w-3/4 rounded bg-muted/60" />
                  </div>
                  <div className="rounded-md bg-primary/10 border border-primary/15 px-2.5 py-2 ml-2">
                    <div className="text-[10px] font-medium text-primary/70 mb-1">You</div>
                    <div className="h-2 w-full rounded bg-primary/20 mb-1" />
                    <div className="h-2 w-1/2 rounded bg-primary/20" />
                  </div>
                  <div className="rounded-md bg-muted/40 px-2.5 py-2">
                    <div className="text-[10px] font-medium text-muted-foreground/70 mb-1">Marcus Reid</div>
                    <div className="h-2 w-5/6 rounded bg-muted/60" />
                  </div>
                </div>
              </div>
            </div>
            {/* Reflection */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 inset-x-4 h-20 bg-gradient-to-b from-transparent to-background"
            />
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 border-border/60 text-muted-foreground px-3 py-1 text-xs"
              >
                How it works
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                From deck to grilling in minutes
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-balance">
                No setup, no scripts, no generic flashcards. Your deck is the source of truth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop) */}
              <div
                aria-hidden
                className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent"
              />

              {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
                <div key={step} className="relative flex flex-col items-center text-center group">
                  <div className="relative mb-6">
                    <div className="size-20 rounded-2xl bg-card border border-border/60 flex items-center justify-center shadow-sm group-hover:border-primary/30 transition-colors">
                      <Icon className="size-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="absolute -top-2 -right-2 size-6 rounded-full bg-background border border-border/60 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground font-mono">{step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-balance">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Investor Personas ── */}
        <section id="personas" className="py-24 px-4 sm:px-6 bg-muted/5">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 border-border/60 text-muted-foreground px-3 py-1 text-xs"
              >
                8 investor personas
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Every room you might walk into
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-balance">
                Each persona has a distinct personality, attack style, and signature move —
                calibrated to pressure-test a different part of your story.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {INVESTOR_PERSONAS.map((persona) => {
                const accentClass =
                  PERSONA_ACCENT[persona.id] ??
                  "bg-primary/10 text-primary border-primary/20";
                const avatarBg =
                  PERSONA_AVATAR_BG[persona.id] ?? "bg-primary/20";
                const initials =
                  PERSONA_INITIALS[persona.id] ??
                  persona.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("");

                return (
                  <Card
                    key={persona.id}
                    className="group relative border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all duration-200 hover:shadow-lg hover:shadow-black/20 cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3 mb-3">
                        {/* Avatar */}
                        <div
                          className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${avatarBg}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm leading-tight truncate">
                            {persona.name}
                          </div>
                          <div className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">
                            {persona.title}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium self-start px-2 py-0.5 ${accentClass}`}
                      >
                        {persona.label}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {persona.attacks[0]}
                      </p>
                      <div className="border-t border-border/40 pt-3">
                        <div className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider mb-1.5">
                          Signature move
                        </div>
                        <p className="text-xs text-muted-foreground/80 italic line-clamp-2 leading-relaxed">
                          &ldquo;{persona.sampleQuestions[0]}&rdquo;
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 border-border/60 text-muted-foreground px-3 py-1 text-xs"
              >
                Pricing
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Credits, not subscriptions
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-balance">
                Buy once, use whenever. Credits never expire. No monthly lock-in.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Free Demo tier */}
              <Card className="relative flex flex-col border border-dashed border-border/50 bg-muted/10 hover:border-border/80 transition-all duration-200">
                <CardHeader className="pb-4 pt-8">
                  <div className="mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Free Demo</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-medium text-muted-foreground">₹</span>
                    <span className="text-4xl font-bold tracking-tight text-muted-foreground">0</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Zap className="size-3.5 text-muted-foreground/60" />
                    <span className="text-sm font-semibold text-muted-foreground/70">No signup needed</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 pt-0 gap-5">
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    See what CastDeck can do
                  </p>
                  <ul className="space-y-2.5 flex-1">
                    <li className="flex items-start gap-2 text-sm text-muted-foreground/70">
                      <CheckCircle2 className="size-4 text-muted-foreground/40 flex-shrink-0 mt-px" />
                      <span>Pre-loaded sample startup deck</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground/70">
                      <CheckCircle2 className="size-4 text-muted-foreground/40 flex-shrink-0 mt-px" />
                      <span>Text-only roleplay (5 turns)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground/70">
                      <CheckCircle2 className="size-4 text-muted-foreground/40 flex-shrink-0 mt-px" />
                      <span>1 investor persona (Marcus Reid)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground/70">
                      <CheckCircle2 className="size-4 text-muted-foreground/40 flex-shrink-0 mt-px" />
                      <span>Blurred debrief report preview</span>
                    </li>
                  </ul>
                  <Link href="/demo" className="w-full">
                    <Button
                      className="w-full mt-2"
                      variant="outline"
                    >
                      Try Demo
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {CREDIT_PACKS.map((pack) => {
                const isPopular = pack.id === "founder";
                return (
                  <Card
                    key={pack.id}
                    className={`relative flex flex-col border transition-all duration-200 ${
                      isPopular
                        ? "border-primary/50 bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]"
                        : "border-border/50 bg-card/50 hover:border-border"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1 shadow-md">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-4 pt-8">
                      <div className="mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {pack.name}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-medium text-muted-foreground">₹</span>
                        <span className="text-4xl font-bold tracking-tight">
                          {pack.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Zap className="size-3.5 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {pack.credits.toLocaleString()} credits
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 pt-0 gap-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pack.description}
                      </p>

                      {/* What you can do with credits */}
                      <ul className="space-y-2.5 flex-1">
                        {pack.id === "starter" && (
                          <>
                            <CreditLine>1 full deck upload &amp; narration</CreditLine>
                            <CreditLine>1 roleplay session with any persona</CreditLine>
                            <CreditLine>Basic feedback report</CreditLine>
                          </>
                        )}
                        {pack.id === "founder" && (
                          <>
                            <CreditLine>4 deck uploads with narration</CreditLine>
                            <CreditLine>4 roleplay sessions across personas</CreditLine>
                            <CreditLine>Voice cloning (your own voice)</CreditLine>
                            <CreditLine>Detailed feedback &amp; transcripts</CreditLine>
                          </>
                        )}
                        {pack.id === "studio" && (
                          <>
                            <CreditLine>10+ deck uploads &amp; narrations</CreditLine>
                            <CreditLine>10+ roleplay sessions</CreditLine>
                            <CreditLine>Voice cloning &amp; preset voices</CreditLine>
                            <CreditLine>Team access &amp; coach dashboard</CreditLine>
                            <CreditLine>Priority processing</CreditLine>
                          </>
                        )}
                      </ul>

                      <Link href="/sign-up" className="w-full">
                        <Button
                          className={`w-full mt-2 ${
                            isPopular
                              ? ""
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                          variant={isPopular ? "default" : "secondary"}
                        >
                          Get {pack.credits} credits
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Credit cost reference */}
            <div className="mt-10 rounded-xl border border-border/40 bg-muted/20 px-6 py-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 text-center">
                What do credits cost?
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { action: "Deck upload + narration", cost: "60 credits" },
                  { action: "Roleplay session", cost: "80 credits" },
                  { action: "Voice clone", cost: "40 credits" },
                  { action: "Slide regenerate", cost: "5 credits" },
                ].map(({ action, cost }) => (
                  <div key={action} className="space-y-1">
                    <div className="text-sm font-semibold">{cost}</div>
                    <div className="text-xs text-muted-foreground">{action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -z-10 left-1/2 -translate-x-1/2"
            >
              <div className="size-[400px] rounded-full bg-primary/5 blur-[80px]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 text-balance">
              Walk in knowing what&apos;s coming.
            </h2>
            <p className="text-muted-foreground mb-8 text-balance leading-relaxed">
              The investors you&apos;ll meet aren&apos;t going to go easy on you.
              Neither will ours. That&apos;s the point.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/sign-up">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-border/60">
                  Try Free Demo
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Start Practicing
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary flex items-center justify-center">
              <Mic2 className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">CastDeck</span>
          </div>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            &copy; {new Date().getFullYear()} CastDeck. Built for founders who take the meeting seriously.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Small helper ──────────────────────────────────────────────────────────────
function CreditLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="size-4 text-primary flex-shrink-0 mt-px" />
      <span>{children}</span>
    </li>
  );
}
