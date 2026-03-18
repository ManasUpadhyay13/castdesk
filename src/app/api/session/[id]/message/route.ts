import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getPersonaById } from "@/lib/personas";
import { generateInvestorResponse } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const user = await requireAuth();
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const session = await db.session.findFirst({
      where: { id, userId: user.id, status: "ACTIVE" },
      include: {
        deck: {
          include: { slides: { orderBy: { slideNumber: "asc" } } },
        },
        turns: { orderBy: { turnNumber: "asc" } },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Active session not found" },
        { status: 404 }
      );
    }

    const persona = getPersonaById(session.personaId);
    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found" },
        { status: 500 }
      );
    }

    // Build deck context
    const deckContext = session.deck.slides
      .map((s) => `Slide ${s.slideNumber}: ${s.rawText}`)
      .join("\n\n");

    // Build conversation history for GPT
    const history = session.turns.map((t) => ({
      role: (t.speaker === "INVESTOR" ? "assistant" : "user") as
        | "user"
        | "assistant",
      content: t.text,
    }));

    // Save founder's message
    const founderTurnNumber = session.turns.length + 1;
    await db.turn.create({
      data: {
        sessionId: id,
        turnNumber: founderTurnNumber,
        speaker: "FOUNDER",
        text: message.trim(),
      },
    });

    // Generate investor response
    const investorResponse = await generateInvestorResponse(
      persona.systemPrompt,
      deckContext,
      history,
      message.trim()
    );

    // Save investor response
    const investorTurnNumber = founderTurnNumber + 1;
    await db.turn.create({
      data: {
        sessionId: id,
        turnNumber: investorTurnNumber,
        speaker: "INVESTOR",
        text: investorResponse,
      },
    });

    return NextResponse.json({
      founderTurn: {
        turnNumber: founderTurnNumber,
        speaker: "FOUNDER",
        text: message.trim(),
      },
      investorTurn: {
        turnNumber: investorTurnNumber,
        speaker: "INVESTOR",
        text: investorResponse,
      },
    });
  } catch (error) {
    console.error("Session message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
