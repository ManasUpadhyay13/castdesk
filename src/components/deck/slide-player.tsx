"use client";

import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlidePlayerProps {
  audioUrl: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  currentTime: number;
  duration: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  autoPlay: boolean;
  onAutoPlayToggle: () => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SlidePlayer({
  audioUrl,
  isPlaying,
  onPlayPause,
  onSeek,
  currentTime,
  duration,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  autoPlay,
  onAutoPlayToggle,
}: SlidePlayerProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const progressPercent =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || duration <= 0) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const handleProgressKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (duration <= 0) return;
      const step = 5;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onSeek(Math.min(duration, currentTime + step));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onSeek(Math.max(0, currentTime - step));
      }
    },
    [duration, currentTime, onSeek]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-500">
          {formatTime(currentTime)}
        </span>

        {/* Track */}
        <div
          ref={progressBarRef}
          role="slider"
          aria-label="Playback position"
          aria-valuemin={0}
          aria-valuemax={duration || 0}
          aria-valuenow={currentTime}
          tabIndex={audioUrl ? 0 : -1}
          className={cn(
            "relative h-2 flex-1 cursor-pointer rounded-full bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            !audioUrl && "pointer-events-none opacity-40"
          )}
          onClick={handleProgressClick}
          onKeyDown={handleProgressKeyDown}
        >
          {/* Filled */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow transition-[left] duration-100"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />
        </div>

        <span className="w-10 shrink-0 text-xs tabular-nums text-zinc-500">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Left — auto-play toggle */}
        <button
          type="button"
          onClick={onAutoPlayToggle}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            autoPlay
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          )}
          title={autoPlay ? "Auto-play on" : "Auto-play off"}
        >
          <Volume2 className="h-3.5 w-3.5" />
          <span>Auto-play</span>
          <span
            className={cn(
              "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              autoPlay ? "bg-white text-zinc-900" : "bg-zinc-700 text-zinc-400"
            )}
          >
            {autoPlay ? "ON" : "OFF"}
          </span>
        </button>

        {/* Center — playback controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasPrevious}
            onClick={onPrevious}
            className="h-9 w-9 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Previous slide"
          >
            <SkipBack className="h-4 w-4 fill-current" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!audioUrl}
            onClick={onPlayPause}
            className={cn(
              "h-12 w-12 rounded-full border transition-colors disabled:opacity-30",
              audioUrl
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-zinc-700 text-zinc-600"
            )}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!hasNext}
            onClick={onNext}
            className="h-9 w-9 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Next slide"
          >
            <SkipForward className="h-4 w-4 fill-current" />
          </Button>
        </div>

        {/* Right — spacer to balance the auto-play toggle */}
        <div className="w-24" />
      </div>
    </div>
  );
}
