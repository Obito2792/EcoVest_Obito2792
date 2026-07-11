"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import holdingsData from "@/data/holdings.json";
import { AccountSummary, Holding, PortfolioLine } from "@/lib/types";
import { generateReallocation } from "@/lib/reallocation";
import Header from "@/components/Header";
import SectorPieChart from "@/components/SectorPieChart";
import CleanEnergyGauge from "@/components/CleanEnergyGauge";
import ReturnRiskChart from "@/components/ReturnRiskChart";
import ReallocationPanel from "@/components/ReallocationPanel";
import EsgInsightCards from "@/components/EsgInsightCards";
import GradientBanner from "@/components/GradientBanner";
import CountUp from "@/components/CountUp";
import { useToast } from "@/components/Toast";

const dataset = holdingsData as Holding[];

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  async function loadAccount() {
    try {
      const res = await fetch("/api/account");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load account.");
      if (!json.profileComplete) {
        router.push("/profile");
        return;
      }
      setAccount(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const portfolioLines: PortfolioLine[] = useMemo(() => {
    if (!account) return [];
    return account.positions.map((p) => {
      const h = dataset.find((d) => d.ticker === p.ticker);
      return { ticker: p.ticker, weight: (h?.price ?? 0) * p.shares };
    });
  }, [account]);

  const reallocation = useMemo(() => {
    if (portfolioLines.length === 0) return null;
    return generateReallocation(portfolioLines, dataset, account?.interests ?? []);
  }, [portfolioLines, account?.interests]);

  async function handleApply() {
    setApplying(true);
    setApplyMessage(null);
    try {
      const res = await fetch("/api/reallocation/apply", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to apply reallocation.");
      setAccount(json.account);
      const bonusTotal = ((json.bonuses ?? []) as { amount: number }[]).reduce(
        (sum, b) => sum + b.amount,
        0
      );
      const message =
        `Applied ${json.executed.length} trade${
          json.executed.length === 1 ? "" : "s"
        } against your simulated account.` +
        (bonusTotal > 0 ? ` 🌱 +$${bonusTotal.toFixed(2)} in clean-energy bonuses!` : "");
      setApplyMessage(message);
      showToast(message, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to apply reallocation.";
      setApplyMessage(message);
      showToast(message, "error");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header authed />
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-slate-500">
          Loading your dashboard…
        </div>
      </>
    );
  }

  if (error && !account) {
    return (
      <>
        <Header authed />
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-red-600">{error}</div>
      </>
    );
  }

  if (!reallocation || !account) {
    return (
      <>
        <Header authed />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy-900">Nothing to analyze yet</h1>
          <p className="mt-2 text-slate-500">
            Load the sample portfolio or buy a few stocks and ETFs to see your
            clean-energy dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/account" className="btn-primary">
              Go to Account
            </Link>
            <Link href="/browse" className="btn-secondary">
              Browse Stocks &amp; ETFs
            </Link>
          </div>
        </div>
      </>
    );
  }

  const capitalShifted = reallocation.moves
    .filter((m) => m.delta > 0)
    .reduce((sum, m) => sum + m.delta, 0);

  const esgDelta =
    reallocation.suggestedMetrics.esgScore - reallocation.originalMetrics.esgScore;
  const returnDelta =
    reallocation.suggestedMetrics.expectedReturn - reallocation.originalMetrics.expectedReturn;
  const capitalDollars = capitalShifted * account.holdingsValue;

  return (
    <>
      <Header authed />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {account.firstName && (
          <h1 className="animate-fade-in-up mb-4 text-xl font-bold text-navy-900">
            Welcome back, {account.firstName}
          </h1>
        )}
        <div className="animate-fade-in-up mb-6">
          <GradientBanner
            gradient="from-blue-600 via-forest-600 to-forest-500"
            eyebrow="Clean-energy capital tilt"
            heading="Real capital, steered toward clean energy"
            subheading={`This reallocation shifts ${formatUsd(
              capitalDollars
            )} of your simulated ${formatUsd(
              account.holdingsValue
            )} in holdings from low clean-energy-score positions into clean-energy equities and green bond proxies — real reallocation, not just a behavior nudge.`}
            stats={[
              {
                value: `$${capitalDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                label: "Capital Shifted",
              },
              { value: `${esgDelta >= 0 ? "+" : ""}${esgDelta.toFixed(1)}`, label: "Clean-Energy Score" },
              { value: `${returnDelta >= 0 ? "+" : ""}${(returnDelta * 100).toFixed(1)}%`, label: "Expected Return" },
            ]}
          >
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="rounded-xl bg-white/15 px-6 py-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  <CountUp value={capitalDollars} prefix="$" duration={800} />
                </div>
                <div className="text-xs text-white/80">Live Capital Shifted</div>
              </div>
            </div>
          </GradientBanner>
        </div>

        {applyMessage && (
          <div className="animate-fade-in-up mb-6 rounded-lg border border-forest-500/20 bg-forest-500/5 px-4 py-3 text-sm text-navy-900">
            {applyMessage}
          </div>
        )}

        <div className="mb-6 grid gap-6 lg:grid-cols-4">
          <div className="lift-hover animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <SectorPieChart
              title="Sector Breakdown — Current"
              data={reallocation.originalMetrics.sectorBreakdown}
            />
          </div>
          <div className="lift-hover animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <SectorPieChart
              title="Sector Breakdown — Suggested"
              data={reallocation.suggestedMetrics.sectorBreakdown}
            />
          </div>
          <div className="lift-hover animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <CleanEnergyGauge
              originalScore={reallocation.originalMetrics.esgScore}
              suggestedScore={reallocation.suggestedMetrics.esgScore}
            />
          </div>
          <div className="lift-hover animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            <ReturnRiskChart
              original={reallocation.originalMetrics}
              suggested={reallocation.suggestedMetrics}
            />
          </div>
        </div>

        <div className="animate-fade-in-up mb-6" style={{ animationDelay: "220ms" }}>
          <ReallocationPanel
            moves={reallocation.moves}
            dataset={dataset}
            onApply={handleApply}
            applying={applying}
          />
        </div>

        <div className="animate-fade-in-up mb-24" style={{ animationDelay: "260ms" }}>
          <EsgInsightCards
            flaggedTickers={reallocation.flaggedTickers}
            dataset={dataset}
            originalMetrics={reallocation.originalMetrics}
            suggestedMetrics={reallocation.suggestedMetrics}
            moves={reallocation.moves}
          />
        </div>
      </main>
    </>
  );
}
