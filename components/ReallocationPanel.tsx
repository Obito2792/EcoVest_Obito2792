"use client";

import { Holding, ReallocationMove } from "@/lib/types";
import IconChip from "./IconChip";
import { ArrowsShuffleIcon } from "./Icons";

interface ReallocationPanelProps {
  moves: ReallocationMove[];
  dataset: Holding[];
  onApply?: () => void;
  applying?: boolean;
  applyDisabled?: boolean;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export default function ReallocationPanel({
  moves,
  dataset,
  onApply,
  applying,
  applyDisabled,
}: ReallocationPanelProps) {
  const map = new Map(dataset.map((h) => [h.ticker, h]));
  const sorted = [...moves].sort((a, b) => b.delta - a.delta);

  return (
    <div className="card-hover">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IconChip icon={<ArrowsShuffleIcon className="h-4 w-4" />} color="amber" size="sm" />
          <h3 className="text-sm font-semibold text-navy-900">
            Suggested Reallocation — Before vs. After
          </h3>
        </div>
        {onApply && (
          <button
            onClick={onApply}
            disabled={applying || applyDisabled}
            className="btn-primary text-sm"
          >
            {applying ? "Applying trades…" : "Apply Reallocation"}
          </button>
        )}
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Weight shifted from bottom-quartile clean-energy scorers into top-scoring
        equities and green bond proxies. Illustrative only.
        {onApply &&
          " \"Apply Reallocation\" executes the trades below against your simulated account."}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Holding</th>
              <th className="py-2 pr-3">Sector</th>
              <th className="py-2 pr-3">Clean-Energy Score</th>
              <th className="py-2 pr-3">Before</th>
              <th className="py-2 pr-3">After</th>
              <th className="py-2 pr-3">Change</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const h = map.get(m.ticker);
              const isIncrease = m.delta > 0.0001;
              const isDecrease = m.delta < -0.0001;
              return (
                <tr key={m.ticker} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3 font-medium text-navy-900">
                    {m.ticker}
                    <div className="text-xs font-normal text-slate-500">{m.name}</div>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{h?.sector ?? "—"}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`badge ${
                        (h?.esgScore ?? 0) >= 7.5
                          ? "bg-forest-500/10 text-forest-600"
                          : (h?.esgScore ?? 0) >= 5
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {h?.esgScore ?? "—"}/10
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{pct(m.fromWeight)}</td>
                  <td className="py-2 pr-3 font-medium text-navy-900">{pct(m.toWeight)}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        isIncrease
                          ? "font-medium text-forest-600"
                          : isDecrease
                          ? "font-medium text-red-600"
                          : "text-slate-400"
                      }
                    >
                      {isIncrease ? "▲ +" : isDecrease ? "▼ " : ""}
                      {pct(Math.abs(m.delta))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
