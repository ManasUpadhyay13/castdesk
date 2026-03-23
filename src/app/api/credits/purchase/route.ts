import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createCheckoutSession, getPackById } from "@/lib/payments";
import type { CreditPackId } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { packId } = await req.json();

    if (!packId || !getPackById(packId)) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const checkoutUrl = await createCheckoutSession({
      packId: packId as CreditPackId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 }
    );
  }
}
