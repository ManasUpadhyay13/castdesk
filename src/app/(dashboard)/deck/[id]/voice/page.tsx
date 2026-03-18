"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Volume2,
  Play,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VoiceType = "DEFAULT" | "PRESET" | null;

interface PresetVoice {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  style: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchPreviewUrl(voiceId?: string): Promise<string> {
  const body = voiceId ? { voiceId } : {};
  const res = await fetch("/api/voice/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Preview failed.");
  }
  const data = await res.json();
  return data.audioUrl as string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PreviewButton({
  voiceId,
  label = "Preview",
}: {
  voiceId?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handlePreview = useCallback(async () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
      return;
    }
    setLoading(true);
    try {
      const url = await fetchPreviewUrl(voiceId);
      setAudioUrl(url);
      new Audio(url).play();
    } catch {
      // silently fail — could add a toast here
    } finally {
      setLoading(false);
    }
  }, [audioUrl, voiceId]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePreview}
      disabled={loading}
      className="h-8 gap-1.5 px-2 text-zinc-400 hover:text-white"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Play className="h-3.5 w-3.5 fill-current" />
      )}
      {label}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Voice type selection
  const [selectedType, setSelectedType] = useState<VoiceType>(null);

  // Preset voices state
  const [presets, setPresets] = useState<PresetVoice[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [presetsError, setPresetsError] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Confirm state
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Deck name — read from localStorage or fall back to a placeholder
  // (avoids an extra fetch; the deck page sets this)
  const deckName = "Deck";

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleSelectType = useCallback(
    async (type: "DEFAULT" | "PRESET") => {
      setSelectedType(type);
      setConfirmError(null);
      setSelectedPresetId(null);

      if (type === "PRESET" && presets.length === 0) {
        setPresetsLoading(true);
        setPresetsError(null);
        try {
          const res = await fetch("/api/voice/presets");
          if (!res.ok) throw new Error("Failed to load preset voices.");
          const data = await res.json();
          setPresets(data.voices ?? data);
        } catch (err) {
          setPresetsError(
            err instanceof Error ? err.message : "Failed to load presets."
          );
        } finally {
          setPresetsLoading(false);
        }
      }
    },
    [presets.length]
  );

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    setConfirmError(null);
    try {
      const body =
        selectedType === "DEFAULT"
          ? { voiceType: "DEFAULT" }
          : { voiceType: "PRESET", voiceId: selectedPresetId };

      const res = await fetch(`/api/deck/${id}/set-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to set voice.");
      }

      router.push(`/deck/${id}`);
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setConfirming(false);
    }
  }, [id, router, selectedType, selectedPresetId]);

  // ------------------------------------------------------------------
  // Derived
  // ------------------------------------------------------------------

  const canConfirm =
    selectedType === "DEFAULT" ||
    (selectedType === "PRESET" && selectedPresetId !== null);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500">
        <button
          onClick={() => router.push("/dashboard")}
          className="transition-colors hover:text-zinc-300"
        >
          Dashboard
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <button
          onClick={() => router.push(`/deck/${id}`)}
          className="max-w-[160px] truncate transition-colors hover:text-zinc-300"
        >
          {deckName}
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-300">Choose Voice</span>
      </div>

      {/* Back button + title */}
      <div className="mb-8 flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white"
        >
          <Link href={`/deck/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white">Choose Voice</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Select how your slides will be narrated.
          </p>
        </div>
      </div>

      {/* Voice type cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Default Voice */}
        <VoiceTypeCard
          icon={<Volume2 className="h-5 w-5" />}
          title="Default Voice"
          description="Use our standard AI voice. Clean and professional."
          selected={selectedType === "DEFAULT"}
          onSelect={() => handleSelectType("DEFAULT")}
        />

        {/* Preset Voices */}
        <VoiceTypeCard
          icon={<Mic className="h-5 w-5" />}
          title="Preset Voices"
          description="Choose from 6 curated voices. Preview before selecting."
          selected={selectedType === "PRESET"}
          onSelect={() => handleSelectType("PRESET")}
        />

        {/* Clone Your Voice — disabled */}
        <VoiceTypeCard
          icon={<Mic className="h-5 w-5" />}
          title="Clone Your Voice"
          description="Record 30 seconds to clone your voice."
          disabled
          badge="Coming Soon"
          badgeIcon={<Lock className="h-2.5 w-2.5" />}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Detail panel — Default Voice                                      */}
      {/* ---------------------------------------------------------------- */}
      {selectedType === "DEFAULT" && (
        <div className="mt-8">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardContent className="flex items-center justify-between py-5 px-5">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Standard AI Voice
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Neutral, clear, and professional. Works great for all content.
                </p>
              </div>
              <PreviewButton label="Preview" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Detail panel — Preset Voices                                      */}
      {/* ---------------------------------------------------------------- */}
      {selectedType === "PRESET" && (
        <div className="mt-8">
          {presetsLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          )}

          {presetsError && (
            <p className="py-4 text-center text-sm text-red-400">
              {presetsError}
            </p>
          )}

          {!presetsLoading && !presetsError && presets.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {presets.map((voice) => (
                <PresetVoiceCard
                  key={voice.id}
                  voice={voice}
                  selected={selectedPresetId === voice.id}
                  onSelect={() => setSelectedPresetId(voice.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Confirm / error                                                   */}
      {/* ---------------------------------------------------------------- */}
      {selectedType !== null && (
        <div className="mt-8 flex flex-col items-end gap-3">
          {confirmError && (
            <p className="w-full text-sm text-red-400">{confirmError}</p>
          )}
          <Button
            disabled={!canConfirm || confirming}
            onClick={handleConfirm}
            className="min-w-[140px] bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40"
          >
            {confirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirm Voice
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VoiceTypeCard
// ---------------------------------------------------------------------------

interface VoiceTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  badge?: string;
  badgeIcon?: React.ReactNode;
}

function VoiceTypeCard({
  icon,
  title,
  description,
  selected = false,
  disabled = false,
  onSelect,
  badge,
  badgeIcon,
}: VoiceTypeCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={[
        "group relative flex flex-col gap-3 rounded-xl border p-5 text-left transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        disabled
          ? "cursor-not-allowed opacity-40 border-zinc-800 bg-zinc-900/40"
          : selected
          ? "border-white/60 bg-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_16px_rgba(255,255,255,0.06)]"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70",
      ].join(" ")}
    >
      {/* Badge */}
      {badge && (
        <Badge
          variant="outline"
          className="absolute right-3 top-3 flex items-center gap-1 border-zinc-700 bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400"
        >
          {badgeIcon}
          {badge}
        </Badge>
      )}

      {/* Selected indicator */}
      {selected && !disabled && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white">
          <Check className="h-3 w-3 text-zinc-900" />
        </span>
      )}

      {/* Icon */}
      <span
        className={[
          "flex h-9 w-9 items-center justify-center rounded-lg",
          selected
            ? "bg-white text-zinc-900"
            : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200",
          disabled ? "bg-zinc-800 text-zinc-600" : "",
        ].join(" ")}
      >
        {icon}
      </span>

      {/* Text */}
      <div>
        <p
          className={[
            "text-sm font-semibold",
            selected ? "text-white" : "text-zinc-200",
          ].join(" ")}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PresetVoiceCard
// ---------------------------------------------------------------------------

interface PresetVoiceCardProps {
  voice: PresetVoice;
  selected: boolean;
  onSelect: () => void;
}

function PresetVoiceCard({ voice, selected, onSelect }: PresetVoiceCardProps) {
  const genderColor =
    voice.gender === "male"
      ? "border-blue-800/60 bg-blue-900/30 text-blue-300"
      : voice.gender === "female"
      ? "border-pink-800/60 bg-pink-900/30 text-pink-300"
      : "border-zinc-700 bg-zinc-800/50 text-zinc-400";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        selected
          ? "border-white/60 bg-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_14px_rgba(255,255,255,0.05)]"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-zinc-200">
            {voice.name}
          </span>
          <Badge
            variant="outline"
            className={`shrink-0 px-1.5 py-0 text-[10px] font-medium ${genderColor}`}
          >
            {voice.gender}
          </Badge>
        </div>
        <p className="truncate text-xs text-zinc-500">{voice.style}</p>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        {/* Stop propagation so clicking preview doesn't also select */}
        <span onClick={(e) => e.stopPropagation()}>
          <PreviewButton voiceId={voice.id} />
        </span>

        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
            <Check className="h-3 w-3 text-zinc-900" />
          </span>
        )}
      </div>
    </button>
  );
}
