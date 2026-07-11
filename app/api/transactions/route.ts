import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getTransactions } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rows = await getTransactions(session.userId);
  return NextResponse.json({
    transactions: rows.map((t) => ({
      id: t.id,
      ticker: t.ticker,
      side: t.side,
      shares: t.shares,
      price: t.price,
      cashAfter: t.cashAfter,
      createdAt: t.createdAt,
    })),
  });
}
