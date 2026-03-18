"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Mic, Users, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

type DeckStatus = "PROCESSING" | "READY" | "FAILED";

interface Slide {
  id: string;
  slideNumber: number;
  scriptText: string | null;
  audioUrl: string | null;
}

interface DeckData {
  id: string;
  filename: string;
  status: DeckStatus;
  totalSlides: number;
  processedSlides: number;
  slides: Slide[];
  createdAt: string;
}

const POLL_INTERVAL = 3000;

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [deck, setDeck] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSlides = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await fetch(`/api/deck/${id}/slides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to load deck.");
      }
      const data: DeckData = await res.json();
      setDeck(data);
      return data.status;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deck.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  const pollStatus = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await fetch(`/api/deck/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setDeck((prev) =>
        prev
          ? {
              ...prev,
              status: data.status,
              processedSlides: data.processedSlides ?? prev.processedSlides,
              slides: data.slides ?? prev.slides,
            }
          : prev
      );
      return data.status as DeckStatus;
    } catch {
      // ignore poll errors
    }
  }, [token, id]);

  // Initial load
  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Polling while PROCESSING
  useEffect(() => {
    if (!deck) return;
    if (deck.status !== "PROCESSING") {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      return;
    }

    const schedulePoll = () => {
      pollTimerRef.current = setTimeout(async () => {
        const status = await pollStatus();
        if (status === "PROCESSING") {
          schedulePoll();
        } else if (status === "READY" || status === "FAILED") {
          // Re-fetch full slide data when done
          fetchSlides();
        }
      }, POLL_INTERVAL);
    };

    schedulePoll();

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [deck?.status, pollStatus, fetchSlides]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-zinc-400">{error ?? "Deck not found."}</p>
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

  const processingProgress =
    deck.totalSlides > 0
      ? Math.round((deck.processedSlides / deck.totalSlides) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-zinc-300 transition-colors"
        >
          Dashboard
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-300 truncate max-w-xs">{deck.filename}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white break-words">
            {deck.filename}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {deck.totalSlides} slide{deck.totalSlides !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Action buttons — only shown when READY */}
        {deck.status === "READY" && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Link href={`/deck/${id}/voice`}>
                <Mic className="mr-1.5 h-4 w-4" />
                Choose Voice
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-white text-zinc-900 hover:bg-zinc-200"
              onClick={() => {
                // Persona selection — to be built
              }}
            >
              <Users className="mr-1.5 h-4 w-4" />
              Start Roleplay
            </Button>
          </div>
        )}
      </div>

      {/* Processing state */}
      {deck.status === "PROCESSING" && (
        <Card className="mb-6 border-yellow-800/60 bg-yellow-900/20">
          <CardContent className="py-6">
            <div className="mb-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
              <p className="text-sm font-medium text-yellow-300">
                Generating narration{" "}
                {deck.processedSlides}/{deck.totalSlides} slides…
              </p>
            </div>
            <Progress
              value={processingProgress}
              className="h-2 bg-yellow-900/40"
            />
            <p className="mt-2 text-xs text-yellow-600">
              This may take a few minutes. The page will update automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Failed state */}
      {deck.status === "FAILED" && (
        <Card className="mb-6 border-red-800/60 bg-red-900/20">
          <CardContent className="py-5">
            <p className="text-sm font-medium text-red-400">
              Processing failed. Please try uploading the deck again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status badge */}
      <div className="mb-4 flex items-center gap-2">
        <Badge
          className={
            deck.status === "READY"
              ? "bg-emerald-900/60 text-emerald-400 border-emerald-800"
              : deck.status === "FAILED"
              ? "bg-red-900/60 text-red-400 border-red-800"
              : "bg-yellow-900/60 text-yellow-400 border-yellow-800"
          }
        >
          {deck.status === "READY"
            ? "Ready"
            : deck.status === "FAILED"
            ? "Failed"
            : "Processing"}
        </Badge>
      </div>

      {/* Slide list */}
      {deck.slides && deck.slides.length > 0 && (
        <ScrollArea className="rounded-xl border border-zinc-800">
          <div className="divide-y divide-zinc-800">
            {deck.slides.map((slide) => (
              <div
                key={slide.id}
                className="flex items-start gap-4 px-4 py-4 hover:bg-zinc-900/50 transition-colors"
              >
                {/* Slide number */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-400">
                  {slide.slideNumber}
                </div>

                {/* Script preview */}
                <div className="min-w-0 flex-1">
                  {slide.scriptText ? (
                    <p className="line-clamp-2 text-sm text-zinc-300">
                      {slide.scriptText}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-600 italic">
                      No script yet…
                    </p>
                  )}
                </div>

                {/* Play button */}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!slide.audioUrl}
                  className="shrink-0 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (slide.audioUrl) {
                      const audio = new Audio(slide.audioUrl);
                      audio.play();
                    }
                  }}
                  title={slide.audioUrl ? "Play audio" : "No audio yet"}
                >
                  <Play className="h-4 w-4 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Empty slides (still processing, no slides fetched yet) */}
      {deck.status === "PROCESSING" && (!deck.slides || deck.slides.length === 0) && (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-zinc-600" />
          <p className="text-sm text-zinc-500">Slides will appear here as they are processed.</p>
        </div>
      )}
    </div>
  );
}
