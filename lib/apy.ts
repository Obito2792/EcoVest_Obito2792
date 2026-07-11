import { Holding, Position } from "./types";

// Green Portfolio APY — a simulated, advertised incentive: once at least 80%
// of an account's invested (non-cash) portfolio value sits in holdings that
// score 8+/10 on clean energy, the account becomes eligible for a 4.50%
// simulated APY. Like the Clean-Energy Buy Bonus, this is purely illustrative
// — nothing here is a real interest-bearing account or real money. Kept
// isomorphic (no server-only imports) so both the Account page and the
// Landing page can share one definition of the rule.
export const GREEN_APY_MIN_SCORE = 8;
export const GREEN_APY_MIN_SHARE = 0.8; // 80% of invested (non-cash) value
export const GREEN_APY_RATE = 0.045; // 4.50%

export interface GreenApyStatus {
  eligible: boolean;
  greenValue: number;
  holdingsValue: number;
  /** 0-1 share of invested (non-cash) value that is 8+/10 rated. */
  greenShare: number;
}

export function computeGreenApyStatus(
  positions: Position[],
  dataset: Holding[]
): GreenApyStatus {
  let greenValue = 0;
  let holdingsValue = 0;

  for (const p of positions) {
    const h = dataset.find((d) => d.ticker === p.ticker);
    if (!h) continue;
    const value = h.price * p.shares;
    holdingsValue += value;
    if (h.esgScore >= GREEN_APY_MIN_SCORE) greenValue += value;
  }

  const greenShare = holdingsValue > 0 ? greenValue / holdingsValue : 0;

  return {
    eligible: holdingsValue > 0 && greenShare >= GREEN_APY_MIN_SHARE,
    greenValue,
    holdingsValue,
    greenShare,
  };
}

export function formatApyRate(): string {
  return `${(GREEN_APY_RATE * 100).toFixed(2)}%`;
}

export function formatGreenSharePercent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

export function formatGreenApyThreshold(): string {
  return `${Math.round(GREEN_APY_MIN_SHARE * 100)}%`;
}
