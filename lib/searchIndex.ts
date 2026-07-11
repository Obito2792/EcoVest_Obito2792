// Static index of app pages/features surfaced by GlobalSearch, alongside the
// live 19-holding dataset. Kept isomorphic (no server-only imports) so it can
// be used directly from a client component.
export interface SearchableFeature {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  href?: string;
  // Some "features" aren't a page navigation — e.g. opening the chat panel,
  // which is a global overlay rather than a route.
  action?: "open-chat";
}

export const FEATURES: SearchableFeature[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Sector breakdown, Clean-Energy Tilt Score, and the suggested reallocation.",
    keywords: ["dashboard", "sector", "reallocation", "esg", "clean-energy score", "tilt", "chart"],
    href: "/dashboard",
  },
  {
    id: "browse",
    label: "Browse Stocks & ETFs",
    description: "Buy or sell any of the 19 holdings, with a Recommended For You section.",
    keywords: ["browse", "buy", "sell", "trade", "recommended", "stocks", "etfs"],
    href: "/browse",
  },
  {
    id: "account",
    label: "Account",
    description: "Cash balance, current holdings, and the Try Sample Portfolio option.",
    keywords: ["account", "cash", "balance", "sample portfolio", "holdings"],
    href: "/account",
  },
  {
    id: "transactions",
    label: "Transactions",
    description: "Full history of every trade and clean-energy bonus you've earned.",
    keywords: ["transactions", "history", "trades", "ledger", "bonus history"],
    href: "/transactions",
  },
  {
    id: "profile",
    label: "Edit Interests & Profile",
    description: "Update your name and clean-energy interest categories.",
    keywords: ["profile", "interests", "name", "solar", "wind", "settings"],
    href: "/profile",
  },
  {
    id: "apply-reallocation",
    label: "Apply Reallocation",
    description: "Execute the suggested clean-energy reallocation as real simulated trades — on the Dashboard.",
    keywords: ["apply reallocation", "rebalance", "execute trades", "greenify"],
    href: "/dashboard",
  },
  {
    id: "sample-portfolio",
    label: "Try Sample Portfolio",
    description: "Instantly load a pre-built 13-holding portfolio — on the Account page.",
    keywords: ["sample portfolio", "demo portfolio", "quick start", "starter"],
    href: "/account",
  },
  {
    id: "clean-energy-bonus",
    label: "Clean-Energy Buy Bonus",
    description: "A small simulated cash bonus for buying holdings that score 8+/10 on clean energy.",
    keywords: ["bonus", "clean energy bonus", "reward", "cashback", "green bonus"],
    href: "/browse",
  },
  {
    id: "green-portfolio-apy",
    label: "Green Portfolio APY",
    description: "Hold 80%+ of your portfolio in 8+/10 clean-energy holdings to unlock a simulated 4.50% APY — tracked on the Account page.",
    keywords: ["apy", "interest", "green apy", "4.50%", "yield", "incentive"],
    href: "/account",
  },
  {
    id: "ask-gemini",
    label: "Ask Gemini Assistant",
    description: "Open the chat assistant to ask about any holding or how EcoVest works.",
    keywords: ["gemini", "chat", "assistant", "ask", "help", "ai"],
    action: "open-chat",
  },
  {
    id: "features-page",
    label: "Features",
    description: "A full tour of everything EcoVest can do, in one page.",
    keywords: ["features", "what can i do", "capabilities", "tour"],
    href: "/features",
  },
  {
    id: "about-page",
    label: "About EcoVest",
    description: "Our mission — GROW: Green, Return, Wealth — and why we built EcoVest.",
    keywords: ["about", "mission", "grow", "story", "who made this"],
    href: "/about",
  },
  {
    id: "faq-page",
    label: "FAQ / Help Center",
    description: "Answers on simulated trading, reallocation, the Gemini assistant, and more.",
    keywords: ["faq", "help", "questions", "support", "how does this work"],
    href: "/faq",
  },
];
