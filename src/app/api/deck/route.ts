import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decks = await db.deck.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      totalSlides: true,
      status: true,
      voiceType: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ decks });
}
