import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deck = await db.deck.findFirst({
    where: { id: params.id, userId },
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
