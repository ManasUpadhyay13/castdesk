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
      slides: {
        select: { id: true, slideNumber: true, scriptText: true, audioUrl: true },
        orderBy: { slideNumber: "asc" },
      },
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const completedSlides = deck.slides.filter((s) => s.scriptText).length;

  return NextResponse.json({
    id: deck.id,
    status: deck.status,
    totalSlides: deck.totalSlides,
    completedSlides,
    slides: deck.slides,
  });
}
