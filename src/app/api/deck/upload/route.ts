import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isUserAdmin } from "@/lib/auth";
import { extractTextFromPdf } from "@/lib/pdf";
import { generateNarrationScript } from "@/lib/ai";
import { generateTTSSpeech, getDefaultVoiceId } from "@/lib/tts";
import { CREDIT_COSTS } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const admin = isUserAdmin(user);

    // Check credits (admins bypass)
    if (!admin && user.creditsBalance < CREDIT_COSTS.DECK_UPLOAD) {
      return NextResponse.json(
        { error: `Insufficient credits. Need ${CREDIT_COSTS.DECK_UPLOAD} credits.` },
        { status: 402 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const filename = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from PDF
    const slideTexts = await extractTextFromPdf(buffer);
    const totalSlides = slideTexts.length;

    if (totalSlides === 0) {
      return NextResponse.json({ error: "Could not extract slides from PDF" }, { status: 400 });
    }

    if (totalSlides > 30) {
      return NextResponse.json({ error: "Maximum 30 slides allowed" }, { status: 400 });
    }

    // Create deck record
    const deck = await db.deck.create({
      data: {
        userId: user.id,
        filename,
        totalSlides,
        status: "PROCESSING",
        voiceType: "DEFAULT",
      },
    });

    // Create slide records
    for (let i = 0; i < slideTexts.length; i++) {
      await db.slide.create({
        data: {
          deckId: deck.id,
          slideNumber: i + 1,
          rawText: slideTexts[i],
        },
      });
    }

    // Deduct credits (admins bypass)
    if (!admin) {
      await db.user.update({
        where: { id: user.id },
        data: { creditsBalance: { decrement: CREDIT_COSTS.DECK_UPLOAD } },
      });

      await db.creditTransaction.create({
        data: {
          userId: user.id,
          actionType: "DECK_UPLOAD",
          creditsUsed: CREDIT_COSTS.DECK_UPLOAD,
          deckId: deck.id,
        },
      });
    }

    // Start background narration generation (non-blocking)
    generateNarrationsForDeck(deck.id).catch(console.error);

    return NextResponse.json({
      deck: {
        id: deck.id,
        filename: deck.filename,
        totalSlides: deck.totalSlides,
        status: deck.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Deck upload error:", error);
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
      const script = await generateNarrationScript(
        slide.rawText,
        slide.slideNumber,
        deck.totalSlides
      );

      // Generate audio from the script
      let audioUrl: string | null = null;
      try {
        audioUrl = await generateTTSSpeech(script, voiceId);
      } catch (audioError) {
        console.error(`Audio generation failed for slide ${slide.slideNumber}:`, audioError);
        // Continue without audio — script is still saved
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
