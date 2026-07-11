import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getUserById } from "@/lib/db";
import { getAccountSummary, executeTrade, getHolding, TradeError } from "@/lib/trade";
import { generateReallocation } from "@/lib/reallocation";
import holdingsData from "@/data/holdings.json";
import { BonusAward, Holding, PortfolioLine } from "@/lib/types";

const dataset = holdingsData as Holding[];

// Recomputes the suggested reallocation server-side from the account's live
// positions (never trusts client-supplied trade amounts), then translates
// the resulting moves into a batch of sells followed by buys, executed
// through the same executeTrade() path as every other trade in the app.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const account = getAccountSummary(session.userId);
    if (account.positions.length === 0 || account.holdingsValue <= 0) {
      return NextResponse.json(
        {
          error:
            "You don't have any holdings to reallocate yet. Try the sample portfolio or buy a few stocks first.",
        },
        { status: 400 }
      );
    }

    const lines: PortfolioLine[] = account.positions.map((p) => {
      const h = dataset.find((d) => d.ticker === p.ticker);
      return { ticker: p.ticker, weight: (h?.price ?? 0) * p.shares };
    });

    const result = generateReallocation(lines, dataset, account.interests);
    const holdingsValue = account.holdingsValue;

    const sells = result.moves.filter((m) => m.delta < -0.0005);
    const buys = result.moves.filter((m) => m.delta > 0.0005);

    const executed: { ticker: string; side: "BUY" | "SELL"; shares: number }[] = [];
    const bonuses: BonusAward[] = [];

    for (const move of sells) {
      const holding = getHolding(move.ticker);
      const currentPosition = account.positions.find((p) => p.ticker === move.ticker);
      const heldShares = currentPosition?.shares ?? 0;
      const dollarAmount = Math.abs(move.delta) * holdingsValue;
      const shares = Math.min(Math.round(dollarAmount / holding.price), heldShares);
      if (shares > 0) {
        executeTrade(session.userId, move.ticker, "SELL", shares);
        executed.push({ ticker: move.ticker, side: "SELL", shares });
      }
    }

    for (const move of buys) {
      const holding = getHolding(move.ticker);
      const dollarAmount = move.delta * holdingsValue;
      const user = getUserById(session.userId);
      const cash = user?.cashBalance ?? 0;
      const affordableShares = Math.floor(cash / holding.price);
      const shares = Math.min(Math.floor(dollarAmount / holding.price), affordableShares);
      if (shares > 0) {
        const result = executeTrade(session.userId, move.ticker, "BUY", shares);
        executed.push({ ticker: move.ticker, side: "BUY", shares });
        if (result.bonus) bonuses.push(result.bonus);
      }
    }

    const updatedAccount = getAccountSummary(session.userId);
    return NextResponse.json({ account: updatedAccount, executed, bonuses });
  } catch (err) {
    if (err instanceof TradeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to apply reallocation." },
      { status: 500 }
    );
  }
}
