import OpenAI from "openai";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Transcribe audio using OpenAI Whisper.
 * Accepts a Buffer of audio data (webm, wav, mp3, etc.)
 */
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string = "audio/webm"): Promise<string> {
  const openai = getOpenAI();

  // Write buffer to a temp file (Whisper API needs a file)
  const ext = mimeType.includes("webm") ? "webm" : mimeType.includes("wav") ? "wav" : "mp3";
  const tempFilename = `whisper-${uuidv4()}.${ext}`;
  const tempDir = path.join(process.cwd(), "tmp");
  await mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, tempFilename);

  try {
    await writeFile(tempPath, audioBuffer);

    // Use the File API for Whisper
    const fs = await import("fs");
    const file = fs.createReadStream(tempPath);

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file,
      language: "en",
    });

    return transcription.text;
  } finally {
    // Clean up temp file
    try {
      await unlink(tempPath);
    } catch {
      // ignore cleanup errors
    }
  }
}
