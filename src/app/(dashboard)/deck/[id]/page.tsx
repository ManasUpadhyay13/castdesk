"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { INVESTOR_PERSONAS } from "@/lib/personas";

interface Slide {
  id: string;
  slideNumber: number;
  rawText: string;
}

interface DeckInfo {
  id: string;
  filename: string;
  status: string;
}

const PERSONA_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "marcus-reid": { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
  "victoria-cross": { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  "james-whitfield": { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  "sandra-blake": { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  "oliver-strauss": { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
  "rachel-monroe": { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
  "daniel-park": { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  "sophia-laurent": { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30" },
};

const WIZARD_STEPS = [
  { num: 1, label: "Review Text" },
  { num: 2, label: "Pick Persona" },
  { num: 3, label: "Start Session" },
] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [deck, setDeck] = useState<DeckInfo | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/deck/${id}/slides`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to load deck.");
      }
      const data = await res.json();
      setDeck(data.deck);
      setSlides(data.slides ?? []);
      if (data.deck.status === "READY") {
        setStep(2);
      } else {
        setStep(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deck.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveDeck = async () => {
    if (!id) return;
    setApproving(true);
    setError(null);
    try {
      const res = await fetch(`/api/deck/${id}/approve`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to approve deck.");
      }
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve deck.");
    } finally {
      setApproving(false);
    }
  };

  const handleSelectPersona = (personaId: string) => {
    setSelectedPersonaId(personaId);
  };

  const handleStartSession = async () => {
    if (!id || !selectedPersonaId) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: id, personaId: selectedPersonaId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to start session.");
      }
      const data = await res.json();
      router.push(`/session/${data.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session.");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error && !deck) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-400">{error}</p>
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

  if (!deck) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-400">Deck not found.</p>
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

  const selectedPersona = selectedPersonaId
    ? INVESTOR_PERSONAS.find((p) => p.id === selectedPersonaId)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-zinc-300 transition-colors"
        >
          Dashboard
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate max-w-xs text-zinc-300">{deck.filename}</span>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-2">
        {WIZARD_STEPS.map((s, idx) => {
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          const isClickable = isCompleted;

          return (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => isClickable && setStep(s.num as 1 | 2 | 3)}
                disabled={!isClickable}
                className={[
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-zinc-900"
                    : isCompleted
                    ? "cursor-pointer bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    : "cursor-default bg-zinc-900 text-zinc-600",
                ].join(" ")}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <span
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                      isActive ? "bg-zinc-900 text-white" : "bg-zinc-700 text-zinc-500",
                    ].join(" ")}
                  >
                    {s.num}
                  </span>
                )}
                {s.label}
              </button>
              {idx < WIZARD_STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-zinc-700" />
              )}
            </div>
          );
        })}
      </div>

      {/* Error banner (non-fatal) */}
      {error && deck && (
        <div className="mb-6 rounded-lg border border-red-800/60 bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Step 1: Review Text */}
      {step === 1 && (
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">Review Extracted Text</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Check that the text was extracted correctly from your PDF, then approve to continue.
            </p>
          </div>

          <ScrollArea className="max-h-[60vh] pr-1">
            <div className="space-y-3 pb-2">
              {slides.map((slide) => (
                <Card key={slide.id} className="border-zinc-800 bg-zinc-900/40">
                  <CardContent className="px-4 py-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Slide {slide.slideNumber}
                    </p>
                    {slide.rawText ? (
                      <textarea
                        defaultValue={slide.rawText}
                        readOnly
                        rows={4}
                        className="w-full resize-y rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3 py-2 text-sm leading-relaxed text-zinc-300 focus:outline-none focus:border-zinc-600"
                      />
                    ) : (
                      <p className="text-sm italic text-zinc-600">No text extracted</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {slides.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center">
                  <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-zinc-600" />
                  <p className="text-sm text-zinc-500">Processing your deck…</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {slides.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleApproveDeck}
                disabled={approving}
                className="bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40"
              >
                {approving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {approving ? "Approving…" : "Approve Deck"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Pick Persona */}
      {step === 2 && (
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">Pick Your Investor</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Choose an investor persona to practice against. Each has a distinct style and attack vector.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {INVESTOR_PERSONAS.map((persona) => {
              const colors = PERSONA_COLORS[persona.id] ?? {
                bg: "bg-zinc-500/20",
                text: "text-zinc-400",
                border: "border-zinc-500/30",
              };
              const isSelected = selectedPersonaId === persona.id;

              return (
                <button
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona.id)}
                  className={[
                    "group flex flex-col items-start rounded-xl border p-4 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800/60",
                    isSelected
                      ? `${colors.border} ${colors.bg} ring-1 ring-offset-0`
                      : "border-zinc-800 bg-zinc-900/40",
                  ].join(" ")}
                >
                  {/* Initials Avatar */}
                  <div
                    className={[
                      "mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                      colors.bg,
                      colors.text,
                    ].join(" ")}
                  >
                    {getInitials(persona.name)}
                  </div>

                  {/* Name & Title */}
                  <p className="text-sm font-semibold text-white leading-tight">{persona.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500 leading-tight">{persona.title}</p>

                  {/* Label Badge */}
                  <Badge
                    className={[
                      "mt-2 border text-xs",
                      colors.bg,
                      colors.text,
                      colors.border,
                    ].join(" ")}
                  >
                    {persona.label}
                  </Badge>

                  {/* First attack as description */}
                  <p className="mt-2 text-xs text-zinc-500 line-clamp-2 leading-snug">
                    {persona.attacks[0]}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedPersonaId && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(3)}
                className="bg-white text-zinc-900 hover:bg-zinc-200"
              >
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Start Session */}
      {step === 3 && (
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">Ready to Begin</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Review the session details below and hit Start Session.
            </p>
          </div>

          <Card className="mb-6 border-zinc-800 bg-zinc-900/40">
            <CardContent className="divide-y divide-zinc-800 px-0 py-0">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-zinc-500">Deck</span>
                <span className="text-sm font-medium text-zinc-200 truncate max-w-xs text-right">
                  {deck.filename}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-zinc-500">Slides</span>
                <span className="text-sm font-medium text-zinc-200">
                  {slides.length} slide{slides.length !== 1 ? "s" : ""}
                </span>
              </div>
              {selectedPersona && (
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-zinc-500">Investor</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-200">{selectedPersona.name}</p>
                    <p className="text-xs text-zinc-500">{selectedPersona.title}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Change Investor
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={starting || !selectedPersonaId}
              className="bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40"
            >
              {starting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {starting ? "Starting…" : "Start Session"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
