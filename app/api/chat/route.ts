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

    const weightByTicker = new Map(portfolio.map((p) => [p.ticker, p.weight]));
    const relevantDataset =
      portfolio.length > 0
        ? dataset.filter((h) => weightByTicker.has(h.ticker))
        : dataset;

    const contextBlock = relevantDataset
      .map((h) => buildHoldingContext(h, weightByTicker.get(h.ticker)))
      .join("\n");

    const historyBlock = history
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Investor" : "EcoVest"}: ${m.text}`)
      .join("\n");

    const prompt = `You are the EcoVest portfolio assistant, embedded in a fintech dashboard that analyzes a user's stock/ETF portfolio and suggests reallocating toward clean-energy equities and green bonds. You answer questions about the specific holdings shown on the user's dashboard.

Ground every answer strictly in the holdings data below. If asked about a company or figure not present in the data, say you don't have that data rather than guessing. Never give personalized investment advice or tell the user to buy/sell — you can describe illustrative/simulated trade-offs only. Keep answers concise (2-5 sentences) and in plain English.

HOLDINGS DATA:
${contextBlock}

${historyBlock ? `CONVERSATION SO FAR:\n${historyBlock}\n` : ""}
Investor question: ${question}

Respond with only your answer text, no headers or preamble.`;

    const answer = await generateText(prompt, { maxOutputTokens: 320, temperature: 0.5 });

    return NextResponse.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
