"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Loader2,
  MessageSquare,
  FileText,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Mic2,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TURNS = 5;

const MARCUS_OPENING =
  "340 customers in 6 months with zero marketing spend. Why hasn't this been built before?";

const SAMPLE_SLIDES = [
  {
    number: 1,
    title: "The Problem",
    text: "Small businesses in India spend 34 days on average to fill a single role. They rely on job boards that cost ₹15,000/month and get flooded with irrelevant applications. 78% of SMB hiring managers say they waste over 10 hours per week screening candidates.",
  },
  {
    number: 2,
    title: "Our Solution",
    text: "QuickHire is an AI-powered hiring platform for Indian SMBs. Upload a job description, and our AI screens, ranks, and shortlists candidates in under 24 hours. We integrate directly with WhatsApp for candidate communication — no app download needed.",
  },
  {
    number: 3,
    title: "Market Size",
    text: "India has 63 million SMBs. 12 million actively hire each year. Average spend on hiring tools: ₹1.8 lakh/year. Total addressable market: ₹2.16 lakh crore ($26B). Our serviceable market (tech-savvy urban SMBs): ₹8,600 crore ($1B).",
  },
  {
    number: 4,
    title: "Traction",
    text: "Launched 6 months ago. 340 paying customers. MRR: ₹4.2 lakhs. Growing 28% month-over-month. Average time-to-hire reduced from 34 days to 8 days. NPS score: 72. Zero paid marketing — 100% word of mouth and WhatsApp referrals.",
  },
  {
    number: 5,
    title: "The Ask",
    text: "Raising ₹2 crore seed round. Use of funds: 60% engineering (AI model improvements, WhatsApp integration), 25% sales (hire 3 city leads for Mumbai, Bangalore, Delhi), 15% operations. 18-month runway. Target: 2,000 paying customers by month 18.",
  },
];

