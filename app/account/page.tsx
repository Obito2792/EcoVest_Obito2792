"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import GradientBanner from "@/components/GradientBanner";
import SamplePortfolioModal from "@/components/SamplePortfolioModal";
import CountUp from "@/components/CountUp";
import IconChip from "@/components/IconChip";
import { sectorIcon, sectorColor } from "@/components/sectorMeta";
import holdingsData from "@/data/holdings.json";
import { AccountSummary, Holding } from "@/lib/types";

const dataset = holdingsData as Holding[];

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <>
        <Header authed />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="skeleton mb-6 h-44 rounded-3xl" />
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="skeleton h-10 w-40 rounded-lg" />
            <div className="skeleton h-10 w-36 rounded-lg" />
            <div className="skeleton h-10 w-36 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <Header authed />
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-red-600">
          {error || "Could not load account."}
        </div>
      </>
    );
  }

  const rows = account.positions
    .map((p) => {
      const h = dataset.find((d) => d.ticker === p.ticker);
      const price = h?.price ?? 0;
      return {
        ticker: p.ticker,
        shares: p.shares,
        name: h?.name ?? p.ticker,
        sector: h?.sector ?? "Other",
        esgScore: h?.esgScore ?? 0,
        price,
        value: price * p.shares,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <Header authed />
      <main className="mx-auto max-w-5xl px-6 py-8">
        {account.firstName && (
          <h1 className="animate-fade-in-up mb-4 text-xl font-bold text-navy-900">
            Welcome back, {account.firstName}
          </h1>
        )}
        <div className="animate-fade-in-up mb-6">
          <GradientBanner
            gradient="from-navy-950 via-navy-900 to-forest-700"
            eyebrow="Simulated portfolio — not real money"
            heading={<CountUp value={account.totalValue} decimals={2} prefix="$" />}
            subheading={account.email}
            stats={[
              { value: `$${fmt(account.cashBalance)}`, label: "Cash" },
              { value: `$${fmt(account.holdingsValue)}`, label: "Holdings Value" },
              { value: `${account.positions.length}`, label: "Positions" },
            ]}
          />
        </div>

        <div
          className="animate-fade-in-up mb-6 flex flex-wrap gap-3"
          style={{ animationDelay: "60ms" }}
        >
          <button onClick={() => setShowSampleModal(true)} className="btn-primary">
            Try Sample Portfolio
          </button>
          <Link href="/browse" className="btn-secondary">
            Browse Stocks &amp; ETFs
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            View Dashboard
          </Link>
          <Link href="/transactions" className="btn-secondary">
            Transaction History
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <h3 className="mb-3 text-sm font-semibold text-navy-900">Your Holdings</h3>
          {rows.length === 0 ? (
            <div className="card-hover text-sm text-slate-500">
              You don&apos;t hold anything yet. Click <strong>Try Sample Portfolio</strong> above,
              or head to{" "}
              <Link href="/browse" className="text-forest-600 hover:underline">
                Browse
              </Link>{" "}
              to buy your first stock or ETF.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r, i) => (
                <div
                  key={r.ticker}
                  className="card-hover animate-fade-in-up"
                  style={{ animationDelay: `${140 + i * 40}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <IconChip icon={sectorIcon(r.sector)} color={sectorColor(r.sector)} />
                      <div>
                        <div className="font-semibold text-navy-900">{r.ticker}</div>
                        <div className="text-xs text-slate-500">{r.name}</div>
                      </div>
                    </div>
                    <span className="badge bg-slate-100 text-slate-600">ESG {r.esgScore}/10</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Shares</div>
                      <div className="text-sm font-medium text-navy-900">{r.shares}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Price</div>
                      <div className="text-sm font-medium text-navy-900">${r.price.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Value</div>
                      <div className="text-base font-bold text-forest-600">
                        <CountUp value={r.value} decimals={2} prefix="$" duration={500} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showSampleModal && (
        <SamplePortfolioModal
          onClose={() => setShowSampleModal(false)}
          onSuccess={(updated) => {
            setAccount(updated);
          }}
        />
      )}
    </>
  );
}
