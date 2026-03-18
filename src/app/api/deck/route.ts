import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const user = await requireAuth();

  const decks = await db.deck.findMany({
    where: { userId: user.id },
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
