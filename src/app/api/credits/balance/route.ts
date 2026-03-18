import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const config = (user.config as Record<string, unknown>) ?? {};
    return NextResponse.json({
      creditsBalance: user.creditsBalance,
      isAdmin: config.isAdmin === true,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
