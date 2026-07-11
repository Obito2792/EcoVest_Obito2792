import { NextRequest, NextResponse } from "next/server";
import holdings from "@/data/holdings.json";
import { Holding } from "@/lib/types";
import { generateText } from "@/lib/gemini";

const dataset = holdings as Holding[];

export async function POST(req: NextRequest) {
  try {
    const { ticker } = await req.json();
    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json({ error: "Missing ticker." }, { status: 400 });
    }

    const holding = dataset.find((h) => h.ticker === ticker.toUpperCase());
    if (!holding) {
      return NextResponse.json(
        { error: `Unknown ticker: ${ticker}` },
        { status: 404 }
      );
    }

    const prompt = `You are a plain-English financial explainer for a portfolio "greenifier" app called EcoVest. Summarize the sustainability report excerpt below for the holding ${holding.name} (${holding.ticker}, sector: ${holding.sector}) into a short, plain-English explanation (3-4 sentences max) of why it has a clean-energy/ESG score of ${holding.esgScore}/10.

Be specific and balanced: mention one concrete strength and one concrete limitation grounded in the excerpt. Do not invent facts not present in the excerpt. Do not give investment advice. Write for a general audience, not a financial analyst.

Sustainability report excerpt:
"""
${holding.excerpt}
"""

Respond with only the summary text, no preamble, no headers.`;

    const summary = await generateText(prompt, { maxOutputTokens: 400 });

    return NextResponse.json({ ticker: holding.ticker, summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
