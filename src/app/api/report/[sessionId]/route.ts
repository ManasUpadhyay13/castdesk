import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  try {
    const user = await requireAuth();

    const session = await db.session.findFirst({
      where: { id: sessionId, userId: user.id },
      include: {
        turns: { orderBy: { turnNumber: "asc" } },
        report: true,
        deck: { select: { id: true, filename: true } },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session: {
        id: session.id,
        deckId: session.deckId,
        personaId: session.personaId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        deckFilename: session.deck.filename,
      },
      turns: session.turns.map((t) => ({
        turnNumber: t.turnNumber,
        speaker: t.speaker,
        text: t.text,
        createdAt: t.createdAt,
      })),
      report: session.report,
    });
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
