import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getDefaultVoiceId } from "@/lib/tts";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { voiceType, voiceId } = await req.json();

    if (!["PRESET", "DEFAULT"].includes(voiceType)) {
      return NextResponse.json({ error: "Invalid voice type" }, { status: 400 });
    }

    const deck = await db.deck.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const defaultVoice = await getDefaultVoiceId();
    const elevenlabsVoiceId =
      voiceType === "PRESET" && voiceId ? voiceId : defaultVoice;

    await db.deck.update({
      where: { id: params.id },
      data: {
        voiceType: voiceType as "PRESET" | "DEFAULT",
        elevenlabsVoiceId: elevenlabsVoiceId,
      },
    });

    return NextResponse.json({ success: true, voiceType, voiceId: elevenlabsVoiceId });
  } catch (error) {
    console.error("Set voice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
