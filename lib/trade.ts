import holdingsData from "@/data/holdings.json";
import { AccountSummary, BonusAward, Holding } from "./types";
import { isGreenBonusEligible, GREEN_BONUS_PERCENT } from "./bonus";
import {
  getUserById,
  updateUserCash,
  getPosition,
  getPositions,
  upsertPositionShares,
  deletePosition,
  insertTransaction,
} from "./db";

// Single, shared execution path for every trade in the app — manual buy/sell
// from the Browse page, the sample-portfolio loader, and "Apply Reallocation"
// all call this same function so cash/positions/transaction history stay
// consistent no matter where a trade originates. This is a simulated,
// paper-trading engine: trades fill instantly at the dataset's mock price,
// there is no real order book or brokerage connection.

const dataset = holdingsData as Holding[];

export class TradeError extends Error {}

export type TradeSide = "BUY" | "SELL";

// Clean-Energy Buy Bonus: buying into a top-tier clean-energy stock or ETF
// (see lib/bonus.ts for the eligibility rule) grants a small simulated cash
// bonus, credited immediately — a lightweight nod to Robinhood-style stock
// bonuses, scoped entirely to this paper-trading economy (no real money is
// ever involved). Every BUY of a qualifying holding earns it, regardless of
// whether the trade came from a manual order, the sample-portfolio loader,
// or "Apply Reallocation" — they all route through this same function.

export interface TradeResult {
  cashBalance: number;
  ticker: string;
  side: TradeSide;
  shares: number;
  price: number;
  bonus?: BonusAward;
}

export function getHolding(ticker: string): Holding {
  const h = dataset.find((d) => d.ticker === ticker.toUpperCase());
  if (!h) throw new TradeError(`Unknown ticker: ${ticker}`);
  return h;
}

export async function executeTrade(
  userId: string,
  tickerRaw: string,
  side: TradeSide,
  shares: number
): Promise<TradeResult> {
  const ticker = tickerRaw.toUpperCase();
  if (!Number.isFinite(shares) || !Number.isInteger(shares) || shares <= 0) {
    throw new TradeError("Shares must be a positive whole number.");
  }

  const holding = getHolding(ticker);
  const user = await getUserById(userId);
  if (!user) throw new TradeError("Account not found.");

  const price = holding.price;

  if (side === "BUY") {
    const cost = price * shares;
    if (cost > user.cashBalance + 1e-6) {
      throw new TradeError(
        `Insufficient simulated cash: this buy costs $${cost.toFixed(
          2
        )} but only $${user.cashBalance.toFixed(2)} is available.`
      );
    }
    const newCash = user.cashBalance - cost;
    await updateUserCash(userId, newCash);
    const existing = await getPosition(userId, ticker);
    await upsertPositionShares(userId, ticker, (existing?.shares ?? 0) + shares);
    await insertTransaction({ userId, ticker, side, shares, price, cashAfter: newCash });

    if (isGreenBonusEligible(holding)) {
      const bonusAmount = Math.round(cost * GREEN_BONUS_PERCENT * 100) / 100;
      if (bonusAmount > 0) {
        const cashWithBonus = newCash + bonusAmount;
        await updateUserCash(userId, cashWithBonus);
        await insertTransaction({
          userId,
          ticker,
          side: "BONUS",
          shares: 0,
          price: bonusAmount,
          cashAfter: cashWithBonus,
        });
        return {
          cashBalance: cashWithBonus,
          ticker,
          side,
          shares,
          price,
          bonus: { ticker, amount: bonusAmount },
        };
      }
    }

    return { cashBalance: newCash, ticker, side, shares, price };
  }

  // SELL
  const existing = await getPosition(userId, ticker);
  const held = existing?.shares ?? 0;
  if (shares > held) {
    throw new TradeError(
      `You only hold ${held} share${held === 1 ? "" : "s"} of ${ticker}.`
    );
  }
  const proceeds = price * shares;
  const newCash = user.cashBalance + proceeds;
  await updateUserCash(userId, newCash);
  const remaining = held - shares;
  if (remaining > 0) {
    await upsertPositionShares(userId, ticker, remaining);
  } else {
    await deletePosition(userId, ticker);
  }
  await insertTransaction({ userId, ticker, side, shares, price, cashAfter: newCash });
  return { cashBalance: newCash, ticker, side, shares, price };
}

/** Sells 100% of every current holding, converting the whole portfolio to
 * cash. Used by the sample-portfolio loader so it can be re-triggered from
 * any starting state during a demo. */
export async function liquidateAll(userId: string): Promise<void> {
  const positions = await getPositions(userId);
  for (const p of positions) {
    if (p.shares > 0) {
      await executeTrade(userId, p.ticker, "SELL", p.shares);
    }
  }
}

function parseInterests(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function getAccountSummary(userId: string): Promise<AccountSummary> {
  const user = await getUserById(userId);
  if (!user) throw new TradeError("Account not found.");
  const positions = (await getPositions(userId)).map((p) => ({ ticker: p.ticker, shares: p.shares }));
  let holdingsValue = 0;
  for (const p of positions) {
    const h = dataset.find((d) => d.ticker === p.ticker);
    if (h) holdingsValue += h.price * p.shares;
  }
  return {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    interests: parseInterests(user.interests),
    profileComplete: Boolean(user.firstName && user.lastName),
    cashBalance: user.cashBalance,
    positions,
    holdingsValue,
    totalValue: user.cashBalance + holdingsValue,
  };
}
