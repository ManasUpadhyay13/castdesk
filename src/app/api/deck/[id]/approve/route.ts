import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const deck = await db.deck.findFirst({
      where: { id, userId: user.id },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Deck is already approved" },
        { status: 400 }
      );
    }

    const updated = await db.deck.update({
      where: { id },
      data: { status: "READY" },
    });

    return NextResponse.json({ deck: updated });
  } catch (error) {
    console.error("Deck approve error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
