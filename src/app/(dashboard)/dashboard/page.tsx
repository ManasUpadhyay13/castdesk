"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, ChevronRight, Loader2 } from "lucide-react";

type DeckStatus = "PROCESSING" | "READY" | "FAILED";

interface Deck {
  id: string;
  filename: string;
  totalSlides: number;
  status: DeckStatus;
  createdAt: string;
}

function statusVariant(
  status: DeckStatus
): "default" | "secondary" | "destructive" {
  if (status === "READY") return "default";
  if (status === "FAILED") return "destructive";
  return "secondary";
}

function statusLabel(status: DeckStatus): string {
  if (status === "READY") return "Ready";
  if (status === "FAILED") return "Failed";
  return "Processing";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  // Upload dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    try {
      const res = await fetch("/api/deck");
      if (res.ok) {
        const data = await res.json();
        setDecks(data.decks ?? []);
      }
    } catch {
      // silently fail — empty state will show
    } finally {
      setLoadingDecks(false);
    }
  }, []);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadError(null);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setUploadProgress(30);

      const res = await fetch("/api/deck/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed. Please try again.");
      }

      const data = await res.json();
      setUploadProgress(100);

      setDialogOpen(false);
      const deckId = data.deck?.id ?? data.id;
      router.push(`/deck/${deckId}/voice`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }

  function openDialog() {
    setSelectedFile(null);
    setUploadError(null);
    setUploadProgress(0);
    setDialogOpen(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Your Decks</h1>
        <Button
          onClick={openDialog}
          className="flex items-center gap-2 bg-white text-zinc-900 hover:bg-zinc-200"
        >
          <Upload className="h-4 w-4" />
          Upload Deck
        </Button>
      </div>

      {/* Deck grid / empty state */}
      {loadingDecks ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 py-24 text-center">
          <FileText className="mb-4 h-12 w-12 text-zinc-600" />
          <p className="text-lg font-medium text-zinc-300">No decks yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Upload your first pitch deck to get started.
          </p>
          <Button
            onClick={openDialog}
            variant="outline"
            className="mt-6 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Deck
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Card
              key={deck.id}
              onClick={() => router.push(`/deck/${deck.id}`)}
              className="group cursor-pointer border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-600 hover:bg-zinc-800/70"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 shrink-0 text-zinc-400" />
                    <p className="truncate text-sm font-medium text-white">
                      {deck.filename}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500">
                      {deck.totalSlides} slide{deck.totalSlides !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {formatDate(deck.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={statusVariant(deck.status)}
                    className={
                      deck.status === "READY"
                        ? "bg-emerald-900/60 text-emerald-400 border-emerald-800"
                        : deck.status === "FAILED"
                        ? "bg-red-900/60 text-red-400 border-red-800"
                        : "bg-yellow-900/60 text-yellow-400 border-yellow-800"
                    }
                  >
                    {statusLabel(deck.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Pitch Deck</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                PDF File
              </label>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="border-zinc-700 bg-zinc-800 text-zinc-200 file:mr-3 file:rounded file:border-0 file:bg-zinc-700 file:px-3 file:py-1 file:text-sm file:text-zinc-200 hover:file:bg-zinc-600"
              />
              {selectedFile && (
                <p className="text-xs text-zinc-500">
                  {selectedFile.name} &mdash;{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>

            {uploading && (
              <div className="space-y-1.5">
                <Progress value={uploadProgress} className="h-1.5 bg-zinc-800" />
                <p className="text-xs text-zinc-500">Uploading…</p>
              </div>
            )}

            {uploadError && (
              <p className="text-sm text-red-400">{uploadError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              disabled={uploading}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
