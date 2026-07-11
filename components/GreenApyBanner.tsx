"use client";

import Link from "next/link";
import {
  GreenApyStatus,
  GREEN_APY_MIN_SHARE,
  formatApyRate,
  formatGreenApyThreshold,
  formatGreenSharePercent,
} from "@/lib/apy";

interface GreenApyBannerProps {
  status: GreenApyStatus;
}

export default function GreenApyBanner({ status }: GreenApyBannerProps) {
  const { eligible, greenShare, holdingsValue } = status;
  const sharePct = formatGreenSharePercent(greenShare);
  const thresholdPct = formatGreenApyThreshold();
  const progress = Math.min(100, (greenShare / GREEN_APY_MIN_SHARE) * 100);

  // No holdings yet — invite them to get started rather than showing 0% progress.
  if (holdingsValue === 0) {
    return (
      <div className="animate-fade-in-up rounded-2xl border border-forest-200 bg-forest-50 p-5">
        <span className="badge bg-forest-500/10 text-forest-600">🌿 Green Portfolio APY</span>
        <p className="mt-2 text-sm text-forest-800">
          Hold {thresholdPct}%+ of your portfolio in stocks and ETFs rated 8+/10
          on clean energy, and your account becomes eligible for a simulated{" "}
          <span className="font-semibold">{formatApyRate()} APY</span>. Load the
          sample portfolio or buy a few clean-energy holdings to get started.
        </p>
        <Link href="/browse" className="btn-primary mt-3 inline-flex">
          Browse Stocks &amp; ETFs
        </Link>
      </div>
    );
  }

  if (eligible) {
    return (
      <div className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-forest-400/40 bg-gradient-to-br from-forest-700 via-forest-800 to-forest-900 p-5 shadow-glow-green">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-forest-400/20 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge bg-white/15 text-white">🌿 Green Portfolio APY</span>
            <h3 className="mt-2 text-lg font-bold text-white">
              You&apos;re eligible for {formatApyRate()} APY
            </h3>
            <p className="mt-1 max-w-md text-sm text-forest-100">
              {sharePct}% of your portfolio is rated 8+/10 on clean energy —
              above the {thresholdPct}% bar. Simulated only, credited for
              illustration purposes.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{formatApyRate()}</div>
            <div className="text-xs uppercase tracking-wide text-forest-200">
              Simulated APY
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up rounded-2xl border border-forest-200 bg-forest-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="badge bg-forest-500/10 text-forest-600">🌿 Green Portfolio APY</span>
          <h3 className="mt-2 text-base font-semibold text-forest-900">
            Get to {thresholdPct}% green to unlock {formatApyRate()} APY
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {sharePct}% of your portfolio is currently rated 8+/10 on clean
            energy.
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary flex-shrink-0">
          See Reallocation
        </Link>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-forest-100">
        <div
          className="h-full rounded-full bg-forest-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
