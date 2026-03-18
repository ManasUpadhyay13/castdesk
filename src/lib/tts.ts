import { getTTSProvider } from "@/lib/tts-provider";
import { generateSpeechElevenLabs, generateVoicePreviewElevenLabs, getElevenLabsVoices, DEFAULT_VOICE_ID } from "@/lib/elevenlabs";
import { generateSpeechKokoro, generateVoicePreviewKokoro, getKokoroVoices, DEFAULT_KOKORO_VOICE } from "@/lib/kokoro";

export async function generateTTSSpeech(text: string, voiceId?: string): Promise<string> {
  const provider = await getTTSProvider();

  if (provider === "elevenlabs") {
    return generateSpeechElevenLabs(text, voiceId || DEFAULT_VOICE_ID);
  } else {
    return generateSpeechKokoro(text, voiceId || DEFAULT_KOKORO_VOICE);
  }
}

export async function generateTTSPreview(voiceId?: string): Promise<string> {
  const provider = await getTTSProvider();

  if (provider === "elevenlabs") {
    return generateVoicePreviewElevenLabs(voiceId || DEFAULT_VOICE_ID);
  } else {
    return generateVoicePreviewKokoro(voiceId || DEFAULT_KOKORO_VOICE);
  }
}

export async function getTTSVoices() {
  const provider = await getTTSProvider();

  if (provider === "elevenlabs") {
    return { provider: "elevenlabs" as const, voices: getElevenLabsVoices() };
  } else {
    return { provider: "kokoro" as const, voices: getKokoroVoices() };
  }
}

export async function getDefaultVoiceId(): Promise<string> {
  const provider = await getTTSProvider();
  return provider === "elevenlabs" ? DEFAULT_VOICE_ID : DEFAULT_KOKORO_VOICE;
}
