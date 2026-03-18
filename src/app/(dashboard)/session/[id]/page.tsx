"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Send,
  Loader2,
  Clock,
  X,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Turn {
  turnNumber: number;
  speaker: "INVESTOR" | "FOUNDER";
  text: string;
  createdAt?: string;
}

interface SessionData {
  id: string;
  personaId: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  startedAt: string;
  endedAt: string | null;
  deckFilename: string;
}

// ---------------------------------------------------------------------------
// Persona display name map
// ---------------------------------------------------------------------------

const PERSONA_NAMES: Record<string, { name: string; initials: string }> = {
  "marcus-reid": { name: "Marcus Reid", initials: "MR" },
  "victoria-cross": { name: "Victoria Cross", initials: "VC" },
  "james-whitfield": { name: "James Whitfield", initials: "JW" },
  "sandra-blake": { name: "Sandra Blake", initials: "SB" },
  "oliver-strauss": { name: "Oliver Strauss", initials: "OS" },
  "rachel-monroe": { name: "Rachel Monroe", initials: "RM" },
  "daniel-park": { name: "Daniel Park", initials: "DP" },
  "sophia-laurent": { name: "Sophia Laurent", initials: "SL" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatElapsed(startedAt: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

// ---------------------------------------------------------------------------
// TypingIndicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-zinc-300">
        AI
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

// ---------------------------------------------------------------------------
// ChatMessage
// ---------------------------------------------------------------------------

interface ChatMessageProps {
  turn: Turn;
  personaInitials: string;
}

function ChatMessage({ turn, personaInitials }: ChatMessageProps) {
  const isInvestor = turn.speaker === "INVESTOR";

  if (isInvestor) {
    return (
      <div className="flex items-end gap-3 px-4 py-2">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-zinc-300">
          {personaInitials}
        </div>
        {/* Bubble */}
        <div className="max-w-[75%]">
          <div className="rounded-2xl rounded-bl-sm border border-zinc-700 bg-zinc-800 px-4 py-3">
            <p className="text-sm leading-relaxed text-zinc-100">{turn.text}</p>
          </div>
          <p className="mt-1 text-[10px] text-zinc-600 ml-1">Investor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-end gap-3 px-4 py-2">
      <div className="max-w-[75%]">
        <div className="rounded-2xl rounded-br-sm border border-primary/20 bg-primary/10 px-4 py-3">
          <p className="text-sm leading-relaxed text-zinc-100">{turn.text}</p>
        </div>
        <p className="mt-1 text-right text-[10px] text-zinc-600 mr-1">You</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [ending, setEnding] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);

  const [elapsed, setElapsed] = useState("0s");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ---------------------------------------------------------------------------
  // Load session data
  // ---------------------------------------------------------------------------

  const fetchSession = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/report/${id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Session not found");
      }
      const data = await res.json();
      setSession(data.session);
      setTurns(data.turns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // ---------------------------------------------------------------------------
  // Timer
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!session?.startedAt) return;
    setElapsed(formatElapsed(session.startedAt));
    const interval = setInterval(() => {
      setElapsed(formatElapsed(session.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.startedAt]);

  // ---------------------------------------------------------------------------
  // Auto-scroll to bottom
  // ---------------------------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, sending]);

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------

  async function handleSend() {
    const text = message.trim();
    if (!text || sending) return;
    setSendError(null);
    setMessage("");
    setSending(true);

    try {
      const res = await fetch(`/api/session/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send message");

      setTurns((prev) => [
        ...prev,
        data.founderTurn as Turn,
        data.investorTurn as Turn,
      ]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send message");
      // Restore message so user can retry
      setMessage(text);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ---------------------------------------------------------------------------
  // End session
  // ---------------------------------------------------------------------------

  async function handleEndSession() {
    setEnding(true);
    try {
      const res = await fetch(`/api/session/${id}/end`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to end session");
      }
      router.push(`/report/${id}`);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to end session");
      setEnding(false);
      setEndDialogOpen(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const personaKey = session?.personaId ?? "";
  const personaInfo = PERSONA_NAMES[personaKey] ?? {
    name: "Investor",
    initials: "AI",
  };
  const isSessionActive = session?.status === "ACTIVE";

  // ---------------------------------------------------------------------------
  // Render: loading
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4">
        <MessageSquare className="h-10 w-10 text-zinc-600" />
        <p className="text-zinc-400">{error ?? "Session not found"}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: main
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6">
        {/* Persona info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
            {personaInfo.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {personaInfo.name}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {session.deckFilename}
            </p>
          </div>
        </div>

        {/* Timer + status + end button */}
        <div className="flex shrink-0 items-center gap-3 pl-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs tabular-nums text-zinc-500">{elapsed}</span>
          </div>

          {isSessionActive ? (
            <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800/60 text-xs">
              Active
            </Badge>
          ) : (
            <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
              {session.status}
            </Badge>
          )}

          {isSessionActive && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEndDialogOpen(true)}
              disabled={ending}
              className="border-zinc-700 text-zinc-300 hover:border-red-700/60 hover:bg-red-900/20 hover:text-red-400"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              End Session
            </Button>
          )}

          {!isSessionActive && (
            <Button
              size="sm"
              onClick={() => router.push(`/report/${id}`)}
              className="bg-white text-zinc-900 hover:bg-zinc-200"
            >
              View Report
            </Button>
          )}
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 py-4">
        {turns.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-600">Starting conversation…</p>
          </div>
        )}

        {turns.map((turn) => (
          <ChatMessage
            key={turn.turnNumber}
            turn={turn}
            personaInitials={personaInfo.initials}
          />
        ))}

        {/* Typing indicator while waiting for investor response */}
        {sending && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Error banner ──────────────────────────────────────────────── */}
      {sendError && (
        <div className="shrink-0 border-t border-red-800/40 bg-red-900/10 px-4 py-2">
          <p className="text-xs text-red-400">{sendError}</p>
        </div>
      )}

      {/* ── Input area ────────────────────────────────────────────────── */}
      {isSessionActive && (
        <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 py-4 sm:px-6">
          <div className="flex items-end gap-3">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
              disabled={sending || ending}
              rows={2}
              className={cn(
                "flex-1 resize-none border-zinc-700 bg-zinc-900 text-sm text-zinc-100",
                "placeholder:text-zinc-600 focus-visible:ring-zinc-600",
                "min-h-[56px] max-h-[160px]"
              )}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || sending || ending}
              className="h-10 w-10 shrink-0 bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-700">
            Enter to send &middot; Shift+Enter for new line
          </p>
        </div>
      )}

      {/* ── Completed state input area ────────────────────────────────── */}
      {!isSessionActive && (
        <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 py-4 text-center sm:px-6">
          <p className="text-sm text-zinc-500">
            This session has ended.{" "}
            <button
              onClick={() => router.push(`/report/${id}`)}
              className="text-white underline underline-offset-2 hover:no-underline"
            >
              View your debrief report
            </button>
          </p>
        </div>
      )}

      {/* ── End session dialog ────────────────────────────────────────── */}
      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">End Session</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to end this roleplay session? Your debrief
              report will be generated automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setEndDialogOpen(false)}
              disabled={ending}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndSession}
              disabled={ending}
              className="bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
            >
              {ending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating report…
                </>
              ) : (
                "End & Get Report"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