const DEMO_REPORT = {
  score: 68,
  weakAreas: [
    "Market size calculation: TAM of $26B seems top-down. Bottom-up math needed.",
    "Competitive moat: No clear technical advantage mentioned over existing job boards.",
    "Unit economics: CAC and LTV not addressed in the deck.",
  ],
  strongMoments: [
    "Strong traction numbers: 340 customers, 28% MoM growth with zero paid marketing.",
    "Clear problem definition with specific data points (34 days, ₹15K/month waste).",
  ],
  suggestions: [
    "Add a bottom-up TAM calculation showing actual SMB segments you can reach.",
    "Include unit economics: what does it cost to acquire a customer vs lifetime value?",
    "Address competition directly — how are you different from Naukri's SMB offerings?",
    "Show the WhatsApp integration as a technical moat, not just a feature.",
  ],
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = "deck" | "roleplay" | "report";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-1 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
        MR
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-zinc-700 bg-zinc-800 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="block h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="block h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="block h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

interface ChatBubbleProps {
  message: Message;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isAssistant = message.role === "assistant";

  if (isAssistant) {
    return (
      <div className="flex items-end gap-3 px-1 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
          MR
        </div>
        <div className="max-w-[78%]">
          <div className="rounded-2xl rounded-bl-sm border border-zinc-700 bg-zinc-800 px-4 py-3">
            <p className="text-sm leading-relaxed text-zinc-100">
              {message.content}
            </p>
          </div>
          <p className="mt-1 ml-1 text-[10px] text-zinc-600">Marcus Reid · YC Partner</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-end gap-3 px-1 py-2">
      <div className="max-w-[78%]">
        <div className="rounded-2xl rounded-br-sm border border-primary/20 bg-primary/10 px-4 py-3">
          <p className="text-sm leading-relaxed text-zinc-100">
            {message.content}
          </p>
        </div>
        <p className="mt-1 mr-1 text-right text-[10px] text-zinc-600">You</p>
      </div>
    </div>
  );
}

// Score ring — mirrors the real report page
function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-emerald-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
  const ringColor =
    score >= 70 ? "stroke-emerald-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500";
  const label =
    score >= 70 ? "Investor-Ready" : score >= 50 ? "Needs Work" : "Major Gaps";
  const labelColor =
    score >= 70
      ? "bg-emerald-900/40 text-emerald-400 border-emerald-800/50"
      : score >= 50
      ? "bg-yellow-900/40 text-yellow-400 border-yellow-800/50"
      : "bg-red-900/40 text-red-400 border-red-800/50";
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width="120" height="120" className="-rotate-90">
          <circle
            cx="60" cy="60" r={radius}
            fill="none" stroke="currentColor" strokeWidth="8"
            className="text-zinc-800"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none" strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-700", ringColor)}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={cn("text-3xl font-bold tabular-nums", color)}>{score}</span>
          <span className="text-xs text-zinc-600">/100</span>
        </div>
      </div>
      <Badge className={cn("border text-xs px-2.5", labelColor)}>{label}</Badge>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const [phase, setPhase] = useState<Phase>("deck");
  const [activeSlide, setActiveSlide] = useState(0);
  const [turns, setTurns] = useState<Message[]>([
    { role: "assistant", content: MARCUS_OPENING },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Count only user turns
  const userTurnCount = turns.filter((t) => t.role === "user").length;
  const sessionDone = userTurnCount >= MAX_TURNS;

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, sending]);

  // Focus textarea when entering roleplay
  useEffect(() => {
    if (phase === "roleplay") {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [phase]);

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || sessionDone) return;

    setSendError(null);
    setInput("");
    setSending(true);

    // Optimistically add the user message
    const userMessage: Message = { role: "user", content: text };
    setTurns((prev) => [...prev, userMessage]);

    try {
      // Build history for API (everything before this new user message)
      const historyForApi = turns.map((t) => ({
        role: t.role === "assistant" ? "assistant" : "user",
        content: t.content,
      }));

      const res = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyForApi,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Demo limit reached (5 turns)") {
          // Transition gracefully — the UI already prevents this but handle it
          setPhase("report");
          return;
        }
        throw new Error(data.error ?? "Failed to get response");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      setTurns((prev) => [...prev, assistantMessage]);

      // Auto-end after 5 user turns
      const newUserCount = userTurnCount + 1;
      if (newUserCount >= MAX_TURNS) {
        setTimeout(() => setPhase("report"), 800);
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Something went wrong");
      // Remove the optimistically added user message on error
      setTurns((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setSending(false);
    }
  }, [input, sending, sessionDone, turns, userTurnCount]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ---------------------------------------------------------------------------
  // Render: Phase 1 — Deck Overview
  // ---------------------------------------------------------------------------

  if (phase === "deck") {
    return (
      <div className="min-h-screen bg-zinc-950 text-foreground">
        {/* Nav */}
        <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-primary flex items-center justify-center">
                <Mic2 className="size-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">CastDeck</span>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-violet-500/30 text-violet-400 bg-violet-500/10 text-xs hidden sm:inline-flex">
                Free Demo
              </Badge>
              <Link href="/sign-up">
                <Button size="sm" className="text-sm">
                  Get Started
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-16">
          {/* Hero label */}
          <div className="mb-8 text-center">
            <Badge
              variant="outline"
              className="mb-4 border-zinc-700 text-zinc-400 text-xs px-3 py-1"
            >
              <FileText className="size-3 mr-1.5" />
              Sample Pitch Deck · QuickHire
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Here&apos;s the deck you&apos;ll be defending.
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
              Read through QuickHire&apos;s 5-slide pitch. Then step into the hot seat and
              defend these numbers in front of Marcus Reid — a YC partner who has
              heard every answer before.
            </p>
          </div>

          {/* Two-column layout: slide nav + content */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
            {/* Slide navigation sidebar */}
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {SAMPLE_SLIDES.map((slide, i) => (
                <button
                  key={slide.number}
                  onClick={() => setActiveSlide(i)}
                  className={cn(
                    "flex shrink-0 md:shrink items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all",
                    "md:w-full",
                    activeSlide === i
                      ? "border-white/20 bg-white/6 text-white"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      activeSlide === i
                        ? "bg-white text-zinc-900"
                        : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {slide.number}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap md:whitespace-normal">
                    {slide.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Slide content */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-900 text-xs font-bold shrink-0">
                    {SAMPLE_SLIDES[activeSlide].number}
                  </div>
                  <CardTitle className="text-base font-semibold text-white">
                    {SAMPLE_SLIDES[activeSlide].title}
                  </CardTitle>
                  <Badge className="ml-auto border-zinc-700 bg-zinc-800 text-zinc-400 text-[10px]">
                    Slide {SAMPLE_SLIDES[activeSlide].number} / {SAMPLE_SLIDES.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {SAMPLE_SLIDES[activeSlide].text}
                </p>

                {/* Navigation arrows */}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-zinc-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveSlide((i) => Math.max(0, i - 1))}
                    disabled={activeSlide === 0}
                    className="text-zinc-400 hover:text-white disabled:opacity-30"
                  >
                    ← Previous
                  </Button>
                  {activeSlide < SAMPLE_SLIDES.length - 1 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setActiveSlide((i) =>
                          Math.min(SAMPLE_SLIDES.length - 1, i + 1)
                        )
                      }
                      className="text-zinc-400 hover:text-white"
                    >
                      Next <ChevronRight className="ml-1 size-3.5" />
                    </Button>
                  ) : (
                    <span className="text-[11px] text-zinc-600 italic">
                      End of deck
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What to expect strip */}
          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  Ready? Marcus Reid is waiting.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="size-3.5" />
                    5-turn text roleplay
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="size-3.5" />
                    Debrief report preview
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-3.5" />
                    No sign-up needed
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setPhase("roleplay")}
                className="shrink-0 gap-2 bg-white text-zinc-900 hover:bg-zinc-200"
              >
                Start Roleplay
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Phase 2 — Roleplay
  // ---------------------------------------------------------------------------

  if (phase === "roleplay") {
    const turnsRemaining = MAX_TURNS - userTurnCount;

    return (
      <div className="flex h-screen flex-col bg-zinc-950 overflow-hidden">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
              MR
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Marcus Reid</p>
              <p className="text-xs text-zinc-500 truncate">YC Partner · QuickHire Demo</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 pl-3">
            {/* Turn counter */}
            <div className="hidden sm:flex items-center gap-1.5">
              <div
                className={cn(
                  "text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full border",
                  sessionDone
                    ? "border-zinc-700 bg-zinc-800 text-zinc-400"
                    : turnsRemaining <= 1
                    ? "border-red-800/60 bg-red-900/20 text-red-400"
                    : "border-zinc-700 bg-zinc-800/60 text-zinc-300"
                )}
              >
                {sessionDone ? "Session complete" : `Turn ${userTurnCount + 1} / ${MAX_TURNS}`}
              </div>
            </div>

            {!sessionDone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPhase("report")}
                className="border-zinc-700 text-zinc-300 hover:border-red-700/60 hover:bg-red-900/20 hover:text-red-400 text-xs"
              >
                End Session
              </Button>
            )}

            {sessionDone && (
              <Button
                size="sm"
                onClick={() => setPhase("report")}
                className="bg-white text-zinc-900 hover:bg-zinc-200 text-xs gap-1.5"
              >
                View Report
                <BarChart3 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Context strip — remind about the deck */}
        <div className="shrink-0 border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2 text-[11px] text-zinc-600 overflow-x-auto">
            <FileText className="size-3 shrink-0" />
            <span className="shrink-0 text-zinc-500 font-medium">QuickHire deck:</span>
            {SAMPLE_SLIDES.map((s) => (
              <span key={s.number} className="shrink-0">
                {s.number}. {s.title}
                {s.number < SAMPLE_SLIDES.length && (
                  <span className="mx-1.5 text-zinc-700">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-3 py-4 sm:px-5 space-y-0.5">
            {turns.map((turn, i) => (
              <ChatBubble key={i} message={turn} />
            ))}
            {sending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error banner */}
        {sendError && (
          <div className="shrink-0 border-t border-red-800/40 bg-red-900/10 px-4 py-2">
            <p className="text-xs text-red-400">{sendError}</p>
          </div>
        )}

        {/* Input or session done state */}
        {!sessionDone ? (
          <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 py-4 sm:px-6">
            <div className="flex items-end gap-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
                disabled={sending || sessionDone}
                rows={2}
                className={cn(
                  "flex-1 resize-none border-zinc-700 bg-zinc-900 text-sm text-zinc-100",
                  "placeholder:text-zinc-600 focus-visible:ring-zinc-600",
                  "min-h-[56px] max-h-[140px]"
                )}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || sending || sessionDone}
                className="h-10 w-10 shrink-0 bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-zinc-700">
                Enter to send · Shift+Enter for new line
              </p>
              {/* Mobile turn counter */}
              <p className={cn(
                "text-[10px] font-medium sm:hidden",
                turnsRemaining <= 1 ? "text-red-500" : "text-zinc-600"
              )}>
                {turnsRemaining} turn{turnsRemaining !== 1 ? "s" : ""} left
              </p>
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 py-5 text-center sm:px-6">
            <p className="text-sm text-zinc-400 mb-3">
              That&apos;s 5 turns — the session is complete.
            </p>
            <Button
              onClick={() => setPhase("report")}
              className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200"
            >
              <BarChart3 className="size-4" />
              See Your Debrief Report
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Phase 3 — Blurred Debrief Report
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center">
              <Mic2 className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">CastDeck</span>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="text-sm gap-1.5">
              Get Started — It&apos;s Free
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-zinc-400" />
            <h1 className="text-xl font-bold text-white">Debrief Report</h1>
            <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs ml-auto">
              Demo
            </Badge>
          </div>
          <p className="text-sm font-medium text-zinc-300 mb-1">QuickHire · Sample Deck</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Marcus Reid
            </span>
            <span>{userTurnCount} turns completed</span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Demo session
            </span>
          </div>
        </div>

        {/* Score (visible) */}
        <div className="mb-6 flex flex-col items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Overall Score
          </p>
          <ScoreRing score={DEMO_REPORT.score} />
        </div>

        {/* Blurred report sections + CTA overlay */}
        <div className="relative">
          {/* Blurred content */}
          <div className="blur-sm pointer-events-none select-none space-y-4" aria-hidden="true">
            {/* Weak Areas */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Weak Areas
                  <Badge className="ml-auto bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                    {DEMO_REPORT.weakAreas.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2.5">
                  {DEMO_REPORT.weakAreas.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <p className="text-sm leading-relaxed text-zinc-300">{item}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Strong Moments */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Strong Moments
                  <Badge className="ml-auto bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                    {DEMO_REPORT.strongMoments.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2.5">
                  {DEMO_REPORT.strongMoments.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <p className="text-sm leading-relaxed text-zinc-300">{item}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Separator className="bg-zinc-800" />

            {/* Suggestions */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Improvement Suggestions
                  <Badge className="ml-auto bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                    {DEMO_REPORT.suggestions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ol className="space-y-3">
                  {DEMO_REPORT.suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-900/40 text-[10px] font-bold text-amber-400 border border-amber-800/50">
                        {idx + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-zinc-300">{s}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* CTA overlay */}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-zinc-950/70 backdrop-blur-[2px]">
            <div className="text-center px-6 py-10 max-w-sm">
              {/* Lock icon with glow */}
              <div className="flex justify-center mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/80 shadow-lg shadow-black/40">
                  <Lock className="h-6 w-6 text-zinc-400" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Want your full report?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-7">
                Upload your own deck to get a personalized debrief — real
                weak spots, strong moments, and specific suggestions based on
                your actual pitch.
              </p>

              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-white text-zinc-900 hover:bg-zinc-200 font-semibold shadow-xl shadow-black/30"
                >
                  Get Started — It&apos;s Free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>

              <p className="mt-4 text-[11px] text-zinc-600">
                No credit card required · Takes 2 minutes
              </p>

              <Separator className="my-6 bg-zinc-800" />

              <p className="text-xs text-zinc-500 mb-3">
                Already have an account?
              </p>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA strip (below the blurred section) */}
        <div className="mt-10 rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-5 text-center">
          <p className="text-sm text-zinc-400 mb-1">
            You just got a taste of what Marcus Reid does to weak decks.
          </p>
          <p className="text-xs text-zinc-600 mb-5">
            Imagine having this feedback on <em>your</em> deck — before you walk
            into the real meeting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
              >
                Upload Your Own Deck
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <button
              onClick={() => {
                setTurns([{ role: "assistant", content: MARCUS_OPENING }]);
                setInput("");
                setSendError(null);
                setPhase("deck");
                setActiveSlide(0);
              }}
              className="text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
            >
              Restart demo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
