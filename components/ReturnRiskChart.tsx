"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { PortfolioMetrics } from "@/lib/types";
import IconChip from "./IconChip";
import { BarChartIcon } from "./Icons";

interface ReturnRiskChartProps {
  original: PortfolioMetrics;
  suggested: PortfolioMetrics;
}

export default function ReturnRiskChart({ original, suggested }: ReturnRiskChartProps) {
  const data = [
    {
      metric: "Expected Return",
      Current: Math.round(original.expectedReturn * 1000) / 10,
      Suggested: Math.round(suggested.expectedReturn * 1000) / 10,
    },
    {
      metric: "Volatility (Risk)",
      Current: Math.round(original.volatility * 1000) / 10,
      Suggested: Math.round(suggested.volatility * 1000) / 10,
    },
  ];

  return (
    <div className="card h-full">
      <div className="mb-1 flex items-center gap-2">
        <IconChip icon={<BarChartIcon className="h-4 w-4" />} color="violet" size="sm" />
        <h3 className="text-sm font-semibold text-navy-900">
          Return &amp; Risk Comparison
        </h3>
      </div>
      <p className="mb-2 text-xs text-slate-500">
        Weighted-average annualized figures (%) — simulated, for illustration only
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="%" />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Current" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Suggested" fill="#22945c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
