import { db } from "@/lib/db";

export type TTSProvider = "elevenlabs" | "kokoro";

// Cache the setting for 60 seconds to avoid DB hits on every TTS call
let cachedProvider: TTSProvider | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

export async function getTTSProvider(): Promise<TTSProvider> {
  const now = Date.now();
  if (cachedProvider && now - cacheTimestamp < CACHE_TTL) {
    return cachedProvider;
  }

  try {
    const setting = await db.appSetting.findUnique({
      where: { key: "tts_provider" },
    });
    cachedProvider = (setting?.value as TTSProvider) ?? "kokoro";
  } catch {
    cachedProvider = "kokoro";
  }

  cacheTimestamp = now;
  return cachedProvider;
}

export function invalidateTTSCache() {
  cachedProvider = null;
  cacheTimestamp = 0;
}
