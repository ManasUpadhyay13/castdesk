import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();

  const deck = await db.deck.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      slides: { orderBy: { slideNumber: "asc" } },
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  return NextResponse.json({
    deck: {
      id: deck.id,
      filename: deck.filename,
      status: deck.status,
      voiceType: deck.voiceType,
    },
    slides: deck.slides.map((s) => ({
      id: s.id,
      slideNumber: s.slideNumber,
      rawText: s.rawText,
      scriptText: s.scriptText,
      audioUrl: s.audioUrl,
    })),
  });
}
