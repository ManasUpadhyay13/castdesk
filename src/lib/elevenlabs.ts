import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = "https://api.elevenlabs.io/v1";

// Preset voices — map to real ElevenLabs voice IDs
// These are default voices available on all ElevenLabs accounts
export const PRESET_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Arjun", gender: "male" as const, style: "Confident and calm" },
  { id: "ErXwobaYiN019PkySvjV", name: "Rohan", gender: "male" as const, style: "Energetic and sharp" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Dev", gender: "male" as const, style: "Authoritative" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Priya", gender: "female" as const, style: "Clear and professional" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Ananya", gender: "female" as const, style: "Warm and persuasive" },
  { id: "jBpfuIE2acCO8z3wKNLl", name: "Meera", gender: "female" as const, style: "Bold and direct" },
] as const;

export type PresetVoice = (typeof PRESET_VOICES)[number];

// Default voice used when no voice is selected
export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

function getHeaders() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
  return {
    "xi-api-key": ELEVENLABS_API_KEY,
  };
}

/**
 * Generate speech audio from text using ElevenLabs TTS
 * Returns the path to the saved audio file (relative to /public)
 */
export async function generateSpeech(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
  options?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
  }
): Promise<string> {
  const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: options?.stability ?? 0.5,
        similarity_boost: options?.similarityBoost ?? 0.75,
        style: options?.style ?? 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${response.status} - ${error}`);
  }

  // Save audio file
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const filename = `${uuidv4()}.mp3`;
  const audioDir = path.join(process.cwd(), "public", "audio");

  await mkdir(audioDir, { recursive: true });
  await writeFile(path.join(audioDir, filename), audioBuffer);

  return `/audio/${filename}`;
}

/**
 * Generate a short preview clip for a voice
 */
export async function generateVoicePreview(voiceId: string): Promise<string> {
  const previewText =
    "Our platform is built to solve a problem that millions of people face every single day. We've spent two years talking to customers, understanding their pain, and building something they actually want.";
  return generateSpeech(previewText, voiceId);
}

/**
 * Get list of available preset voices with metadata
 */
export function getPresetVoices() {
  return PRESET_VOICES.map((v) => ({
    id: v.id,
    name: v.name,
    gender: v.gender,
    style: v.style,
  }));
}

// Named exports for provider abstraction
export const generateSpeechElevenLabs = generateSpeech;
export const generateVoicePreviewElevenLabs = generateVoicePreview;
export const getElevenLabsVoices = getPresetVoices;
