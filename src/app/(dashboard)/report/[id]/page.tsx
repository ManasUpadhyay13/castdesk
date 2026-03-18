"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Turn {
  turnNumber: number;
  speaker: "INVESTOR" | "FOUNDER";
  text: string;
}

interface Report {
  id: string;
  overallScore: number;
  weakSlides: string[];
  strongMoments: string[];
  suggestions: string[];
  createdAt: string;
}

interface SessionInfo {
  id: string;
  deckId: string;
  personaId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  deckFilename: string;
}

// ---------------------------------------------------------------------------
// Persona name map
// ---------------------------------------------------------------------------

const PERSONA_NAMES: Record<string, string> = {
  "marcus-reid": "Marcus Reid",
  "victoria-cross": "Victoria Cross",
  "james-whitfield": "James Whitfield",
  "sandra-blake": "Sandra Blake",
  "oliver-strauss": "Oliver Strauss",
  "rachel-monroe": "Rachel Monroe",
  "daniel-park": "Daniel Park",
  "sophia-laurent": "Sophia Laurent",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(startedAt: string, endedAt: string | null): string {
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const ms = end - new Date(startedAt).getTime();
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Score display
// ---------------------------------------------------------------------------

interface ScoreDisplayProps {
  score: number;
}

function ScoreDisplay({ score }: ScoreDisplayProps) {
  const color =
    score >= 70
      ? "text-emerald-400"
      : score >= 50
      ? "text-yellow-400"
      : "text-red-400";

  const ringColor =
    score >= 70
      ? "stroke-emerald-500"
      : score >= 50
      ? "stroke-yellow-500"
      : "stroke-red-500";

  const label =
    score >= 70 ? "Investor-Ready" : score >= 50 ? "Needs Work" : "Major Gaps";

  const labelColor =
    score >= 70
      ? "bg-emerald-900/40 text-emerald-400 border-emerald-800/50"
      : score >= 50
      ? "bg-yellow-900/40 text-yellow-400 border-yellow-800/50"
      : "bg-red-900/40 text-red-400 border-red-800/50";

  // SVG circle progress
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width="120" height="120" className="-rotate-90">
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-800"
          />
          {/* Progress */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-700", ringColor)}
          />
        </svg>
        {/* Score number */}
        <div className="absolute flex flex-col items-center">
          <span className={cn("text-3xl font-bold tabular-nums", color)}>
            {score}
          </span>
          <span className="text-xs text-zinc-600">/100</span>
        </div>
      </div>
      <Badge className={cn("border text-xs px-2.5", labelColor)}>{label}</Badge>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section card
// ---------------------------------------------------------------------------

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  iconColor: string;
  itemDot: string;
  emptyText: string;
}

function SectionCard({
  icon,
  title,
  items,
  iconColor,
  itemDot,
  emptyText,
}: SectionCardProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className={iconColor}>{icon}</span>
          {title}
          {items.length > 0 && (
            <Badge className="ml-auto bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
              {items.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 italic">{emptyText}</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className={cn("mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full", itemDot)} />
                <p className="text-sm leading-relaxed text-zinc-300">{item}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Transcript message
// ---------------------------------------------------------------------------

interface TranscriptMessageProps {
  turn: Turn;
  personaName: string;
}

function TranscriptMessage({ turn, personaName }: TranscriptMessageProps) {
  const isInvestor = turn.speaker === "INVESTOR";
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        isInvestor
          ? "border-zinc-700 bg-zinc-800/60"
          : "border-primary/20 bg-primary/8 ml-8"
      )}
    >
      <p
        className={cn(
          "mb-1 text-[10px] font-semibold uppercase tracking-wide",
          isInvestor ? "text-zinc-500" : "text-zinc-500"
        )}
      >
        {isInvestor ? personaName : "You"}
      </p>
      <p className="text-sm leading-relaxed text-zinc-200">{turn.text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch data
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/report/${id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Report not found");
      }
      const data = await res.json();
      setSession(data.session);
      setTurns(data.turns ?? []);
      setReport(data.report ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Render: loading
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-400">{error ?? "Report not found"}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const personaName = PERSONA_NAMES[session.personaId] ?? "Investor";
  const duration = formatDuration(session.startedAt, session.endedAt);
  const turnCount = turns.length;

  // ---------------------------------------------------------------------------
  // Render: main
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back nav */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-zinc-400 hover:text-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Dashboard
        </Button>
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-zinc-400" />
          <h1 className="text-xl font-bold text-white">Debrief Report</h1>
          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs ml-auto">
            {session.status}
          </Badge>
        </div>

        <p className="text-sm font-medium text-zinc-300 mb-1">
          {session.deckFilename}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {personaName}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </span>
          <span>{turnCount} turns</span>
          {session.startedAt && (
            <span>{formatDate(session.startedAt)}</span>
          )}
        </div>
      </div>

      {/* ── Report not yet generated ────────────────────────────────── */}
      {!report && (
        <Card className="mb-8 border-yellow-800/60 bg-yellow-900/20">
          <CardContent className="flex items-center gap-3 py-5">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-300">
                Report is being generated
              </p>
              <p className="text-xs text-yellow-600">
                This usually takes 10–15 seconds. Refresh to check.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchData}
              className="ml-auto border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/30"
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Score ───────────────────────────────────────────────────── */}
      {report && (
        <>
          <div className="mb-8 flex flex-col items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 py-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
              Overall Score
            </p>
            <ScoreDisplay score={report.overallScore} />
          </div>

          {/* ── Sections grid ─────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-1">
            {/* Weak areas */}
            <SectionCard
              icon={<AlertTriangle className="h-4 w-4" />}
              title="Weak Areas"
              items={report.weakSlides}
              iconColor="text-red-400"
              itemDot="bg-red-500"
              emptyText="No significant weak areas identified."
            />

            {/* Strong moments */}
            <SectionCard
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Strong Moments"
              items={report.strongMoments}
              iconColor="text-emerald-400"
              itemDot="bg-emerald-500"
              emptyText="No standout strong moments were identified."
            />

            {/* Suggestions */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Improvement Suggestions
                  {report.suggestions.length > 0 && (
                    <Badge className="ml-auto bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                      {report.suggestions.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {report.suggestions.length === 0 ? (
                  <p className="text-sm text-zinc-600 italic">
                    No suggestions generated.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {report.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-900/40 text-[10px] font-bold text-amber-400 border border-amber-800/50">
                          {idx + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-zinc-300">
                          {suggestion}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8 bg-zinc-800" />
        </>
      )}

      {/* ── Transcript toggle ─────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setTranscriptOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-800/60"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-200">
              Full Transcript
            </span>
            <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px]">
              {turnCount} turns
            </Badge>
          </div>
          {transcriptOpen ? (
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          )}
        </button>

        {transcriptOpen && (
          <div className="mt-3 space-y-2.5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            {turns.length === 0 ? (
              <p className="text-sm text-zinc-600 italic">
                No turns recorded.
              </p>
            ) : (
              turns.map((turn) => (
                <TranscriptMessage
                  key={turn.turnNumber}
                  turn={turn}
                  personaName={personaName}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Back to Dashboard
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/deck/${session.deckId}/roleplay`)}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Try Another Session
        </Button>
      </div>
    </div>
  );
}
