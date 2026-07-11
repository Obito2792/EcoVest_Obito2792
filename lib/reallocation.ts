import {
  Holding,
  PortfolioLine,
  PortfolioMetrics,
  ReallocationMove,
  ReallocationResult,
} from "./types";

/**
 * All reallocation math below is a simplified, explainable illustrative model:
 * portfolio return / volatility are computed as straight weighted averages of
 * each holding's historical figures. This intentionally ignores covariance
 * between holdings (real portfolio risk modeling would use a covariance
 * matrix). It is meant to be transparent and easy to explain, not a
 * production risk model. All figures are simulated/illustrative for demo
 * purposes and are not investment advice.
 */

export function getHoldingMap(dataset: Holding[]): Map<string, Holding> {
  return new Map(dataset.map((h) => [h.ticker, h]));
}

export function normalizeLines(
  lines: PortfolioLine[],
  dataset: Holding[]
): PortfolioLine[] {
  const map = getHoldingMap(dataset);
  const valid = lines.filter((l) => map.has(l.ticker) && l.weight > 0);
  const total = valid.reduce((sum, l) => sum + l.weight, 0);
  if (total <= 0) return [];
  return valid.map((l) => ({ ticker: l.ticker, weight: l.weight / total }));
}

export function computeMetrics(
  lines: PortfolioLine[],
  dataset: Holding[]
): PortfolioMetrics {
  const map = getHoldingMap(dataset);
  let totalWeight = 0;
  let expectedReturn = 0;
  let volatility = 0;
  let esgScore = 0;
  const sectorMap = new Map<string, number>();

  for (const line of lines) {
    const h = map.get(line.ticker);
    if (!h) continue;
    totalWeight += line.weight;
    expectedReturn += line.weight * h.avgReturn;
    volatility += line.weight * h.volatility;
    esgScore += line.weight * h.esgScore;
    sectorMap.set(h.sector, (sectorMap.get(h.sector) ?? 0) + line.weight);
  }

  const sectorBreakdown = Array.from(sectorMap.entries())
    .map(([sector, weight]) => ({ sector, weight }))
    .sort((a, b) => b.weight - a.weight);

  return { expectedReturn, volatility, esgScore, totalWeight, sectorBreakdown };
}

interface ReallocationOptions {
  /** Fraction of each bottom-quartile holding's weight to trim (0-1). */
  shiftFraction?: number;
  /** Green bond proxy tickers to receive freed-up weight. */
  bondTickers?: string[];
  /** Preferred high clean-energy-score equities/ETFs to receive freed-up weight. */
  cleanTickers?: string[];
  /** Maximum weight allowed in any single sector after reallocation. */
  sectorCap?: number;
}

const DEFAULT_OPTIONS: Required<ReallocationOptions> = {
  shiftFraction: 0.4,
  bondTickers: ["BGRN"],
  cleanTickers: ["ICLN", "FSLR", "ENPH", "TAN", "NEE"],
  sectorCap: 0.35,
};

/** Minimum clean-energy score for a holding to qualify as a reallocation
 * target purely on the strength of matching the user's stated interests
 * (on top of the curated cleanTickers/bondTickers list). Keeps interest
 * matching from pulling in genuinely low-scoring holdings. */
const INTEREST_CANDIDATE_MIN_SCORE = 7;

/** Effective-score bonus applied when a target holding's interestTags
 * overlap the user's stated interests. Small relative to the 1-10 score
 * range so it acts as a tiebreaker between similarly-scored holdings
 * rather than overriding the ESG ranking outright. */
const INTEREST_SCORE_BOOST = 1;

function matchesInterests(holding: Holding, userInterests: string[]): boolean {
  return userInterests.length > 0 && holding.interestTags.some((t) => userInterests.includes(t));
}

/** ESG score adjusted with a small boost for holdings matching the user's
 * stated clean-energy interests — used only to weight *how much* freed
 * capital a target receives, never to decide which holdings get trimmed. */
function effectiveScore(holding: Holding, userInterests: string[]): number {
  return holding.esgScore + (matchesInterests(holding, userInterests) ? INTEREST_SCORE_BOOST : 0);
}

/**
 * Simple, explainable reallocation:
 * 1. Rank current holdings by clean-energy/ESG score.
 * 2. Trim `shiftFraction` of the weight from the bottom quartile scorers.
 * 3. Distribute the freed weight across preferred clean-energy equities/ETFs,
 *    green bond proxies, and any other dataset holdings that both score
 *    well (7+) and match the user's stated interests — weighted by ESG
 *    score, with a small boost for interest-matching holdings so that when
 *    two candidates score similarly, the one matching the user's interests
 *    gets more of the freed capital.
 * 4. Cap any single sector at `sectorCap` post-reallocation, redistributing
 *    overflow back into the target list to preserve diversification.
 */
