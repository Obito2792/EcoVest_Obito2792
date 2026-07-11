import { Holding } from "./types";

// Clean-Energy Buy Bonus — a small simulated cash bonus for buying into a
// top-tier clean-energy stock or ETF, similar in spirit to Robinhood's free-
// stock bonuses. Deliberately isomorphic (no server-only imports) so both
// the trade engine (lib/trade.ts, server-only) and the UI (badges, trade
// modal copy) can share one definition of "which holdings qualify."
export const GREEN_BONUS_MIN_SCORE = 8;
export const GREEN_BONUS_PERCENT = 0.02;

export function isGreenBonusEligible(holding: Holding): boolean {
  return holding.esgScore >= GREEN_BONUS_MIN_SCORE;
}

export function formatBonusPercent(): string {
  return `${Math.round(GREEN_BONUS_PERCENT * 100)}%`;
}
