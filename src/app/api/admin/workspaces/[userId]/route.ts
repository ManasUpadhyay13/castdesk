import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { creditsBalance, isAdmin, isBlocked, name } = body;

    const user = await db.user.findUnique({ where: { id: params.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentConfig = (user.config as Record<string, unknown>) ?? {};
    const updatedConfig = { ...currentConfig };

    if (typeof isAdmin === "boolean") updatedConfig.isAdmin = isAdmin;
    if (typeof isBlocked === "boolean") updatedConfig.isBlocked = isBlocked;

    const updateData: Record<string, unknown> = { config: updatedConfig };
    if (typeof creditsBalance === "number") updateData.creditsBalance = creditsBalance;
    if (typeof name === "string") updateData.name = name;

    const updated = await db.user.update({
      where: { id: params.userId },
      data: updateData,
    });

    return NextResponse.json({ user: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin();

    const user = await db.user.findUnique({ where: { id: params.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cascade delete handles decks, slides, sessions, turns, reports, transactions
    await db.user.delete({ where: { id: params.userId } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
