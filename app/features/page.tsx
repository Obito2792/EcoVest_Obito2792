"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForestSilhouette from "@/components/ForestSilhouette";
import IconChip, { ChipColor } from "@/components/IconChip";
import CountUp from "@/components/CountUp";
import { useToast } from "@/components/Toast";
import {
  TrendingUpIcon,
  LeafIcon,
  SparklesIcon,
  ShieldIcon,
  ArrowRightIcon,
  BarChartIcon,
  PieChartIcon,
  GaugeIcon,
  ArrowsShuffleIcon,
  MessageIcon,
  UploadIcon,
} from "@/components/Icons";

interface Feature {
  icon: React.ReactNode;
  color: ChipColor;
  title: string;
  body: string;
  bullets: string[];
}

const FEATURES: Feature[] = [
  {
    icon: <UploadIcon className="h-5 w-5" />,
    color: "blue",
    title: "Simulated Portfolio, $10,000 to Start",
    body: "Every account opens with $10,000 in mock cash — no real brokerage link, ever. Load a pre-built sample portfolio instantly or build your own from scratch.",
    bullets: ["No card or bank required", "One-click sample portfolio", "Fully reversible, always simulated"],
  },
  {
    icon: <BarChartIcon className="h-5 w-5" />,
    color: "green",
    title: "Browse & Trade Any Holding",
    body: "Buy or sell any of the 19 stocks and ETFs at their listed price, with a confirmation step before anything executes.",
    bullets: ["19 stocks, ETFs, and green bond proxies", "Instant fills at listed price", "Full buy/sell confirmation modal"],
  },
  {
    icon: <SparklesIcon className="h-5 w-5" />,
    color: "violet",
    title: "Recommended For You",
    body: "Your stated clean-energy interests — Solar, Wind, EV & Battery, and more — surface a personalized row of holdings on Browse.",
    bullets: ["Driven by your profile interests", "Also a soft tiebreaker in reallocation", "Update anytime from your profile"],
  },
  {
    icon: <PieChartIcon className="h-5 w-5" />,
    color: "blue",
    title: "Portfolio Dashboard",
    body: "Sector breakdown, weighted expected return, weighted volatility, and a 1–10 clean-energy score — computed transparently from your real holdings.",
    bullets: ["Before/after sector donut charts", "Weighted return & risk, side by side", "Every figure traceable to a formula"],
  },
  {
    icon: <GaugeIcon className="h-5 w-5" />,
    color: "green",
    title: "Clean-Energy Tilt & Reallocation",
    body: "A quartile-based algorithm trims your lowest clean-energy scorers and shifts that capital into clean-energy equities and green bonds, capped by sector.",
    bullets: ["Explainable, holding-by-holding logic", "Sector exposure capped at 35%", "One click executes it as real simulated trades"],
  },
  {
    icon: <ArrowsShuffleIcon className="h-5 w-5" />,
    color: "amber",
    title: "Clean-Energy Buy Bonus",
    body: "Buying a holding that scores 8+/10 on clean energy instantly credits a small simulated cash bonus — a lightweight, felt incentive, not just an algorithm's suggestion.",
    bullets: ["2% simulated cash bonus", "Visible before you confirm a trade", "Logged as its own transaction row"],
  },
  {
    icon: <TrendingUpIcon className="h-5 w-5" />,
    color: "blue",
    title: "Individual Stock Pages",
    body: "Every holding has its own detail page with a simulated price history chart, sector and asset-class info, and the same buy/sell actions as Browse.",
    bullets: ["Simulated price history chart", "Sustainability report excerpt", "Buy or sell right from the page"],
  },
  {
    icon: <MessageIcon className="h-5 w-5" />,
    color: "violet",
    title: "Gemini-Powered Insights",
    body: "Three live Gemini API calls, grounded in your actual holdings data — never hardcoded: ESG summaries, reallocation rationale, and a free-form chat assistant.",
    bullets: ["Plain-English ESG summaries", "“Why this reallocation” explanations", "Ask about any holding or app feature"],
  },
  {
    icon: <ShieldIcon className="h-5 w-5" />,
    color: "slate",
    title: "Global Search",
    body: "Press Cmd/Ctrl+K or click the search icon in the header to instantly find any stock, ETF, sector, or app feature from anywhere in EcoVest.",
    bullets: ["Search stocks, ETFs & sectors", "Search pages & features too", "Keyboard-navigable results"],
  },
  {
    icon: <LeafIcon className="h-5 w-5" />,
    color: "green",
    title: "Full Transaction History",
    body: "Every buy, sell, sample-portfolio load, and clean-energy bonus is logged with ticker, shares, price, and resulting cash balance.",
    bullets: ["Chronological, filterable ledger", "Bonus rows shown distinctly", "Nothing happens off the books"],
  },
];

interface Spotlight {
  id: string;
  icon: React.ReactNode;
  color: ChipColor;
  title: string;
  tagline: string;
}

