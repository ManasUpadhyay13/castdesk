"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Loader2, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  disabled = false,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_DURATION = 120;
  const MIN_DURATION = 1;

  const startRecording = useCallback(async () => {
    if (disabled || isProcessing || isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // Only submit if recording was long enough
        if (duration >= MIN_DURATION || chunksRef.current.length > 0) {
          onRecordingComplete(blob);
        }
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= MAX_DURATION) {
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);

      setPermissionDenied(false);
    } catch (err) {
      console.error("Mic access error:", err);
      setPermissionDenied(true);
    }
  }, [disabled, isProcessing, isRecording, duration, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Spacebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !e.repeat &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        toggleRecording();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isDisabled = disabled || isProcessing;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Waveform bars (visible when recording) */}
      {isRecording && (
        <div className="flex items-center gap-1 h-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-red-500 rounded-full animate-pulse"
              style={{
                height: `${12 + Math.random() * 20}px`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      )}

      {/* Main button */}
      <div className="relative">
        {/* Pulse ring when recording */}
        {isRecording && (
          <div
            className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
            style={{ animationDuration: "1.5s" }}
          />
        )}

        <Button
          type="button"
          onClick={toggleRecording}
          disabled={isDisabled}
          className={[
            "relative size-20 rounded-full transition-all duration-200",
            isRecording
              ? "bg-red-500/20 border-2 border-red-500 text-red-500 hover:bg-red-500/30"
              : isProcessing
              ? "bg-zinc-800 border-2 border-zinc-600 text-zinc-400"
              : "bg-zinc-800 border-2 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white",
            isDisabled && !isProcessing ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {isProcessing ? (
            <Loader2 className="size-8 animate-spin" />
          ) : permissionDenied ? (
            <MicOff className="size-8" />
          ) : (
            <Mic className="size-8" />
          )}
        </Button>
      </div>

      {/* Timer */}
      {isRecording && (
        <span className="text-lg font-mono text-red-400 tabular-nums">
          {formatTime(duration)}
        </span>
      )}

      {/* Label */}
      <span className="text-xs text-zinc-500">
        {permissionDenied
          ? "Microphone access denied"
          : isProcessing
          ? "Analyzing your response..."
          : isRecording
          ? "Recording... Click or press Space to stop"
          : "Click or press Space to speak"}
      </span>
    </div>
  );
}
