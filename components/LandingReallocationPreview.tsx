"use client";

import { useEffect, useState } from "react";
import holdingsData from "@/data/holdings.json";
import samplePortfolio from "@/data/samplePortfolio.json";
import { Holding } from "@/lib/types";
import { generateReallocation } from "@/lib/reallocation";

const dataset = holdingsData as Holding[];

// Same sample portfolio used by "Try Sample Portfolio" — real numbers from the
// actual reallocation engine, not mocked-up chart data.
const reallocation = generateReallocation(samplePortfolio, dataset);

interface MetricRow {
  label: string;
  before: number;
  after: number;
  max: number;
  format: (n: number) => string;
  higherIsBetter: boolean;
}

const rows: MetricRow[] = [
  {
    label: "Clean-Energy Score",
    before: reallocation.originalMetrics.esgScore,
    after: reallocation.suggestedMetrics.esgScore,
    max: 10,
    format: (n) => `${n.toFixed(1)}/10`,
    higherIsBetter: true,
  },
  {
    label: "Expected Return",
    before: reallocation.originalMetrics.expectedReturn * 100,
    after: reallocation.suggestedMetrics.expectedReturn * 100,
    max: 20,
    format: (n) => `${n.toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    label: "Volatility",
    before: reallocation.originalMetrics.volatility * 100,
    after: reallocation.suggestedMetrics.volatility * 100,
    max: 30,
    format: (n) => `${n.toFixed(1)}%`,
    higherIsBetter: false,
  },
];

export default function LandingReallocationPreview() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex aspect-square flex-col justify-center gap-6 rounded-3xl bg-gradient-to-br from-navy-900 to-forest-600 p-8 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Sample Reallocation
          </div>
          <div className="text-sm text-white/80">Current vs. suggested holdings</div>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          Live math
        </span>
      </div>

      <div className="space-y-5">
        {rows.map((row) => {
          const delta = row.after - row.before;
          const improved = row.higherIsBetter ? delta > 0 : delta < 0;
          return (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs text-white/70">
                <span>{row.label}</span>
                <span
                  className={`font-semibold ${
                    delta === 0 ? "text-white/60" : improved ? "text-forest-300" : "text-amber-300"
                  }`}
                >
                  {row.format(row.before)} → {row.format(row.after)}
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/40 transition-all duration-700 ease-out"
                    style={{ width: animated ? `${Math.min(100, (row.before / row.max) * 100)}%` : "0%" }}
                  />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-forest-400 transition-all duration-700 ease-out"
                    style={{
                      width: animated ? `${Math.min(100, (row.after / row.max) * 100)}%` : "0%",
                      transitionDelay: "80ms",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-white/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/40" /> Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-forest-400" /> Suggested
        </span>
      </div>
    </div>
  );
}
