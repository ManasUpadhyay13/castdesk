export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getTTSVoices } from "@/lib/tts";

export async function GET() {
  const { provider, voices } = await getTTSVoices();
  return NextResponse.json({ provider, voices });
}
