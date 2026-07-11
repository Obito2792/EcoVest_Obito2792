import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { executeTrade, getAccountSummary, TradeError } from "@/lib/trade";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { ticker, side, shares } = await req.json();
    if (
      typeof ticker !== "string" ||
      (side !== "BUY" && side !== "SELL") ||
      typeof shares !== "number"
    ) {
      return NextResponse.json(
        { error: "ticker, side (\"BUY\" or \"SELL\"), and shares are required." },
        { status: 400 }
      );
    }

    const result = await executeTrade(session.userId, ticker, side, shares);
    const account = await getAccountSummary(session.userId);
    return NextResponse.json({ ...account, bonus: result.bonus ?? null });
  } catch (err) {
    if (err instanceof TradeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Trade failed." },
      { status: 500 }
    );
  }
}
