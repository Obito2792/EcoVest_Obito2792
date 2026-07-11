// Deterministic mock price history — this app has no real market data feed,
// so charts are derived from each holding's own avgReturn/volatility via a
// seeded random walk. Seeding on the ticker means the same stock renders an
// identical shape everywhere (sparkline, detail chart) on every render.

export interface PricePoint {
  index: number;
  price: number;
  timestamp: number;
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Generates a `points`-long random walk seeded by `ticker`, drifted by
 * `avgReturn`/`volatility` (annualized decimals), and rescaled so the final
 * point lands exactly on `endPrice` — i.e. "here's how it plausibly got to
 * today's price." One point per day, ending today.
 */
export function generatePriceSeries(
  ticker: string,
  avgReturn: number,
  volatility: number,
  endPrice: number,
  points = 30
): PricePoint[] {
  const rand = mulberry32(hashSeed(ticker));
  const dailyDrift = avgReturn / 252;
  const dailyVol = Math.max(volatility, 0.05) / Math.sqrt(252);

  const cumulative: number[] = [];
  let running = 0;
  for (let i = 0; i < points; i++) {
    const shock = (rand() - 0.5) * 2;
    running += dailyDrift + shock * dailyVol;
    cumulative.push(running);
  }

  const finalCumulative = cumulative[cumulative.length - 1] ?? 0;
  const now = Date.now();
  return cumulative.map((c, i) => ({
    index: i,
    price: Math.max(0.01, endPrice * (1 + (c - finalCumulative))),
    timestamp: now - (points - 1 - i) * DAY_MS,
  }));
}

export function seriesChangePercent(series: PricePoint[]): number {
  if (series.length < 2) return 0;
  const first = series[0].price;
  const last = series[series.length - 1].price;
  if (first <= 0) return 0;
  return (last - first) / first;
}

// --- Range selector (stock detail page) ---------------------------------

export const RANGE_KEYS = ["1D", "3D", "1W", "3M", "6M", "1Y", "YTD"] as const;
export type RangeKey = (typeof RANGE_KEYS)[number];

export const RANGE_META: Record<RangeKey, { label: string; points: number }> = {
  "1D": { label: "1D", points: 48 },
  "3D": { label: "3D", points: 72 },
  "1W": { label: "1W", points: 84 },
  "3M": { label: "3M", points: 66 },
  "6M": { label: "6M", points: 90 },
  "1Y": { label: "1Y", points: 120 },
  YTD: { label: "YTD", points: 100 },
};

function spanDaysForRange(range: RangeKey): number {
  switch (range) {
    case "1D":
      return 1;
    case "3D":
      return 3;
    case "1W":
      return 7;
    case "3M":
      return 90;
    case "6M":
      return 182;
    case "1Y":
      return 365;
    case "YTD": {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return Math.max(1, (now.getTime() - startOfYear.getTime()) / DAY_MS);
    }
  }
}

/**
 * Same random-walk approach as generatePriceSeries, but scaled to an
 * arbitrary time span/point count. Volatility scales with sqrt(time) (as in
 * a real Brownian-motion price process) so a 1D chart isn't just a tiny,
 * flat-looking slice of the same per-day noise used for a 1Y chart — each
 * range is seeded independently (ticker + range) so every range gets its
 * own plausible-looking shape, all anchored to today's real price.
 */
export function generateRangeSeries(
  ticker: string,
  avgReturn: number,
  volatility: number,
  endPrice: number,
  range: RangeKey
): PricePoint[] {
  const { points } = RANGE_META[range];
  const spanDays = spanDaysForRange(range);
  const rand = mulberry32(hashSeed(`${ticker}:${range}`));

  const dailyDrift = avgReturn / 252;
  const dailyVol = Math.max(volatility, 0.05) / Math.sqrt(252);
  const stepDays = spanDays / Math.max(1, points - 1);
  const stepDrift = dailyDrift * stepDays;
  const stepVol = dailyVol * Math.sqrt(stepDays);

  const cumulative: number[] = [];
  let running = 0;
  for (let i = 0; i < points; i++) {
    const shock = (rand() - 0.5) * 2;
    running += stepDrift + shock * stepVol;
    cumulative.push(running);
  }

  const finalCumulative = cumulative[cumulative.length - 1] ?? 0;
  const now = Date.now();
  return cumulative.map((c, i) => ({
    index: i,
    price: Math.max(0.01, endPrice * (1 + (c - finalCumulative))),
    timestamp: now - (points - 1 - i) * stepDays * DAY_MS,
  }));
}

export function formatRangeAxisLabel(timestamp: number, range: RangeKey): string {
  const d = new Date(timestamp);
  if (range === "1D") {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  if (range === "3D" || range === "1W") {
    return d.toLocaleDateString(undefined, { weekday: "short" });
  }
  if (range === "1Y") {
    return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatRangeTooltipLabel(timestamp: number, range: RangeKey): string {
  const d = new Date(timestamp);
  if (range === "1D") {
    return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
