"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import SlidePlayer from "@/components/deck/slide-player";
import {
  ChevronLeft,
  Edit3,
  Save,
  X,
  Loader2,
  Play,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Slide {
  id: string;
  slideNumber: number;
  scriptText: string | null;
  audioUrl: string | null;
}

interface DeckMeta {
  id: string;
  filename: string;
  status: string;
}

interface SlidesResponse {
  deck: DeckMeta;
  slides: Slide[];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();

  // ── Data state ────────────────────────────────────────────────────────────
  const [deck, setDeck] = useState<DeckMeta | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Navigation state ──────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);

  // ── Audio state ───────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Generating (no-audio) state ───────────────────────────────────────────
  const [generating, setGenerating] = useState(false);

  // ── Active slide shortcut ─────────────────────────────────────────────────
  const activeSlide = slides[activeIndex] ?? null;

  // ── Fetch slides on mount ─────────────────────────────────────────────────
  const fetchSlides = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/deck/${id}/slides`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load deck.");
      }
      const data: SlidesResponse = await res.json();
      setDeck(data.deck);
      setSlides(data.slides);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deck.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // ── Audio: load new URL whenever the active slide changes ─────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const url = activeSlide?.audioUrl ?? null;
    if (!url) {
      audio.src = "";
      return;
    }

    audio.src = url;
    audio.load();
  }, [activeSlide?.audioUrl]);

  // ── Audio: wire up the <audio> element once on mount ─────────────────────
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // handled by auto-play effect below via isPlaying flip
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  // ── Auto-play: advance to next slide when track ends ─────────────────────
  const prevIsPlayingRef = useRef(isPlaying);
  useEffect(() => {
    const wasPlaying = prevIsPlayingRef.current;
    prevIsPlayingRef.current = isPlaying;

    // detect transition from playing → not playing (ended or explicit pause)
    if (wasPlaying && !isPlaying && autoPlay) {
      const audio = audioRef.current;
      // Only auto-advance if the track reached the end (not a manual pause)
      if (audio && Math.abs(audio.currentTime - audio.duration) < 0.5 && audio.duration > 0) {
        setActiveIndex((i) => {
          const next = i + 1;
          if (next < slides.length) return next;
          return i;
        });
      }
    }
  }, [isPlaying, autoPlay, slides.length]);

  // ── Auto-play: when index advances due to auto-play, start playing ────────
  const autoPlayPendingRef = useRef(false);

  useEffect(() => {
    if (!autoPlayPendingRef.current) return;
    autoPlayPendingRef.current = false;
    const audio = audioRef.current;
    if (!audio || !activeSlide?.audioUrl) return;
    // Small delay to let the src swap settle
    const t = setTimeout(() => {
      audio.play().catch(() => {});
    }, 150);
    return () => clearTimeout(t);
  }, [activeIndex, activeSlide?.audioUrl]);

  // Mark pending when auto-advancing
  const prevAutoPlayRef = useRef(autoPlay);
  useEffect(() => {
    prevAutoPlayRef.current = autoPlay;
  }, [autoPlay]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeSlide?.audioUrl) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, activeSlide?.audioUrl]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handlePrevious = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((i) => Math.min(slides.length - 1, i + 1));
    setIsPlaying(false);
  }, [slides.length]);

  const handleSlideSelect = useCallback((index: number) => {
    if (audioRef.current) audioRef.current.pause();
    setActiveIndex(index);
    setIsPlaying(false);
    setEditMode(false);
    setSaveError(null);
  }, []);

  const handleAutoPlayToggle = useCallback(() => {
    setAutoPlay((v) => !v);
  }, []);

  // ── Edit / Save ───────────────────────────────────────────────────────────

  const enterEditMode = useCallback(() => {
    setEditText(activeSlide?.scriptText ?? "");
    setSaveError(null);
    setEditMode(true);
  }, [activeSlide?.scriptText]);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    setSaveError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!activeSlide || !id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(
        `/api/deck/${id}/slide/${activeSlide.slideNumber}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scriptText: editText }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed.");
      }
      const { slide } = await res.json();
      setSlides((prev) =>
        prev.map((s) =>
          s.slideNumber === activeSlide.slideNumber
            ? { ...s, scriptText: slide.scriptText, audioUrl: slide.audioUrl }
            : s
        )
      );
      setEditMode(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [activeSlide, editText, id]);

  // ── Generate audio for slides without it ─────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!activeSlide || !id) return;
    setGenerating(true);
    setSaveError(null);
    try {
      const res = await fetch(
        `/api/deck/${id}/slide/${activeSlide.slideNumber}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Generation failed.");
      }
      const { slide } = await res.json();
      setSlides((prev) =>
        prev.map((s) =>
          s.slideNumber === activeSlide.slideNumber
            ? { ...s, scriptText: slide.scriptText, audioUrl: slide.audioUrl }
            : s
        )
      );
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }, [activeSlide, id]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const slidesWithAudio = slides.filter((s) => !!s.audioUrl).length;

  // ── Render: loading ───────────────────────────────────────────────────────

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
          asChild
          className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // ── Render: main ──────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* ── Top header bar ─────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="shrink-0 text-zinc-400 hover:text-white"
          >
            <Link href={`/deck/${id}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Deck
            </Link>
          </Button>
          <span className="hidden h-4 w-px bg-zinc-700 sm:block" />
          <p className="min-w-0 truncate text-sm font-medium text-zinc-200">
            {deck.filename}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-3">
          <Badge className="border-zinc-700 bg-zinc-800 text-zinc-400 text-xs">
            {slides.length} slide{slides.length !== 1 ? "s" : ""}
          </Badge>
          {slidesWithAudio > 0 && (
            <Badge className="border-emerald-800 bg-emerald-900/40 text-emerald-400 text-xs">
              {slidesWithAudio} ready
            </Badge>
          )}
        </div>
      </div>

      {/* ── Body: split layout ─────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">

        {/* ── Left / Top — slide list ─────────────────────────────────── */}
        <div
          className={cn(
            "shrink-0 border-zinc-800 bg-zinc-950",
            // Mobile: horizontal scroll strip at the top
            "flex h-[88px] flex-row overflow-x-auto border-b md:hidden",
            // Desktop: vertical panel 40%
            "md:flex md:h-full md:w-[38%] md:flex-col md:overflow-hidden md:border-b-0 md:border-r"
          )}
        >
          {/* Desktop: scroll area wrapper */}
          <ScrollArea className="hidden md:flex md:flex-1 md:flex-col">
            <div className="divide-y divide-zinc-800/60">
              {slides.map((slide, index) => (
                <SlideListItem
                  key={slide.id}
                  slide={slide}
                  isActive={index === activeIndex}
                  isPlaying={index === activeIndex && isPlaying}
                  onClick={() => handleSlideSelect(index)}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Mobile: horizontal chips */}
          <div className="flex items-center gap-2 px-3 py-3 md:hidden">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => handleSlideSelect(index)}
                className={cn(
                  "flex h-16 w-24 shrink-0 flex-col items-start justify-between rounded-lg border px-2.5 py-2 text-left transition-colors",
                  index === activeIndex
                    ? "border-white/20 bg-white/8 text-white"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[10px] font-semibold">{slide.slideNumber}</span>
                  {index === activeIndex && isPlaying ? (
                    <Pause className="h-2.5 w-2.5 fill-current text-emerald-400" />
                  ) : slide.audioUrl ? (
                    <Play className="h-2.5 w-2.5 fill-current text-zinc-500" />
                  ) : null}
                </div>
                <p className="line-clamp-2 w-full text-[10px] leading-tight">
                  {slide.scriptText?.slice(0, 50) ?? "No script"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right / Bottom — active slide detail ───────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col bg-zinc-900">
          {activeSlide ? (
            <>
              {/* Slide content area */}
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 sm:p-6">
                {/* Slide number badge */}
                <div className="flex items-center gap-2">
                  <Badge className="border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                    Slide {activeSlide.slideNumber}
                  </Badge>
                  {activeSlide.audioUrl ? (
                    <Badge className="border-emerald-800/60 bg-emerald-900/30 text-emerald-400 text-xs">
                      Audio ready
                    </Badge>
                  ) : (
                    <Badge className="border-zinc-700/60 bg-zinc-800/50 text-zinc-500 text-xs">
                      No audio
                    </Badge>
                  )}
                </div>

                {/* Script / edit area */}
                <Card className="border-zinc-800 bg-zinc-800/40">
                  <CardContent className="p-4">
                    {editMode ? (
                      <div className="flex flex-col gap-3">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-[160px] resize-none border-zinc-700 bg-zinc-900 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
                          placeholder="Enter narration script…"
                          disabled={saving}
                        />
                        {saveError && (
                          <p className="text-xs text-red-400">{saveError}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || !editText.trim()}
                            className="bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
                          >
                            {saving ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {saving ? "Saving…" : "Save & Regenerate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="text-zinc-400 hover:text-white"
                          >
                            <X className="mr-1.5 h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        {activeSlide.scriptText ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                            {activeSlide.scriptText}
                          </p>
                        ) : (
                          <p className="text-sm italic text-zinc-600">
                            No script for this slide.
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={enterEditMode}
                          className="absolute right-0 top-0 h-7 px-2 text-xs text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
                        >
                          <Edit3 className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* No audio state */}
                {!activeSlide.audioUrl && !editMode && (
                  <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 px-4 py-5 text-center">
                    <p className="mb-3 text-sm text-zinc-500">
                      No audio generated for this slide yet.
                    </p>
                    {saveError && (
                      <p className="mb-2 text-xs text-red-400">{saveError}</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerate}
                      disabled={generating}
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white disabled:opacity-50"
                    >
                      {generating ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                      )}
                      {generating ? "Generating…" : "Generate Audio"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Player controls — pinned to bottom */}
              <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-5 py-4 sm:px-6">
                <SlidePlayer
                  audioUrl={activeSlide.audioUrl}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                  currentTime={currentTime}
                  duration={duration}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  hasPrevious={activeIndex > 0}
                  hasNext={activeIndex < slides.length - 1}
                  autoPlay={autoPlay}
                  onAutoPlayToggle={handleAutoPlayToggle}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-zinc-600">No slides found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide list item (desktop sidebar)
// ---------------------------------------------------------------------------

interface SlideListItemProps {
  slide: Slide;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
}

function SlideListItem({
  slide,
  isActive,
  isPlaying,
  onClick,
}: SlideListItemProps) {
  const firstLine = slide.scriptText
    ? slide.scriptText.split("\n")[0].trim()
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full border-l-2 px-4 py-3.5 text-left transition-colors",
        isActive
          ? "border-l-primary bg-white/5 text-white"
          : "border-l-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Number */}
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            isActive
              ? "bg-white text-zinc-900"
              : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700"
          )}
        >
          {slide.slideNumber}
        </div>

        {/* Script preview */}
        <div className="min-w-0 flex-1 pt-0.5">
          {firstLine ? (
            <p className="line-clamp-2 text-xs leading-snug">{firstLine}</p>
          ) : (
            <p className="text-xs italic text-zinc-600">No script</p>
          )}
        </div>

        {/* Status icon */}
        <div className="shrink-0 pt-0.5">
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-current text-emerald-400" />
          ) : isActive ? (
            <Play className="h-3.5 w-3.5 fill-current text-zinc-400" />
          ) : slide.audioUrl ? (
            <Play className="h-3.5 w-3.5 fill-current text-zinc-600 opacity-0 group-hover:opacity-100" />
          ) : (
            <span className="block h-1.5 w-1.5 rounded-full bg-zinc-700" />
          )}
        </div>
      </div>
    </button>
  );
}
