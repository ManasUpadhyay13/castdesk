import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getPersonaById } from "@/lib/personas";
import { generateDebriefReport } from "@/lib/ai";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const user = await requireAuth();

    const session = await db.session.findFirst({
      where: { id, userId: user.id },
      include: {
        deck: {
          include: { slides: { orderBy: { slideNumber: "asc" } } },
        },
        turns: { orderBy: { turnNumber: "asc" } },
        report: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "ACTIVE") {
      // If already completed, return existing report
      const existingReport = await db.report.findUnique({
        where: { sessionId: id },
      });
      return NextResponse.json({ report: existingReport });
    }

    // Mark session as completed
    await db.session.update({
      where: { id },
      data: { status: "COMPLETED", endedAt: new Date() },
    });

    // Build context for report
    const deckContext = session.deck.slides
      .map((s) => `Slide ${s.slideNumber}: ${s.rawText}`)
      .join("\n\n");

    const transcript = session.turns.map((t) => ({
      speaker: t.speaker,
      text: t.text,
    }));

    const persona = getPersonaById(session.personaId);

    // Generate debrief report
    const reportData = await generateDebriefReport(
      transcript,
      deckContext,
      persona?.name ?? "Investor"
    );

    // Save report
    const report = await db.report.create({
      data: {
        sessionId: id,
        overallScore: reportData.overallScore,
        weakSlides: reportData.weakSlides,
        strongMoments: reportData.strongMoments,
        suggestions: reportData.suggestions,
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Session end error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
