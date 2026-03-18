export type DeckStatus = "PROCESSING" | "READY" | "FAILED";
export type VoiceType = "CLONED" | "PRESET" | "DEFAULT";
export type SessionStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type Speaker = "INVESTOR" | "FOUNDER";

export interface InvestorPersona {
  id: string;
  name: string;
  title: string;
  label: string;
  personality: string;
  style: string;
  coreAttack: string;
  sampleQuestions: string[];
  signatureMove: string;
  systemPrompt: string;
}

export interface CreditAction {
  type: string;
  credits: number;
  description: string;
}

export const CREDIT_COSTS: Record<string, number> = {
  DECK_UPLOAD: 60,
  ROLEPLAY_SESSION: 80,
  VOICE_CLONE: 40,
  SLIDE_REGENERATE: 5,
  UNLOCK_PERSONA: 10,
};

export const CREDIT_PACKS = [
  { id: "starter", name: "Starter", price: 499, credits: 100, description: "First-time user, try with real deck" },
  { id: "founder", name: "Founder", price: 1499, credits: 400, description: "Full fundraising prep sprint" },
  { id: "studio", name: "Studio", price: 3499, credits: 1200, description: "Accelerators, coaches, bulk use" },
] as const;
