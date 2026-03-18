import {
  generateSpeech,
  generateVoicePreview,
  getPresetVoices,
  DEFAULT_VOICE_ID,
} from "@/lib/elevenlabs";

export async function generateTTSSpeech(text: string, voiceId?: string): Promise<string> {
  return generateSpeech(text, voiceId || DEFAULT_VOICE_ID);
}

export async function generateTTSPreview(voiceId?: string): Promise<string> {
  return generateVoicePreview(voiceId || DEFAULT_VOICE_ID);
}

export async function getTTSVoices() {
  return { provider: "elevenlabs" as const, voices: getPresetVoices() };
}

export async function getDefaultVoiceId(): Promise<string> {
  return DEFAULT_VOICE_ID;
}
