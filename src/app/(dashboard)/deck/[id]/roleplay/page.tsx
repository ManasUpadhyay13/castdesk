"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Static persona data (mirrors @/lib/personas — safe to use in client components)
// ---------------------------------------------------------------------------

interface PersonaDisplay {
  id: string;
  name: string;
  title: string;
  label: string;
  attack: string;
  initials: string;
  color: "violet" | "blue" | "amber" | "red" | "cyan" | "pink" | "green" | "teal";
}

const PERSONAS: PersonaDisplay[] = [
  {
    id: "marcus-reid",
    name: "Marcus Reid",
    title: "The YC Partner",
    label: "Terse, Socratic",
    attack: "Why now? Why you?",
    initials: "MR",
    color: "violet",
  },
  {
    id: "victoria-cross",
    name: "Victoria Cross",
    title: "The Sequoia Skeptic",
    label: "Analytical",
    attack: "TAM, defensibility, moat",
    initials: "VC",
    color: "blue",
  },
  {
    id: "james-whitfield",
    name: "James Whitfield",
    title: "The Old-School Angel",
    label: "Warm but probing",
    attack: "Founder story, customer love",
    initials: "JW",
    color: "amber",
  },
  {
    id: "sandra-blake",
    name: "Sandra Blake",
    title: "The Shark",
    label: "Blunt",
    attack: "CAC, LTV, unit economics",
    initials: "SB",
    color: "red",
  },
  {
    id: "oliver-strauss",
    name: "Oliver Strauss",
    title: "The Deep Tech VC",
    label: "Deep dives",
    attack: "How does this actually work?",
    initials: "OS",
    color: "cyan",
  },
  {
    id: "rachel-monroe",
    name: "Rachel Monroe",
    title: "The Consumer VC",
    label: "High energy",
    attack: "Brand, retention, emotional job",
    initials: "RM",
    color: "pink",
  },
  {
    id: "daniel-park",
    name: "Daniel Park",
    title: "The Revenue-Only Investor",
    label: "Ruthless",
    attack: "Only cares about paying customers",
    initials: "DP",
    color: "green",
  },
  {
    id: "sophia-laurent",
    name: "Sophia Laurent",
    title: "The Impact VC",
    label: "Mission-driven",
    attack: "Who loses if you win?",
    initials: "SL",
    color: "teal",
  },
];

// ---------------------------------------------------------------------------
// Color maps
// ---------------------------------------------------------------------------

const avatarColors: Record<PersonaDisplay["color"], string> = {
  violet: "bg-violet-900/60 text-violet-300 border-violet-800/60",
  blue: "bg-blue-900/60 text-blue-300 border-blue-800/60",
  amber: "bg-amber-900/60 text-amber-300 border-amber-800/60",
  red: "bg-red-900/60 text-red-300 border-red-800/60",
  cyan: "bg-cyan-900/60 text-cyan-300 border-cyan-800/60",
  pink: "bg-pink-900/60 text-pink-300 border-pink-800/60",
  green: "bg-green-900/60 text-green-300 border-green-800/60",
  teal: "bg-teal-900/60 text-teal-300 border-teal-800/60",
};

const labelColors: Record<PersonaDisplay["color"], string> = {
  violet: "bg-violet-900/40 text-violet-400 border-violet-800/50",
  blue: "bg-blue-900/40 text-blue-400 border-blue-800/50",
  amber: "bg-amber-900/40 text-amber-400 border-amber-800/50",
  red: "bg-red-900/40 text-red-400 border-red-800/50",
  cyan: "bg-cyan-900/40 text-cyan-400 border-cyan-800/50",
  pink: "bg-pink-900/40 text-pink-400 border-pink-800/50",
  green: "bg-green-900/40 text-green-400 border-green-800/50",
  teal: "bg-teal-900/40 text-teal-400 border-teal-800/50",
};

const cardAccents: Record<PersonaDisplay["color"], string> = {
  violet: "hover:border-violet-700/60",
  blue: "hover:border-blue-700/60",
  amber: "hover:border-amber-700/60",
  red: "hover:border-red-700/60",
  cyan: "hover:border-cyan-700/60",
  pink: "hover:border-pink-700/60",
  green: "hover:border-green-700/60",
  teal: "hover:border-teal-700/60",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RoleplayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [deckFilename, setDeckFilename] = useState<string | null>(null);
  const [loadingDeck, setLoadingDeck] = useState(true);
  const [starting, setStarting] = useState<string | null>(null); // personaId being started
  const [error, setError] = useState<string | null>(null);

  // Fetch deck info to display in header
  const fetchDeck = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/deck/${id}/slides`);
      if (res.ok) {
        const data = await res.json();
        setDeckFilename(data.deck?.filename ?? null);
      }
    } catch {
      // non-critical — header will just show generic text
    } finally {
      setLoadingDeck(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  async function handleSelect(personaId: string) {
    if (starting) return;
    setStarting(personaId);
    setError(null);

    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: id, personaId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start session");
      }

      router.push(`/session/${data.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
      setStarting(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Back nav */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-zinc-400 hover:text-white"
        >
          <Link href={`/deck/${id}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Deck
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Users className="h-5 w-5 text-zinc-400" />
          <h1 className="text-xl font-bold text-white">Choose Your Investor</h1>
        </div>
        {loadingDeck ? (
          <p className="text-sm text-zinc-600">Loading deck…</p>
        ) : (
          <p className="text-sm text-zinc-500">
            {deckFilename
              ? `Pitching: ${deckFilename}`
              : "Select an investor persona to start your mock Q&A session."}
          </p>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-800/60 bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Persona grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {PERSONAS.map((persona) => {
          const isStarting = starting === persona.id;
          const isDisabled = !!starting && !isStarting;

          return (
            <Card
              key={persona.id}
              className={cn(
                "border-zinc-800 bg-zinc-900 transition-all duration-200",
                cardAccents[persona.color],
                isDisabled && "opacity-50",
                !isDisabled && "cursor-pointer"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                      avatarColors[persona.color]
                    )}
                  >
                    {persona.initials}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-white">
                        {persona.name}
                      </p>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 border",
                          labelColors[persona.color]
                        )}
                      >
                        {persona.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">{persona.title}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      <span className="text-zinc-400 font-medium">Attack: </span>
                      {persona.attack}
                    </p>
                  </div>
                </div>

                {/* Select button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleSelect(persona.id)}
                    disabled={!!starting}
                    className={cn(
                      "bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 transition-all",
                      isStarting && "min-w-[100px]"
                    )}
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Starting…
                      </>
                    ) : (
                      "Select"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Credit notice */}
      <p className="mt-8 text-center text-xs text-zinc-600">
        Each session costs 80 credits. The AI investor will ask the first question automatically.
      </p>
    </div>
  );
}
