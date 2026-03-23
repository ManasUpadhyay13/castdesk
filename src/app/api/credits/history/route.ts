import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    const transactions = await db.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        actionType: true,
        creditsUsed: true,
        createdAt: true,
        deck: { select: { filename: true } },
      },
    });

    return NextResponse.json({
      creditsBalance: user.creditsBalance,
      transactions,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
