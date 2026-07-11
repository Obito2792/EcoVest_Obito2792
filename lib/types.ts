// Fixed list of clean-energy interest categories, shared between the
// dataset's per-holding tags and the user profile's interest picker so
// matching between the two is trivial.
export const INTEREST_CATEGORIES = [
  "Solar",
  "Wind",
  "EV & Battery",
  "Sustainable Agriculture",
  "Water & Conservation",
  "Green Real Estate",
  "Hydrogen",
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

export interface Holding {
  ticker: string;
  name: string;
  sector: string;
  assetClass: "Equity" | "ETF" | "Bond";
  avgReturn: number; // decimal, e.g. 0.12 = 12%
  volatility: number; // decimal, e.g. 0.22 = 22%
  esgScore: number; // 1-10, higher = stronger clean-energy / ESG alignment
  excerpt: string; // mock sustainability report excerpt
  price: number; // mock trading price in USD, used by the simulated trade engine
  interestTags: string[]; // subset of INTEREST_CATEGORIES this holding is relevant to
}

export interface PortfolioLine {
  ticker: string;
  weight: number; // decimal 0-1, portfolio should sum to ~1
}

export interface Position {
  ticker: string;
  shares: number;
}

export interface AccountSummary {
  email: string;
  firstName: string | null;
  lastName: string | null;
  interests: string[];
  profileComplete: boolean;
  cashBalance: number;
  positions: Position[];
  holdingsValue: number;
  totalValue: number;
}

export interface TransactionRecord {
  id: string;
  ticker: string;
  // "BONUS" rows are system-granted clean-energy buy bonuses, not user trades
  // — see GREEN_BONUS_MIN_SCORE / GREEN_BONUS_PERCENT in lib/trade.ts.
  side: "BUY" | "SELL" | "BONUS";
  shares: number;
  price: number;
  cashAfter: number;
  createdAt: string;
}

export interface BonusAward {
  ticker: string;
  amount: number;
}

export interface EnrichedLine extends PortfolioLine {
  holding: Holding;
}

export interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  esgScore: number;
  totalWeight: number;
  sectorBreakdown: { sector: string; weight: number }[];
}

export interface ReallocationMove {
  ticker: string;
  name: string;
  fromWeight: number;
  toWeight: number;
  delta: number; // toWeight - fromWeight
  reason: string;
}

export interface ReallocationResult {
  original: PortfolioLine[];
  suggested: PortfolioLine[];
  originalMetrics: PortfolioMetrics;
  suggestedMetrics: PortfolioMetrics;
  moves: ReallocationMove[];
  flaggedTickers: string[]; // bottom-quartile holdings flagged for ESG insight cards
}
