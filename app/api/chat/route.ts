import { NextRequest, NextResponse } from "next/server";
import holdings from "@/data/holdings.json";
import { Holding, PortfolioLine } from "@/lib/types";
import { generateText } from "@/lib/gemini";

const dataset = holdings as Holding[];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface ChatRequestBody {
  question: string;
  history?: ChatMessage[];
  portfolio?: PortfolioLine[]; // current or suggested holdings, for weight context
}

function buildHoldingContext(h: Holding, weight?: number): string {
  const weightStr =
    weight !== undefined ? `, current portfolio weight: ${(weight * 100).toFixed(1)}%` : "";
  return `- ${h.ticker} (${h.name}) | Sector: ${h.sector} | Asset class: ${h.assetClass} | Avg. annual return: ${(h.avgReturn * 100).toFixed(1)}% | Volatility: ${(h.volatility * 100).toFixed(1)}% | Clean-energy/ESG score: ${h.esgScore}/10${weightStr}\n  Sustainability note: ${h.excerpt.split("\n\n")[0]}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { question, history = [], portfolio = [] } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Missing question." }, { status: 400 });
    }

    // Always ground on the full 19-holding dataset (not just what the user
    // currently owns) so hypothetical/comparison questions about any stock
    // or ETF in the app — e.g. "what if I dropped Tesla?" — work even when
    // the user doesn't hold that ticker yet. Weight is annotated only for
    // tickers they actually hold.
    const weightByTicker = new Map(portfolio.map((p) => [p.ticker, p.weight]));
    const contextBlock = dataset
      .map((h) => buildHoldingContext(h, weightByTicker.get(h.ticker)))
      .join("\n");

    const historyBlock = history
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Investor" : "EcoVest"}: ${m.text}`)
      .join("\n");

    const prompt = `You are the EcoVest assistant, embedded in EcoVest — a simulated (paper-trading) stock/ETF portfolio app. There is no real money, bank linking, or real order routing anywhere in EcoVest; every balance and trade is mock/demo data. You can answer two kinds of questions:

1. Questions about any of the 19 stocks/ETFs in the EcoVest dataset below (sector, return, volatility, clean-energy/ESG score, sustainability notes, and the investor's current position weight if they hold it) — including hypothetical "what if" questions about tickers the investor doesn't currently hold.
2. General questions about how EcoVest itself works: it's a simulated portfolio app with $10,000 in starting mock cash; a Try Sample Portfolio option; a Browse page to buy/sell any of the 19 holdings with a Recommended For You section based on the investor's stated clean-energy interests; a Dashboard that shows sector breakdown, a Clean-Energy Tilt Score, and expected return/volatility before vs. after a suggested reallocation; an Apply Reallocation button that executes the suggested trades; a Clean-Energy Buy Bonus that credits a small (2%) simulated cash bonus when buying a holding scoring 8+/10 on clean energy; and a Transactions page logging every trade.

Ground every answer strictly in the information below — never invent holdings data, prices, or features that aren't listed. If asked about a company or figure not present in the data, say you don't have that data rather than guessing. Never give personalized investment advice or tell the user to buy/sell — you can describe illustrative/simulated trade-offs only. Keep answers concise (2-5 sentences) and in plain English.

HOLDINGS DATA (all 19 stocks/ETFs available in EcoVest):
${contextBlock}

${historyBlock ? `CONVERSATION SO FAR:\n${historyBlock}\n` : ""}
Investor question: ${question}

Respond with only your answer text, no headers or preamble.`;

    const answer = await generateText(prompt, { maxOutputTokens: 450, temperature: 0.5 });

    return NextResponse.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