const SPOTLIGHTS: Spotlight[] = [
  {
    id: "trade",
    icon: <BarChartIcon className="h-5 w-5" />,
    color: "blue",
    title: "Browse & Trade",
    tagline: "Buy or sell any of 19 holdings against your simulated cash.",
  },
  {
    id: "dashboard",
    icon: <PieChartIcon className="h-5 w-5" />,
    color: "blue",
    title: "Portfolio Dashboard",
    tagline: "See your sector mix and clean-energy score shift in real time.",
  },
  {
    id: "reallocate",
    icon: <GaugeIcon className="h-5 w-5" />,
    color: "green",
    title: "Clean-Energy Reallocation",
    tagline: "One click trims low scorers and shifts capital into clean energy.",
  },
  {
    id: "gemini",
    icon: <MessageIcon className="h-5 w-5" />,
    color: "violet",
    title: "Gemini-Powered Insights",
    tagline: "Ask anything — every answer is grounded in your real holdings.",
  },
  {
    id: "search",
    icon: <ShieldIcon className="h-5 w-5" />,
    color: "slate",
    title: "Global Search",
    tagline: "Cmd/Ctrl+K finds any stock, sector, or feature instantly.",
  },
];

const AUTOPLAY_MS = 6000;

export default function FeaturesPage() {
  const [authed, setAuthed] = useState(false);
  const [activeId, setActiveId] = useState(SPOTLIGHTS[0].id);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/account");
      if (res.ok) setAuthed(true);
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveId((prev) => {
        const idx = SPOTLIGHTS.findIndex((s) => s.id === prev);
        return SPOTLIGHTS[(idx + 1) % SPOTLIGHTS.length].id;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Header authed={authed} />

      {/* HERO — deep forest gradient with a hand-drawn treeline at the base */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-forest-700">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-forest-500/20 blur-3xl" />
        <div
          className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 animate-float rounded-full bg-blue-500/10 blur-3xl"
          style={{ animationDelay: "1.4s" }}
        />
        <LeafIcon className="animate-sway pointer-events-none absolute left-[8%] top-[18%] h-8 w-8 text-forest-300/40" />
        <span
          className="animate-sway pointer-events-none absolute right-[12%] top-[40%] block"
          style={{ animationDelay: "0.8s" }}
        >
          <LeafIcon className="h-10 w-10 text-forest-300/30" />
        </span>

        <div className="relative mx-auto max-w-4xl px-6 pb-32 pt-16 text-center">
          <span className="animate-fade-in-up badge mx-auto mb-5 w-fit bg-forest-500/20 text-forest-300">
            EVERYTHING IN ECOVEST
          </span>
          <h1
            className="animate-fade-in-up text-3xl font-bold text-white sm:text-4xl"
            style={{ animationDelay: "60ms" }}
          >
            Features
          </h1>
          <p
            className="animate-fade-in-up mx-auto mt-4 max-w-xl text-slate-300"
            style={{ animationDelay: "120ms" }}
          >
            A simulated brokerage, a clean-energy reallocation engine, and
            Gemini-grounded insights — all in one place, all clearly labeled
            as illustrative and simulated.
          </p>
        </div>

        <ForestSilhouette className="h-32 text-forest-950" />
      </section>

      {/* INTERACTIVE SPOTLIGHT — pick a feature, watch it come alive */}
      <section className="bg-forest-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-forest-900">See it in action</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
              Click a feature — or just wait, it rotates on its own.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {SPOTLIGHTS.map((s) => {
                const isActive = s.id === activeId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={`flex flex-shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 lg:flex-shrink ${
                      isActive
                        ? "border-forest-400 bg-forest-500/5 shadow-glow-soft"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card"
                    }`}
                  >
                    <IconChip icon={s.icon} color={s.color} size="sm" />
                    <div className="min-w-[9rem]">
                      <div
                        className={`text-sm font-semibold ${
                          isActive ? "text-forest-700" : "text-navy-900"
                        }`}
                      >
                        {s.title}
                      </div>
                      <div className="hidden text-xs text-slate-500 lg:block">
                        {s.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              key={activeId}
              className="animate-fade-in-up min-h-[320px] rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-card sm:p-8"
            >
              {activeId === "trade" && <TradeVisual />}
              {activeId === "dashboard" && <DashboardVisual />}
              {activeId === "reallocate" && <ReallocateVisual />}
              {activeId === "gemini" && <GeminiVisual />}
              {activeId === "search" && <SearchVisual />}
            </div>
          </div>
        </div>
      </section>

      {/* FULL FEATURE GRID */}
      <section className="bg-forest-100/50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-forest-900">
            Everything included
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover bg-white">
                <IconChip icon={f.icon} color={f.color} />
                <h3 className="mt-4 text-base font-semibold text-navy-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.body}</p>
                <ul className="mt-3 space-y-1.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-500">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-forest-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA — deep forest gradient with treeline, matching About */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-700 via-forest-900 to-forest-950 pb-32 pt-16">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 animate-float rounded-full bg-forest-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            See it on your own numbers
          </h2>
          <p className="mx-auto mt-3 max-w-md text-forest-100">
            Sign up free, load the sample portfolio, and every feature above
            is running against your own simulated $10,000 in under a minute.
          </p>
          <Link
            href={authed ? "/account" : "/signup"}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-forest-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-glow-soft"
          >
            {authed ? "Go to Account" : "Get Started Free"}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <ForestSilhouette className="h-32 text-forest-950" />
      </section>

      <Footer />
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Spotlight visuals — small, self-contained mockups (no real screenshots) */
/* ---------------------------------------------------------------------- */

function TradeVisual() {
  const { showToast } = useToast();
  const [price] = useState(41.28);

  return (
    <div className="flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Sample holding
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-navy-900">SUNP</span>
          <span className="text-sm text-slate-500">SolarPeak Energy</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-2xl font-bold text-navy-900">${price.toFixed(2)}</span>
          <span className="badge bg-forest-500/10 text-forest-600">
            <TrendingUpIcon className="h-3 w-3" /> +2.4%
          </span>
        </div>
        <svg viewBox="0 0 160 40" className="mt-3 h-10 w-40 text-forest-500">
          <polyline
            className="animate-fade-in"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="0,30 20,28 40,32 60,20 80,24 100,14 120,18 140,6 160,10"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-3 sm:w-40">
        <button
          onClick={() => showToast("Simulated buy executed for SUNP — no real money moved.", "success")}
          className="btn-primary"
        >
          Buy
        </button>
        <button
          onClick={() => showToast("Simulated sell executed for SUNP.", "info")}
          className="btn-secondary"
        >
          Sell
        </button>
        <p className="text-center text-[11px] text-slate-400">Try it — fully simulated</p>
      </div>
    </div>
  );
}

function Donut({
  percent,
  color,
  label,
  sublabel,
}: {
  percent: number;
  color: string;
  label: string;
  sublabel: string;
}) {
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(percent), 80);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full transition-[background] duration-700 ease-out"
        style={{ background: `conic-gradient(${color} ${drawn * 3.6}deg, #e2e8f0 0deg)` }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-bold text-navy-900">
          <CountUp value={percent} suffix="%" duration={700} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-navy-900">{label}</div>
        <div className="text-[11px] text-slate-500">{sublabel}</div>
      </div>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-8">
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <Donut percent={22} color="#94a3b8" label="Before" sublabel="Clean-energy score" />
        <ArrowRightIcon className="h-5 w-5 flex-shrink-0 animate-pulse text-slate-400" />
        <Donut percent={61} color="#22945c" label="After" sublabel="Clean-energy score" />
      </div>
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-4 text-center">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-lg font-bold text-forest-600">
            <CountUp value={8.4} decimals={1} suffix="%" duration={800} />
          </div>
          <div className="text-[11px] text-slate-500">Weighted expected return</div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-lg font-bold text-navy-900">
            <CountUp value={14.2} decimals={1} suffix="%" duration={800} />
          </div>
          <div className="text-[11px] text-slate-500">Weighted volatility</div>
        </div>
      </div>
    </div>
  );
}

function GrowBar({ label, target, color }: { label: string; target: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(target), 80);
    return () => clearTimeout(t);
  }, [target]);
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>{label}</span>
        <span>{target}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ReallocateVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="space-y-4">
        <GrowBar label="Fossil fuel & low scorers (trimmed)" target={18} color="#94a3b8" />
        <GrowBar label="Clean-energy equities (added)" target={42} color="#22945c" />
        <GrowBar label="Green bond proxies (added)" target={25} color="#34b075" />
      </div>
      <div className="animate-pop-in mx-auto flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
        <SparklesIcon className="h-4 w-4" /> +2% simulated cash bonus on 8+/10 buys
      </div>
    </div>
  );
}

function GeminiVisual() {
  const [showReply, setShowReply] = useState(false);
  useEffect(() => {
    setShowReply(false);
    const t = setTimeout(() => setShowReply(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-navy-900 px-4 py-2 text-sm text-white shadow-sm">
        Why did my clean-energy score go up?
      </div>

      {!showReply ? (
        <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-500" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-500" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-500" style={{ animationDelay: "300ms" }} />
        </div>
      ) : (
        <div className="animate-fade-in-up flex max-w-[85%] items-start gap-2 rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <SparklesIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest-500" />
          Your reallocation trimmed two low-scoring holdings and shifted that
          cash into SUNP and a green bond proxy — both scoring 8+/10.
        </div>
      )}
    </div>
  );
}

function SearchVisual() {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setExpanded(false);
    const t = setTimeout(() => setExpanded(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div
        className={`flex h-10 items-center gap-2 overflow-hidden rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all duration-500 ease-out ${
          expanded ? "w-72" : "w-10 px-0 justify-center"
        }`}
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0 text-slate-400">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {expanded && (
          <span className="animate-fade-in truncate text-sm text-slate-500">solar</span>
        )}
      </div>

      {expanded && (
        <div className="animate-fade-in-up w-72 space-y-1.5 rounded-xl bg-white p-2 shadow-card">
          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
            <span className="font-medium text-navy-900">SUNP</span>
            <span className="text-xs text-slate-400">Stock</span>
          </div>
          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
            <span className="font-medium text-navy-900">Clean-Energy Reallocation</span>
            <span className="text-xs text-slate-400">Feature</span>
          </div>
        </div>
      )}
    </div>
  );
}
