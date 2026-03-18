import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateNarrationScript } from "@/lib/ai";

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

    // Set status to PROCESSING
    await db.deck.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    // Generate scripts in background (non-blocking)
    generateScriptsForDeck(id).catch(console.error);

    return NextResponse.json({ success: true, status: "PROCESSING" });
  } catch (error) {
    console.error("Generate scripts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateScriptsForDeck(deckId: string) {
  const deck = await db.deck.findUnique({
    where: { id: deckId },
    include: { slides: { orderBy: { slideNumber: "asc" } } },
  });

  if (!deck) return;

  try {
    for (const slide of deck.slides) {
      if (slide.scriptText) continue; // Skip if already has script

      const script = await generateNarrationScript(
        slide.rawText,
        slide.slideNumber,
        deck.totalSlides
      );

      await db.slide.update({
        where: { id: slide.id },
        data: { scriptText: script },
      });
    }

    await db.deck.update({
      where: { id: deckId },
      data: { status: "READY" },
    });
  } catch (error) {
    console.error(`Script generation failed for deck ${deckId}:`, error);
    await db.deck.update({
      where: { id: deckId },
      data: { status: "FAILED" },
    });
  }
}