export function generateReallocation(
  original: PortfolioLine[],
  dataset: Holding[],
  userInterests: string[] = [],
  options: ReallocationOptions = {}
): ReallocationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const map = getHoldingMap(dataset);
  const normalized = normalizeLines(original, dataset);

  const enriched = normalized
    .map((l) => ({ ...l, holding: map.get(l.ticker)! }))
    .filter((l) => l.holding);

  const sorted = [...enriched].sort(
    (a, b) => a.holding.esgScore - b.holding.esgScore
  );
  const quartileSize = Math.max(1, Math.round(sorted.length / 4));
  const bottomQuartile = sorted.slice(0, quartileSize);
  const bottomTickers = new Set(bottomQuartile.map((l) => l.ticker));

  const weights = new Map<string, number>(
    normalized.map((l) => [l.ticker, l.weight])
  );

  let freed = 0;
  const moves: ReallocationMove[] = [];

  for (const line of bottomQuartile) {
    const cut = line.weight * opts.shiftFraction;
    const newWeight = line.weight - cut;
    weights.set(line.ticker, newWeight);
    freed += cut;
    moves.push({
      ticker: line.ticker,
      name: line.holding.name,
      fromWeight: line.weight,
      toWeight: newWeight,
      delta: newWeight - line.weight,
      reason: `Bottom-quartile clean-energy score (${line.holding.esgScore}/10) in ${line.holding.sector}; trimmed ${Math.round(
        opts.shiftFraction * 100
      )}% of the position.`,
    });
  }

  // Interest-matched candidates widen the target pool beyond the curated
  // list — any dataset holding that scores 7+ and matches one of the
  // user's stated interests is eligible to receive freed capital too.
  const interestCandidates = dataset
    .filter(
      (h) =>
        h.esgScore >= INTEREST_CANDIDATE_MIN_SCORE &&
        !bottomTickers.has(h.ticker) &&
        matchesInterests(h, userInterests)
    )
    .map((h) => h.ticker);

  const targetTickers = Array.from(
    new Set([...opts.cleanTickers, ...opts.bondTickers, ...interestCandidates])
  ).filter((t) => !bottomTickers.has(t) && map.has(t));

  const targetScoreSum = targetTickers.reduce(
    (sum, t) => sum + effectiveScore(map.get(t)!, userInterests),
    0
  );

  if (freed > 0 && targetTickers.length > 0) {
    for (const t of targetTickers) {
      const holding = map.get(t)!;
      const matched = matchesInterests(holding, userInterests);
      const share = (effectiveScore(holding, userInterests) / targetScoreSum) * freed;
      const before = weights.get(t) ?? 0;
      const after = before + share;
      weights.set(t, after);
      const interestNote = matched
        ? ` Matches your stated interest in ${holding.interestTags.find((tag) =>
            userInterests.includes(tag)
          )}, so it received a slightly larger share of the freed capital.`
        : "";
      moves.push({
        ticker: t,
        name: holding.name,
        fromWeight: before,
        toWeight: after,
        delta: after - before,
        reason:
          (before > 0
            ? `Increased allocation — high clean-energy score (${holding.esgScore}/10) in ${holding.sector}.`
            : `New position — high clean-energy score (${holding.esgScore}/10) in ${holding.sector}, funded by trimming low-scoring holdings.`) +
          interestNote,
      });
    }
  }

  enforceSectorCap(weights, map, opts.sectorCap, targetTickers, userInterests);

  const suggested: PortfolioLine[] = Array.from(weights.entries())
    .filter(([, w]) => w > 0.0005)
    .map(([ticker, weight]) => ({ ticker, weight }));

  const originalMetrics = computeMetrics(normalized, dataset);
  const suggestedMetrics = computeMetrics(suggested, dataset);

  return {
    original: normalized,
    suggested,
    originalMetrics,
    suggestedMetrics,
    moves,
    flaggedTickers: bottomQuartile.map((l) => l.ticker),
  };
}

function enforceSectorCap(
  weights: Map<string, number>,
  map: Map<string, Holding>,
  cap: number,
  protectedTickers: string[],
  userInterests: string[]
) {
  const sectorTotals = new Map<string, number>();
  for (const [ticker, w] of weights) {
    const sector = map.get(ticker)?.sector;
    if (!sector) continue;
    sectorTotals.set(sector, (sectorTotals.get(sector) ?? 0) + w);
  }

  let overflow = 0;
  for (const [sector, total] of sectorTotals) {
    if (total > cap) {
      const excess = total - cap;
      overflow += excess;
      for (const [ticker, w] of weights) {
        if (map.get(ticker)?.sector === sector) {
          weights.set(ticker, w * (cap / total));
        }
      }
    }
  }

  if (overflow > 0 && protectedTickers.length > 0) {
    const scoreSum = protectedTickers.reduce(
      (sum, t) => sum + (map.has(t) ? effectiveScore(map.get(t)!, userInterests) : 0),
      0
    );
    for (const t of protectedTickers) {
      const holding = map.get(t);
      if (!holding || scoreSum === 0) continue;
      const share = (effectiveScore(holding, userInterests) / scoreSum) * overflow;
      weights.set(t, (weights.get(t) ?? 0) + share);
    }
  }
}
