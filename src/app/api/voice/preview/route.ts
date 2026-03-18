import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateTTSPreview, getTTSVoices } from "@/lib/tts";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { voiceId } = await req.json();

    const { voices } = await getTTSVoices();
    const validIds = voices.map((v) => v.id);
    if (voiceId && !validIds.includes(voiceId)) {
      return NextResponse.json({ error: "Invalid voice ID" }, { status: 400 });
    }

    const audioUrl = await generateTTSPreview(voiceId);
    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("Voice preview error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate preview" },
      { status: 500 }
    );
  }
}
