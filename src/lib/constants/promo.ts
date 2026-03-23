export const PROMO_CUTOFF_DATE = new Date("2026-04-10");
export const PROMO_CREDITS = 160;

export function isPromoPeriod(): boolean {
  return new Date() < PROMO_CUTOFF_DATE;
}
