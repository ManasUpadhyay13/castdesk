import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireAuth();

  const deck = await db.deck.findFirst({
    where: { id: id, userId: user.id },
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
