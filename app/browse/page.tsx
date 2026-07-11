"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import TradeModal from "@/components/TradeModal";
import IconChip from "@/components/IconChip";
import CountUp from "@/components/CountUp";
import { sectorIcon, sectorColor } from "@/components/sectorMeta";
import StockSparkline from "@/components/StockSparkline";
import BonusBadge from "@/components/BonusBadge";
import { SparklesIcon, TargetIcon } from "@/components/Icons";
import { isGreenBonusEligible, formatBonusPercent } from "@/lib/bonus";
import { generatePriceSeries, seriesChangePercent } from "@/lib/priceHistory";
import holdingsData from "@/data/holdings.json";
import { AccountSummary, Holding } from "@/lib/types";

const dataset = holdingsData as Holding[];

export default function BrowsePage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [modal, setModal] = useState<{ holding: Holding; side: "BUY" | "SELL" } | null>(null);

  async function loadAccount() {
    const res = await fetch("/api/account");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const json = await res.json();
    if (res.ok) {
      if (!json.profileComplete) {
        router.push("/profile");
        return;
      }
      setAccount(json);
    }
  }

  useEffect(() => {
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function heldShares(ticker: string): number {
    return account?.positions.find((p) => p.ticker === ticker)?.shares ?? 0;
  }

  const recommended = account?.interests?.length
    ? dataset
        .filter((h) => h.interestTags.some((tag) => account.interests.includes(tag)))
        .sort((a, b) => b.esgScore - a.esgScore)
        .slice(0, 6)
    : [];

  // Worth keeping an eye on for one of three reasons — a strong clean-energy
  // score, a weak one (a reallocation candidate), or high volatility (a
  // stock that moves a lot). Pulled from holdings the user doesn't already
  // hold and that aren't already surfaced in Recommended For You, so the
  // sections don't duplicate cards. Each bucket is capped individually so
  // one reason can't crowd out the others; overlapping picks (e.g. a stock
  // that's both high-ESG and high-volatility) keep whichever reason found
  // them first.
  const recommendedTickers = new Set(recommended.map((h) => h.ticker));
  const watchlistEligible = dataset.filter(
    (h) => heldShares(h.ticker) === 0 && !recommendedTickers.has(h.ticker)
  );

  const highEsgPicks = [...watchlistEligible]
    .filter((h) => isGreenBonusEligible(h))
    .sort((a, b) => b.esgScore - a.esgScore)
    .slice(0, 3)
    .map((h) => ({ holding: h, reason: "High clean-energy score" as const }));

  const highVolPicks = [...watchlistEligible]
    .sort((a, b) => b.volatility - a.volatility)
    .slice(0, 3)
    .map((h) => ({ holding: h, reason: "High volatility" as const }));

  const lowEsgPicks = [...watchlistEligible]
    .filter((h) => h.esgScore < 5)
    .sort((a, b) => a.esgScore - b.esgScore)
    .slice(0, 3)
    .map((h) => ({ holding: h, reason: "Low clean-energy score" as const }));

  const seenTickers = new Set<string>();
  const watchlist: { holding: Holding; reason: string }[] = [];
  for (const pick of [...highEsgPicks, ...highVolPicks, ...lowEsgPicks]) {
    if (seenTickers.has(pick.holding.ticker)) continue;
    seenTickers.add(pick.holding.ticker);
    watchlist.push(pick);
  }

  const REASON_BADGE_STYLE: Record<string, string> = {
    "High clean-energy score": "bg-forest-500/10 text-forest-600",
    "Low clean-energy score": "bg-red-50 text-red-600",
    "High volatility": "bg-amber-100 text-amber-700",
  };

  return (
    <>
      <Header authed />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="animate-fade-in-up mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Browse Stocks &amp; ETFs</h1>
            <p className="text-sm text-slate-500">
              19 mock holdings, each with a clean-energy/ESG score. Trades fill
              instantly at the listed price — simulated only. Holdings marked{" "}
              <span className="whitespace-nowrap font-medium text-forest-600">🌱 Bonus</span> earn a{" "}
              {formatBonusPercent()} simulated cash bonus when you buy them.
            </p>
          </div>
          {account && (
            <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm">
              <span className="text-slate-500">Cash: </span>
              <span className="font-semibold text-navy-900">
                <CountUp value={account.cashBalance} decimals={2} prefix="$" duration={500} />
              </span>
            </div>
          )}
        </div>

        {recommended.length > 0 && (
          <div className="animate-fade-in-up mb-6" style={{ animationDelay: "40ms" }}>
            <div className="mb-3 flex items-center gap-2">
              <IconChip icon={<SparklesIcon className="h-4 w-4" />} color="violet" size="sm" />
              <h2 className="text-sm font-semibold text-navy-900">Recommended For You</h2>
              <span className="badge bg-violet-100 text-violet-700">
                Matches your interests
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recommended.map((h, i) => {
                const shares = heldShares(h.ticker);
                const matchedTags = h.interestTags.filter((t) => account?.interests.includes(t));
                return (
                  <div
                    key={h.ticker}
                    className="card-hover animate-fade-in-up w-64 flex-shrink-0"
                    style={{ animationDelay: `${80 + i * 40}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconChip icon={sectorIcon(h.sector, "h-4 w-4")} color={sectorColor(h.sector)} size="sm" />
                        <div>
                          <Link
                            href={`/stock/${h.ticker}`}
                            className="font-semibold text-navy-900 hover:text-forest-600 hover:underline"
                          >
                            {h.ticker}
                          </Link>
                          <div className="text-xs text-slate-500">{h.sector}</div>
                        </div>
                      </div>
                      <span className="badge bg-forest-500/10 text-forest-600">{h.esgScore}/10</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {isGreenBonusEligible(h) && (
                        <BonusBadge ticker={h.ticker} price={h.price} size="sm" />
                      )}
                      {matchedTags.map((t) => (
                        <span key={t} className="badge bg-violet-100 text-xs text-violet-700">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-navy-900">${h.price.toFixed(2)}</span>
                      <button
                        onClick={() => setModal({ holding: h, side: "BUY" })}
                        className="rounded-lg bg-forest-500 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-forest-600 hover:shadow-glow-green active:translate-y-0"
                      >
                        {shares > 0 ? "Buy more" : "Buy"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {watchlist.length > 0 && (
          <div className="animate-fade-in-up mb-6" style={{ animationDelay: "50ms" }}>
            <div className="mb-3 flex items-center gap-2">
              <IconChip icon={<TargetIcon className="h-4 w-4" />} color="blue" size="sm" />
              <h2 className="text-sm font-semibold text-navy-900">Watchlist</h2>
              <span className="badge bg-blue-100 text-blue-700">Worth keeping an eye on</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {watchlist.map(({ holding: h, reason }, i) => {
                const series = generatePriceSeries(h.ticker, h.avgReturn, h.volatility, h.price);
                const changePercent = seriesChangePercent(series);
                const isPositive = changePercent >= 0;
                return (
                  <Link
                    key={h.ticker}
                    href={`/stock/${h.ticker}`}
                    className="card-hover !cursor-pointer animate-fade-in-up flex w-60 flex-shrink-0 flex-col"
                    style={{ animationDelay: `${90 + i * 40}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <IconChip icon={sectorIcon(h.sector, "h-4 w-4")} color={sectorColor(h.sector)} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-navy-900">{h.ticker}</div>
                          <div className="line-clamp-2 text-xs leading-snug text-slate-500">
                            {h.name}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 badge ${
                          h.esgScore >= 7.5
                            ? "bg-forest-500/10 text-forest-600"
                            : h.esgScore >= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {h.esgScore}/10
                      </span>
                    </div>
                    <span
                      className={`badge mt-2.5 w-fit text-xs ${REASON_BADGE_STYLE[reason]}`}
                    >
                      {reason}
                    </span>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="text-sm font-medium text-navy-900">${h.price.toFixed(2)}</span>
                      <span
                        className={`text-xs font-semibold ${
                          isPositive ? "text-forest-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? "▲" : "▼"} {Math.abs(changePercent * 100).toFixed(1)}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div
          className="animate-fade-in-up card overflow-x-auto"
          style={{ animationDelay: "60ms" }}
        >
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-1">Ticker</th>
                <th className="py-2 pr-3">Trend</th>
                <th className="py-2 pr-3">Sector</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Clean-Energy Score</th>
                <th className="py-2 pr-3">You Hold</th>
                <th className="py-2 pr-3 text-right">Trade</th>
              </tr>
            </thead>
            <tbody>
              {dataset.map((h, i) => {
                const shares = heldShares(h.ticker);
                return (
                  <tr
                    key={h.ticker}
                    className="animate-fade-in-up border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                    style={{ animationDelay: `${100 + i * 25}ms` }}
                  >
                    <td className="py-2 pr-1 font-medium text-navy-900">
                      <div className="flex items-center gap-2.5">
                        <IconChip icon={sectorIcon(h.sector, "h-4 w-4")} color={sectorColor(h.sector)} size="sm" />
                        <div>
                          <Link
                            href={`/stock/${h.ticker}`}
                            className="hover:text-forest-600 hover:underline"
                          >
                            {h.ticker}
                          </Link>
                          <div className="text-xs font-normal text-slate-500">{h.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <StockSparkline
                        ticker={h.ticker}
                        avgReturn={h.avgReturn}
                        volatility={h.volatility}
                        price={h.price}
                      />
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{h.sector}</td>
                    <td className="py-2 pr-3">${h.price.toFixed(2)}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`badge ${
                            h.esgScore >= 7.5
                              ? "bg-forest-500/10 text-forest-600"
                              : h.esgScore >= 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {h.esgScore}/10
                        </span>
                        {isGreenBonusEligible(h) && (
                          <BonusBadge ticker={h.ticker} price={h.price} />
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-slate-600">
                      {shares > 0 ? `${shares} shares` : "—"}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setModal({ holding: h, side: "BUY" })}
                          className="rounded-lg bg-forest-500 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-forest-600 hover:shadow-glow-green active:translate-y-0"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => setModal({ holding: h, side: "SELL" })}
                          disabled={shares === 0}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy-900 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-glow-slate active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {modal && account && (
        <TradeModal
          holding={modal.holding}
          side={modal.side}
          heldShares={heldShares(modal.holding.ticker)}
          cashBalance={account.cashBalance}
          onClose={() => setModal(null)}
          onSuccess={(updated) => setAccount(updated)}
        />
      )}
    </>
  );
}
