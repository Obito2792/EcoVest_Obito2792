"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import IconChip from "@/components/IconChip";
import TradeModal from "@/components/TradeModal";
import StockPriceChart from "@/components/StockPriceChart";
import BonusBadge from "@/components/BonusBadge";
import { sectorIcon, sectorColor } from "@/components/sectorMeta";
import { isGreenBonusEligible } from "@/lib/bonus";
import {
  generateRangeSeries,
  seriesChangePercent,
  RANGE_KEYS,
  RANGE_META,
  RangeKey,
} from "@/lib/priceHistory";
import holdingsData from "@/data/holdings.json";
import { AccountSummary, Holding } from "@/lib/types";

const dataset = holdingsData as Holding[];

export default function StockDetailPage() {
  const params = useParams<{ ticker: string }>();
  const router = useRouter();
  const ticker = (params.ticker ?? "").toUpperCase();
  const holding = dataset.find((h) => h.ticker === ticker);

  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [modal, setModal] = useState<{ side: "BUY" | "SELL" } | null>(null);
  const [range, setRange] = useState<RangeKey>("1D");

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

  const series = useMemo(() => {
    if (!holding) return [];
    return generateRangeSeries(holding.ticker, holding.avgReturn, holding.volatility, holding.price, range);
  }, [holding, range]);

  if (!holding) {
    return (
      <>
        <Header authed />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy-900">Stock not found</h1>
          <p className="mt-2 text-slate-500">
            We don&apos;t have a holding matching &quot;{ticker}&quot;.
          </p>
          <Link href="/browse" className="btn-primary mt-6 inline-block">
            Browse Stocks &amp; ETFs
          </Link>
        </div>
      </>
    );
  }

  const changePercent = seriesChangePercent(series);
  const isPositive = changePercent >= 0;
  const changeColor = isPositive ? "text-forest-600" : "text-red-600";
  const heldShares = account?.positions.find((p) => p.ticker === holding.ticker)?.shares ?? 0;

  return (
    <>
      <Header authed />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm font-medium text-slate-500 hover:text-navy-900"
        >
          ← Back
        </button>

        <div className="animate-fade-in-up card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <IconChip icon={sectorIcon(holding.sector)} color={sectorColor(holding.sector)} />
              <div>
                <h1 className="text-2xl font-bold text-navy-900">{holding.ticker}</h1>
                <div className="text-sm text-slate-500">{holding.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-navy-900">${holding.price.toFixed(2)}</div>
              <div className={`text-sm font-medium ${changeColor}`}>
                {isPositive ? "▲" : "▼"} {Math.abs(changePercent * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="badge bg-slate-100 text-slate-600">{holding.sector}</span>
            <span className="badge bg-slate-100 text-slate-600">{holding.assetClass}</span>
            <span
              className={`badge ${
                holding.esgScore >= 7.5
                  ? "bg-forest-500/10 text-forest-600"
                  : holding.esgScore >= 5
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {holding.esgScore}/10 ESG
            </span>
            {isGreenBonusEligible(holding) && (
              <BonusBadge ticker={holding.ticker} price={holding.price} />
            )}
            {heldShares > 0 && (
              <span className="badge bg-blue-100 text-blue-700">You hold {heldShares} shares</span>
            )}
          </div>

          <div className="mt-6">
            <StockPriceChart
              ticker={holding.ticker}
              series={series}
              range={range}
              isPositive={isPositive}
            />
            <div className="mt-3 flex items-center justify-center gap-1 rounded-full bg-slate-100 p-1">
              {RANGE_KEYS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    range === r
                      ? "bg-white text-navy-900 shadow-sm"
                      : "text-slate-500 hover:text-navy-900"
                  }`}
                >
                  {RANGE_META[r].label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">
              Simulated price history — for illustration only, not real market data.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-xs text-slate-400">Avg. Annual Return</div>
              <div className="text-sm font-semibold text-navy-900">
                {(holding.avgReturn * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Volatility</div>
              <div className="text-sm font-semibold text-navy-900">
                {(holding.volatility * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Clean-Energy Score</div>
              <div className="text-sm font-semibold text-navy-900">{holding.esgScore}/10</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Asset Class</div>
              <div className="text-sm font-semibold text-navy-900">{holding.assetClass}</div>
            </div>
          </div>

          {holding.interestTags.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Clean-Energy Categories
              </div>
              <div className="flex flex-wrap gap-1.5">
                {holding.interestTags.map((tag) => (
                  <span key={tag} className="badge bg-violet-100 text-violet-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sustainability Report Excerpt
            </div>
            <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {holding.excerpt}
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setModal({ side: "BUY" })} className="btn-primary flex-1">
              Buy
            </button>
            <button
              onClick={() => setModal({ side: "SELL" })}
              disabled={heldShares === 0}
              className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sell
            </button>
          </div>
        </div>
      </main>

      {modal && account && (
        <TradeModal
          holding={holding}
          side={modal.side}
          heldShares={heldShares}
          cashBalance={account.cashBalance}
          onClose={() => setModal(null)}
          onSuccess={(updated) => setAccount(updated)}
        />
      )}
    </>
  );
}
