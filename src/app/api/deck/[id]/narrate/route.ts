import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateNarrationScript } from "@/lib/ai";
import { generateTTSSpeech, getDefaultVoiceId } from "@/lib/tts";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const user = await requireAuth();

    const deck = await db.deck.findFirst({
      where: { id, userId: user.id },
      include: { slides: { orderBy: { slideNumber: "asc" } } },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.status === "PROCESSING") {
      return NextResponse.json({ error: "Narration already in progress" }, { status: 409 });
    }

    // Set status to PROCESSING
    await db.deck.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    // Start background narration (non-blocking)
    generateNarrationsForDeck(id).catch(console.error);

    return NextResponse.json({ success: true, status: "PROCESSING" });
  } catch (error) {
    console.error("Narrate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateNarrationsForDeck(deckId: string) {
  const deck = await db.deck.findUnique({
    where: { id: deckId },
    include: { slides: { orderBy: { slideNumber: "asc" } } },
  });

  if (!deck) return;

  const voiceId = deck.elevenlabsVoiceId || await getDefaultVoiceId();

  try {
    for (const slide of deck.slides) {
      // Generate script if not already present
      let script = slide.scriptText;
      if (!script) {
        script = await generateNarrationScript(
          slide.rawText,
          slide.slideNumber,
          deck.totalSlides
        );
      }

      // Generate audio
      let audioUrl: string | null = slide.audioUrl;
      try {
        audioUrl = await generateTTSSpeech(script, voiceId);
      } catch (audioError) {
        console.error(`Audio generation failed for slide ${slide.slideNumber}:`, audioError);
      }

      await db.slide.update({
        where: { id: slide.id },
        data: { scriptText: script, ...(audioUrl && { audioUrl }) },
      });
    }

    await db.deck.update({
      where: { id: deckId },
      data: { status: "READY" },
    });
  } catch (error) {
    console.error(`Narration generation failed for deck ${deckId}:`, error);
    await db.deck.update({
      where: { id: deckId },
      data: { status: "FAILED" },
    });
  }
}
