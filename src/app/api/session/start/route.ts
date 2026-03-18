import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isUserAdmin } from "@/lib/auth";
import { getPersonaById } from "@/lib/personas";
import { CREDIT_COSTS } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const admin = isUserAdmin(user);
    const { deckId, personaId } = await req.json();

    if (!deckId || !personaId) {
      return NextResponse.json(
        { error: "deckId and personaId are required" },
        { status: 400 }
      );
    }

    const persona = getPersonaById(personaId);
    if (!persona) {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }

    // Verify deck ownership
    const deck = await db.deck.findFirst({
      where: { id: deckId, userId: user.id },
    });
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Check credits (admins bypass)
    if (!admin && user.creditsBalance < CREDIT_COSTS.ROLEPLAY_SESSION) {
      return NextResponse.json(
        {
          error: `Insufficient credits. Need ${CREDIT_COSTS.ROLEPLAY_SESSION} credits.`,
        },
        { status: 402 }
      );
    }

    // Create session
    const session = await db.session.create({
      data: {
        deckId,
        userId: user.id,
        personaId,
        status: "ACTIVE",
      },
    });

    // Deduct credits (admins bypass)
    if (!admin) {
      await db.user.update({
        where: { id: user.id },
        data: { creditsBalance: { decrement: CREDIT_COSTS.ROLEPLAY_SESSION } },
      });
      await db.creditTransaction.create({
        data: {
          userId: user.id,
          actionType: "ROLEPLAY_SESSION",
          creditsUsed: CREDIT_COSTS.ROLEPLAY_SESSION,
          sessionId: session.id,
        },
      });
    }

    // Build deck context from slides
    const slides = await db.slide.findMany({
      where: { deckId },
      orderBy: { slideNumber: "asc" },
    });
    const deckContext = slides
      .map((s) => `Slide ${s.slideNumber}: ${s.rawText}`)
      .join("\n\n");

    const { generateInvestorResponse } = await import("@/lib/ai");
    const openingMessage = await generateInvestorResponse(
      persona.systemPrompt,
      deckContext,
      [],
      "The founder has just finished presenting their deck. Start the Q&A session with your opening question."
    );

    // Save the opening turn
    await db.turn.create({
      data: {
        sessionId: session.id,
        turnNumber: 1,
        speaker: "INVESTOR",
        text: openingMessage,
      },
    });

    return NextResponse.json(
      {
        session: { id: session.id, personaId, status: "ACTIVE" },
        openingMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Session start error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
