"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Mic, Users, Loader2, ChevronRight, Volume2 } from "lucide-react";
import Link from "next/link";

type DeckStatus = "PROCESSING" | "READY" | "FAILED";

interface Slide {
  id: string;
  slideNumber: number;
  rawText: string;
  scriptText: string | null;
  audioUrl: string | null;
}

interface DeckInfo {
  id: string;
  filename: string;
  status: DeckStatus;
  voiceType: string;
}

const POLL_INTERVAL = 3000;

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [deck, setDeck] = useState<DeckInfo | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [playingSlideId, setPlayingSlideId] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch full slide data
  const fetchData = useCallback(async () => {
    if (!id) return null;
    try {
      const res = await fetch(`/api/deck/${id}/slides`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to load deck.");
      }
      const data = await res.json();
      // Response shape: { deck: {...}, slides: [...] }
      setDeck(data.deck);
      setSlides(data.slides ?? []);
      return data.deck.status as DeckStatus;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deck.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll while PROCESSING
  useEffect(() => {
    if (!deck || deck.status !== "PROCESSING") {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const poll = async () => {
      const status = await fetchData();
      if (status === "PROCESSING") {
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL);
      }
    };

    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL);

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [deck?.status, fetchData]);

  // Generate narration scripts (text only, no audio)
  const handleGenerateScripts = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/deck/${id}/generate-scripts`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to start script generation");
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate scripts");
    } finally {
      setGenerating(false);
    }
  };

  // Start audio narration generation
  const handleGenerateAudio = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/deck/${id}/narrate`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to start narration");
      }
      // Refresh to pick up PROCESSING status
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start narration");
    } finally {
      setGenerating(false);
    }
  };

  // Play/stop audio
  const handlePlay = (slide: Slide) => {
    if (!slide.audioUrl) return;

    if (playingSlideId === slide.id) {
      // Stop current
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingSlideId(null);
      return;
    }

    // Stop previous
    audioRef.current?.pause();

    const audio = new Audio(slide.audioUrl);
    audio.onended = () => {
      setPlayingSlideId(null);
      audioRef.current = null;
    };
    audio.play();
    audioRef.current = audio;
    setPlayingSlideId(slide.id);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

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

  const slidesWithScript = slides.filter((s) => s.scriptText);
  const slidesWithAudio = slides.filter((s) => s.audioUrl);
  const hasScripts = slidesWithScript.length > 0;
  const hasAllAudio = slidesWithAudio.length === slides.length && slides.length > 0;
  const isProcessing = deck.status === "PROCESSING";

  // During audio generation (hasScripts already), track audio progress; otherwise track script progress
  const processingProgress =
    slides.length > 0
      ? hasScripts
        ? Math.round((slidesWithAudio.length / slides.length) * 100)
        : Math.round((slidesWithScript.length / slides.length) * 100)
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
            {slides.length} slide{slides.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* No scripts yet — show Generate Scripts button */}
          {!hasScripts && !isProcessing && (
            <Button
              size="sm"
              onClick={handleGenerateScripts}
              disabled={generating}
              className="bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40"
            >
              {generating ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              Generate Scripts
            </Button>
          )}

          {/* Scripts exist — show Choose Voice + Generate Audio */}
          {hasScripts && !hasAllAudio && !isProcessing && (
            <>
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
                variant="outline"
                onClick={handleGenerateAudio}
                disabled={generating}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                {generating ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Volume2 className="mr-1.5 h-4 w-4" />
                )}
                Generate Audio
              </Button>
            </>
          )}

          {/* All audio ready — show Slide Player */}
          {hasAllAudio && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Link href={`/deck/${id}/player`}>
                <Play className="mr-1.5 h-4 w-4" />
                Slide Player
              </Link>
            </Button>
          )}

          {/* Start Roleplay — available whenever scripts exist (text roleplay doesn't need audio) */}
          {hasScripts && !isProcessing && (
            <Button
              asChild
              size="sm"
              className="bg-white text-zinc-900 hover:bg-zinc-200"
            >
              <Link href={`/deck/${id}/roleplay`}>
                <Users className="mr-1.5 h-4 w-4" />
                Start Roleplay
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <Card className="mb-6 border-yellow-800/60 bg-yellow-900/20">
          <CardContent className="py-6">
            <div className="mb-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
              <p className="text-sm font-medium text-yellow-300">
                {hasScripts
                  ? `Generating audio — ${slidesWithAudio.length}/${slides.length} slides…`
                  : `Generating scripts — ${slidesWithScript.length}/${slides.length} slides…`}
              </p>
            </div>
            <Progress
              value={processingProgress}
              className="h-2 bg-yellow-900/40"
            />
            <p className="mt-2 text-xs text-yellow-600">
              This may take a few minutes. The page updates automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Failed state */}
      {deck.status === "FAILED" && (
        <Card className="mb-6 border-red-800/60 bg-red-900/20">
          <CardContent className="py-5">
            <p className="text-sm font-medium text-red-400">
              Processing failed. You can try generating audio again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status badge */}
      <div className="mb-4 flex items-center gap-2">
        <Badge
          className={
            deck.status === "PROCESSING"
              ? "bg-yellow-900/60 text-yellow-400 border-yellow-800"
              : deck.status === "FAILED"
              ? "bg-red-900/60 text-red-400 border-red-800"
              : hasAllAudio
              ? "bg-emerald-900/60 text-emerald-400 border-emerald-800"
              : hasScripts
              ? "bg-blue-900/60 text-blue-400 border-blue-800"
              : "bg-zinc-800/60 text-zinc-400 border-zinc-700"
          }
        >
          {deck.status === "PROCESSING"
            ? "Processing"
            : deck.status === "FAILED"
            ? "Failed"
            : hasAllAudio
            ? "Ready"
            : hasScripts
            ? "Scripts Ready"
            : "Review Text"}
        </Badge>
        {hasScripts && (
          <span className="text-xs text-zinc-500">
            {slidesWithAudio.length}/{slides.length} audio generated
          </span>
        )}
      </div>

      {/* Raw text review — shown when no scripts exist and not processing */}
      {!hasScripts && !isProcessing && slides.length > 0 && (
        <div className="mb-6">
          <Card className="mb-4 border-blue-800/60 bg-blue-900/20">
            <CardContent className="py-4 px-5">
              <p className="text-sm text-blue-300">
                We&apos;ve extracted text from your PDF. Review it below and click{" "}
                <span className="font-semibold">Generate Scripts</span> when ready.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {slides.map((slide) => (
              <Card key={slide.id} className="border-zinc-800 bg-zinc-900/40">
                <CardContent className="px-4 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Slide {slide.slideNumber}
                  </p>
                  <textarea
                    defaultValue={slide.rawText}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleGenerateScripts}
              disabled={generating}
              className="bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {generating ? "Generating…" : "Approve & Generate Scripts"}
            </Button>
          </div>
        </div>
      )}

      {/* Slide list — shown when scripts exist */}
      {hasScripts && slides.length > 0 && (
        <ScrollArea className="rounded-xl border border-zinc-800">
          <div className="divide-y divide-zinc-800">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex items-start gap-4 px-4 py-4 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-400">
                  {slide.slideNumber}
                </div>

                <div className="min-w-0 flex-1">
                  {slide.scriptText ? (
                    <p className="line-clamp-2 text-sm text-zinc-300">
                      {slide.scriptText}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-600 italic">
                      Generating script…
                    </p>
                  )}
                  {slide.audioUrl && (
                    <span className="mt-1 inline-block text-xs text-emerald-500">
                      Audio ready
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!slide.audioUrl}
                  className="shrink-0 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={() => handlePlay(slide)}
                  title={
                    !slide.audioUrl
                      ? "No audio yet"
                      : playingSlideId === slide.id
                      ? "Stop"
                      : "Play"
                  }
                >
                  {playingSlideId === slide.id ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {slides.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-zinc-600" />
          <p className="text-sm text-zinc-500">Processing your deck…</p>
        </div>
      )}
    </div>
  );
}
