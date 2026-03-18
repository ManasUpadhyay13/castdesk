import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractSlideContent(imageBase64: string, slideNumber: number): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert at analyzing pitch deck slides. Extract ALL text content, describe any charts/graphs/images, and capture the key message of the slide. Be thorough but concise. Format as structured text that can be narrated.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `This is slide ${slideNumber} of a startup pitch deck. Extract all content from this slide including text, data from charts, and describe any visuals. Structure the output so it can be converted into a narration script.`,
          },
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${imageBase64}` },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateNarrationScript(slideContent: string, slideNumber: number, totalSlides: number): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a professional pitch coach helping a startup founder narrate their pitch deck. Write a natural, conversational narration script for the given slide content. The script should:
- Sound like a confident founder presenting to investors
- Be 30-60 seconds when spoken (roughly 75-150 words)
- Flow naturally from the previous slide context
- Highlight key numbers and claims
- NOT start with "Welcome" or "Hello" unless it's slide 1
- NOT say "this slide shows" or reference the slide itself
- Speak as if you ARE the founder presenting`,
      },
      {
        role: "user",
        content: `Slide ${slideNumber} of ${totalSlides}:\n\n${slideContent}\n\nWrite the narration script for this slide.`,
      },
    ],
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateInvestorResponse(
  systemPrompt: string,
  deckContext: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  founderMessage: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `${systemPrompt}\n\n--- FOUNDER'S PITCH DECK CONTENT ---\n${deckContext}\n--- END OF DECK ---`,
      },
      ...conversationHistory,
      { role: "user", content: founderMessage },
    ],
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateDebriefReport(
  transcript: { speaker: string; text: string }[],
  deckContext: string,
  personaName: string
): Promise<{
  overallScore: number;
  weakSlides: string[];
  strongMoments: string[];
  suggestions: string[];
}> {
  const transcriptText = transcript
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert pitch coach analyzing a practice session between a founder and an AI investor persona (${personaName}). Analyze the transcript and the founder's pitch deck to provide actionable feedback.

Return a JSON object with exactly this structure:
{
  "overallScore": <number 1-100>,
  "weakSlides": [<array of specific weak areas identified>],
  "strongMoments": [<array of moments where the founder did well>],
  "suggestions": [<array of specific, actionable improvement suggestions>]
}

Be specific — reference actual content from the conversation. Score fairly: 70+ means investor-ready, 50-69 needs work, below 50 needs significant preparation.`,
      },
      {
        role: "user",
        content: `DECK CONTENT:\n${deckContext}\n\nSESSION TRANSCRIPT:\n${transcriptText}\n\nGenerate the debrief report as JSON.`,
      },
    ],
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0]?.message?.content || "{}");
  return {
    overallScore: result.overallScore || 50,
    weakSlides: result.weakSlides || [],
    strongMoments: result.strongMoments || [],
    suggestions: result.suggestions || [],
  };
}
