import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import { ReallocationMove, PortfolioMetrics } from "@/lib/types";

interface RationaleRequestBody {
  originalMetrics: PortfolioMetrics;
  suggestedMetrics: PortfolioMetrics;
  moves: ReallocationMove[];
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export async function POST(req: NextRequest) {
  try {
    const body: RationaleRequestBody = await req.json();
    const { originalMetrics, suggestedMetrics, moves } = body;

    if (!originalMetrics || !suggestedMetrics || !moves) {
      return NextResponse.json(
        { error: "Missing originalMetrics, suggestedMetrics, or moves." },
        { status: 400 }
      );
    }

    const trims = moves.filter((m) => m.delta < 0);
    const additions = moves.filter((m) => m.delta > 0);

    const movesSummary = [
      ...trims.map(
        (m) => `Trimmed ${m.ticker} from ${pct(m.fromWeight)} to ${pct(m.toWeight)}.`
      ),
      ...additions.map(
        (m) => `Increased ${m.ticker} from ${pct(m.fromWeight)} to ${pct(m.toWeight)}.`
      ),
    ].join(" ");

    const prompt = `You are writing for EcoVest, a portfolio "greenifier" tool that reallocates investment portfolios toward clean-energy equities and green bonds. Write ONE paragraph (4-6 sentences) in plain English explaining why the following reallocation was suggested, for a non-expert investor.

Reference the actual numbers below. Be balanced and factual — this is illustrative/simulated analysis, not investment advice, and you should not tell the reader to buy or sell anything. Do not use bullet points, just a single flowing paragraph.

Original portfolio: expected return ${pct(originalMetrics.expectedReturn)}, volatility ${pct(originalMetrics.volatility)}, clean-energy score ${originalMetrics.esgScore.toFixed(1)}/10.
Suggested portfolio: expected return ${pct(suggestedMetrics.expectedReturn)}, volatility ${pct(suggestedMetrics.volatility)}, clean-energy score ${suggestedMetrics.esgScore.toFixed(1)}/10.

Changes made: ${movesSummary}

Respond with only the paragraph, no headers or preamble.`;

    const rationale = await generateText(prompt, { maxOutputTokens: 350 });

    return NextResponse.json({ rationale });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
