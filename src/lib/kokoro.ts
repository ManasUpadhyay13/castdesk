import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const KOKORO_SPACE_URL = "https://hexgrad-kokoro-tts.hf.space";

// Kokoro voice presets — these are the voice IDs available in the Kokoro model
export const KOKORO_VOICES = [
  { id: "af_heart", name: "Heart", gender: "female" as const, style: "Warm and natural" },
  { id: "af_bella", name: "Bella", gender: "female" as const, style: "Clear and professional" },
  { id: "af_nicole", name: "Nicole", gender: "female" as const, style: "Confident and smooth" },
  { id: "af_sarah", name: "Sarah", gender: "female" as const, style: "Friendly and bright" },
  { id: "am_adam", name: "Adam", gender: "male" as const, style: "Deep and authoritative" },
  { id: "am_michael", name: "Michael", gender: "male" as const, style: "Energetic and clear" },
] as const;

export const DEFAULT_KOKORO_VOICE = "af_heart";

/**
 * Generate speech using Kokoro TTS via HF Spaces Gradio API
 * Uses the /call + /result pattern for Gradio endpoints
 */
export async function generateSpeechKokoro(
  text: string,
  voiceId: string = DEFAULT_KOKORO_VOICE,
  speed: number = 1.0
): Promise<string> {
  // Step 1: Submit the job via /call endpoint
  const callResponse = await fetch(`${KOKORO_SPACE_URL}/call/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [text, voiceId, speed],
    }),
  });

  if (!callResponse.ok) {
    const errText = await callResponse.text();
    throw new Error(`Kokoro TTS call failed: ${callResponse.status} - ${errText}`);
  }

  const { event_id } = await callResponse.json();
  if (!event_id) {
    throw new Error("Kokoro TTS: No event_id returned");
  }

  // Step 2: Poll for the result via /result endpoint (SSE stream)
  const resultResponse = await fetch(`${KOKORO_SPACE_URL}/call/generate/${event_id}`, {
    method: "GET",
    headers: { Accept: "text/event-stream" },
  });

  if (!resultResponse.ok) {
    throw new Error(`Kokoro TTS result failed: ${resultResponse.status}`);
  }

  const resultText = await resultResponse.text();

  // Parse SSE events — look for the "complete" event with data
  const lines = resultText.split("\n");
  let audioData: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("event: complete")) {
      // Next line should be "data: ..."
      const dataLine = lines[i + 1];
      if (dataLine?.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(dataLine.slice(6));
          // Gradio returns array of outputs — first is the audio file info
          if (Array.isArray(parsed) && parsed[0]) {
            const audioInfo = parsed[0];
            // Could be { url: "..." } or { path: "...", url: "..." }
            if (audioInfo.url) {
              audioData = audioInfo.url;
            } else if (typeof audioInfo === "string") {
              audioData = audioInfo;
            }
          }
        } catch {
          // Try parsing as simple string
        }
      }
      break;
    }
  }

  if (!audioData) {
    throw new Error("Kokoro TTS: Could not parse audio from response");
  }

  // Step 3: Download the audio file and save locally
  let audioUrl: string;

  if (audioData.startsWith("http")) {
    // Download from the URL
    const audioResponse = await fetch(audioData);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download Kokoro audio: ${audioResponse.status}`);
    }
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const filename = `${uuidv4()}.wav`;
    const audioDir = path.join(process.cwd(), "public", "audio");
    await mkdir(audioDir, { recursive: true });
    await writeFile(path.join(audioDir, filename), audioBuffer);
    audioUrl = `/audio/${filename}`;
  } else if (audioData.startsWith("data:")) {
    // Base64 encoded audio
    const base64Data = audioData.split(",")[1];
    const audioBuffer = Buffer.from(base64Data, "base64");
    const filename = `${uuidv4()}.wav`;
    const audioDir = path.join(process.cwd(), "public", "audio");
    await mkdir(audioDir, { recursive: true });
    await writeFile(path.join(audioDir, filename), audioBuffer);
    audioUrl = `/audio/${filename}`;
  } else {
    // Might be a relative path on the space
    const fullUrl = audioData.startsWith("/")
      ? `${KOKORO_SPACE_URL}${audioData}`
      : `${KOKORO_SPACE_URL}/file=${audioData}`;

    const audioResponse = await fetch(fullUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download Kokoro audio from path: ${audioResponse.status}`);
    }
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const filename = `${uuidv4()}.wav`;
    const audioDir = path.join(process.cwd(), "public", "audio");
    await mkdir(audioDir, { recursive: true });
    await writeFile(path.join(audioDir, filename), audioBuffer);
    audioUrl = `/audio/${filename}`;
  }

  return audioUrl;
}

/**
 * Generate a preview clip using Kokoro
 */
export async function generateVoicePreviewKokoro(voiceId: string): Promise<string> {
  const previewText =
    "Our platform is built to solve a problem that millions of people face every single day. We have spent two years talking to customers and building something they actually want.";
  return generateSpeechKokoro(previewText, voiceId, 1.0);
}

export function getKokoroVoices() {
  return KOKORO_VOICES.map((v) => ({
    id: v.id,
    name: v.name,
    gender: v.gender,
    style: v.style,
  }));
}
