import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getUserById } from "@/lib/db";
import { liquidateAll, executeTrade, getAccountSummary, getHolding, TradeError } from "@/lib/trade";
import samplePortfolioData from "@/data/samplePortfolio.json";
import { BonusAward, PortfolioLine } from "@/lib/types";

const samplePortfolio = samplePortfolioData as PortfolioLine[];

// Loading the sample portfolio is itself just a batch of trades through the
// same executeTrade() path everything else uses: first liquidate whatever
// the account currently holds back to cash (so this button is safely
// re-triggerable at any point in a demo), then buy into the sample weights
// using all available cash.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    await liquidateAll(session.userId);

    const user = await getUserById(session.userId);
    if (!user) throw new TradeError("Account not found.");
    const availableCash = user.cashBalance;
    const bonuses: BonusAward[] = [];

    for (const line of samplePortfolio) {
      const holding = getHolding(line.ticker);
      const dollars = line.weight * availableCash;
      const shares = Math.floor(dollars / holding.price);
      if (shares > 0) {
        const result = await executeTrade(session.userId, line.ticker, "BUY", shares);
        if (result.bonus) bonuses.push(result.bonus);
      }
    }

    const account = await getAccountSummary(session.userId);
    return NextResponse.json({ ...account, bonuses });
  } catch (err) {
    if (err instanceof TradeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load sample portfolio." },
      { status: 500 }
    );
  }
}
