export type DeckStatus = "DRAFT" | "PROCESSING" | "READY" | "FAILED";
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
  SLIDE_REGENERATE: 5,
  UNLOCK_PERSONA: 10,
};

export const CREDIT_PACKS = [
  { id: "starter", name: "Starter", priceInr: 499, priceUsd: 5, credits: 100, description: "Perfect for trying with your real deck" },
  { id: "founder", name: "Founder", priceInr: 1499, priceUsd: 15, credits: 400, description: "Full fundraising prep sprint" },
  { id: "studio", name: "Studio", priceInr: 3499, priceUsd: 39, credits: 1200, description: "Accelerators, coaches, bulk use" },
] as const;
