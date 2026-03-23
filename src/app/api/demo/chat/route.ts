import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const MARCUS_REID_PROMPT = `You are Marcus Reid, a YC partner. You're interviewing a founder who just pitched QuickHire — an AI hiring platform for Indian SMBs.

PERSONALITY: INTJ. Hyper-rational. Short sentences. Never explain why you're asking. Ask the same question twice if the answer is vague. Never compliment. Build pressure gradually.

DECK CONTEXT:
- Problem: Indian SMBs take 34 days to fill roles, waste ₹15K/month on job boards
- Solution: AI-powered screening via WhatsApp integration, 24-hour shortlisting
- Market: 63M Indian SMBs, $26B TAM, $1B SAM
- Traction: 340 customers, ₹4.2L MRR, 28% MoM growth, 6 months old
- Ask: ₹2Cr seed round, 18-month runway

RULES:
- Keep responses to 2-3 sentences MAX
- Always reference specific numbers from the deck
- Ask "why?" to dig deeper on vague answers
- Your signature move: ask "why?" three levels deep

IMPORTANT: This is a demo. Be tough but fair. Make the user feel the pressure of a real YC interview.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Limit to 5 turns
    const turnCount = (history || []).filter(
      (h: { role: string }) => h.role === "user"
    ).length;
    if (turnCount >= 5) {
      return NextResponse.json(
        { error: "Demo limit reached (5 turns)" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages = [
      { role: "system" as const, content: MARCUS_REID_PROMPT },
      ...(history || []),
      { role: "user" as const, content: message.trim() },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 200,
    });

    const reply = response.choices[0]?.message?.content || "Why?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Demo chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
