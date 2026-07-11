"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import holdingsData from "@/data/holdings.json";
import samplePortfolio from "@/data/samplePortfolio.json";
import { AccountSummary, Holding } from "@/lib/types";
import IconChip from "./IconChip";
import { LayersIcon } from "./Icons";
import { sectorIcon, sectorColor } from "./sectorMeta";
import { useToast } from "./Toast";

const dataset = holdingsData as Holding[];

const COLORS = [
  "#22945c",
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#e11d48",
  "#34b075",
  "#0f1f38",
  "#a3e4c4",
  "#475569",
];

interface SamplePortfolioModalProps {
  onClose: () => void;
  onSuccess: (account: AccountSummary) => void;
}

export default function SamplePortfolioModal({ onClose, onSuccess }: SamplePortfolioModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const rows = samplePortfolio
    .map((line) => {
      const h = dataset.find((d) => d.ticker === line.ticker);
      return h ? { ...line, name: h.name, sector: h.sector, esgScore: h.esgScore } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.weight - a.weight);

  const sectorTotals = new Map<string, number>();
  for (const r of rows) {
    sectorTotals.set(r.sector, (sectorTotals.get(r.sector) ?? 0) + r.weight);
  }
  const chartData = Array.from(sectorTotals.entries()).map(([name, value]) => ({
    name,
    value: Math.round(value * 1000) / 10,
  }));

  const weightedEsg =
    rows.reduce((sum, r) => sum + r.esgScore * r.weight, 0) /
    rows.reduce((sum, r) => sum + r.weight, 0);

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio/sample", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load sample portfolio.");
      onSuccess(json as AccountSummary);
      const bonusTotal = ((json.bonuses ?? []) as { amount: number }[]).reduce(
        (sum, b) => sum + b.amount,
        0
      );
      showToast(
        bonusTotal > 0
          ? `Sample portfolio loaded — 13 holdings purchased. 🌱 +$${bonusTotal.toFixed(2)} in clean-energy bonuses!`
          : "Sample portfolio loaded — 13 holdings purchased.",
        "success"
      );
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load sample portfolio.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="animate-pop-in max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center gap-3">
          <IconChip icon={<LayersIcon className="h-5 w-5" />} color="green" />
          <div>
            <h3 className="text-base font-semibold text-navy-900">Preview: Sample Portfolio</h3>
            <p className="text-xs text-slate-500">
              13 holdings · weighted clean-energy score {weightedEsg.toFixed(1)}/10
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {chartData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="max-h-64 space-y-1.5 overflow-y-auto sm:col-span-3">
            {rows.map((r, i) => (
              <div
                key={r.ticker}
                className="animate-fade-in-up flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <IconChip icon={sectorIcon(r.sector, "h-4 w-4")} color={sectorColor(r.sector)} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-navy-900">
                    {r.ticker} <span className="font-normal text-slate-400">{r.name}</span>
                  </div>
                </div>
                <span className="badge bg-slate-100 text-slate-600">
                  {(r.weight * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Confirming buys these 13 holdings against your simulated cash balance in one batch of
          trades — same trade engine as a manual order. No real money moves.
        </p>

        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
            {loading ? "Loading…" : "Confirm & Load Portfolio"}
          </button>
        </div>
      </div>
    </div>
  );
}
