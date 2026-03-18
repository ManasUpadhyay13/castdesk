import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isUserAdmin } from "@/lib/auth";
import { generateNarrationScript } from "@/lib/ai";
import { generateTTSSpeech, getDefaultVoiceId } from "@/lib/tts";
import { CREDIT_COSTS } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; num: string }> }
) {
  try {
    const { id, num } = await params;
    const user = await requireAuth();
    const admin = isUserAdmin(user);
    const slideNumber = parseInt(num, 10);

    if (isNaN(slideNumber) || slideNumber < 1) {
      return NextResponse.json({ error: "Invalid slide number" }, { status: 400 });
    }

    // Check credits (admins bypass)
    if (!admin && user.creditsBalance < CREDIT_COSTS.SLIDE_REGENERATE) {
      return NextResponse.json(
        { error: `Insufficient credits. Need ${CREDIT_COSTS.SLIDE_REGENERATE} credits.` },
        { status: 402 }
      );
    }

    const deck = await db.deck.findFirst({
      where: { id: id, userId: user.id },
      include: { slides: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const slide = deck.slides.find((s) => s.slideNumber === slideNumber);
    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    // Check if custom script was provided in body
    const body = await req.json().catch(() => ({}));
    let scriptText = body.scriptText;

    // If no custom script provided, regenerate from raw text
    if (!scriptText) {
      scriptText = await generateNarrationScript(
        slide.rawText,
        slide.slideNumber,
        deck.totalSlides
      );
    }

    // Generate audio
    const voiceId = deck.elevenlabsVoiceId || await getDefaultVoiceId();
    const audioUrl = await generateTTSSpeech(scriptText, voiceId);

    // Update slide
    await db.slide.update({
      where: { id: slide.id },
      data: { scriptText, audioUrl },
    });

    // Deduct credits (admins bypass)
    if (!admin) {
      await db.user.update({
        where: { id: user.id },
        data: { creditsBalance: { decrement: CREDIT_COSTS.SLIDE_REGENERATE } },
      });

      await db.creditTransaction.create({
        data: {
          userId: user.id,
          actionType: "SLIDE_REGENERATE",
          creditsUsed: CREDIT_COSTS.SLIDE_REGENERATE,
          deckId: deck.id,
        },
      });
    }

    return NextResponse.json({
      slide: {
        id: slide.id,
        slideNumber: slide.slideNumber,
        scriptText,
        audioUrl,
      },
    });
  } catch (error) {
    console.error("Slide regeneration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
