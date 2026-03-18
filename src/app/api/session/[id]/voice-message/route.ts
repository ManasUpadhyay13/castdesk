import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getPersonaById } from "@/lib/personas";
import { generateInvestorResponse } from "@/lib/ai";
import { transcribeAudio } from "@/lib/whisper";
import { generateTTSSpeech } from "@/lib/tts";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const user = await requireAuth();

    // Get the audio from form data
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    if (!audioFile) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    // Load session with turns and deck
    const session = await db.session.findFirst({
      where: { id, userId: user.id, status: "ACTIVE" },
      include: {
        deck: {
          include: { slides: { orderBy: { slideNumber: "asc" } } },
        },
        turns: { orderBy: { turnNumber: "asc" } },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const persona = getPersonaById(session.personaId);
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 500 });
    }

    // Step 1: Transcribe audio with Whisper
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const transcription = await transcribeAudio(audioBuffer, audioFile.type || "audio/webm");

    if (!transcription.trim()) {
      return NextResponse.json({ error: "Could not transcribe audio. Please try again." }, { status: 400 });
    }

    // Step 2: Build context and generate investor response
    const deckContext = session.deck.slides
      .map((s) => `Slide ${s.slideNumber}: ${s.rawText}`)
      .join("\n\n");

    const history = session.turns.map((t) => ({
      role: (t.speaker === "INVESTOR" ? "assistant" : "user") as "user" | "assistant",
      content: t.text,
    }));

    const investorResponse = await generateInvestorResponse(
      persona.systemPrompt,
      deckContext,
      history,
      transcription.trim()
    );

    // Step 3: Generate investor voice audio
    let investorAudioUrl: string | null = null;
    try {
      investorAudioUrl = await generateTTSSpeech(investorResponse);
    } catch (audioError) {
      console.error("Investor TTS failed:", audioError);
      // Continue without audio — text response still works
    }

    // Step 4: Save both turns to DB
    const founderTurnNumber = session.turns.length + 1;
    const investorTurnNumber = founderTurnNumber + 1;

    await db.turn.create({
      data: {
        sessionId: id,
        turnNumber: founderTurnNumber,
        speaker: "FOUNDER",
        text: transcription.trim(),
      },
    });

    await db.turn.create({
      data: {
        sessionId: id,
        turnNumber: investorTurnNumber,
        speaker: "INVESTOR",
        text: investorResponse,
        audioUrl: investorAudioUrl,
      },
    });

    return NextResponse.json({
      transcription: transcription.trim(),
      founderTurn: { turnNumber: founderTurnNumber, speaker: "FOUNDER", text: transcription.trim() },
      investorTurn: {
        turnNumber: investorTurnNumber,
        speaker: "INVESTOR",
        text: investorResponse,
        audioUrl: investorAudioUrl,
      },
    });
  } catch (error) {
    console.error("Voice message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
