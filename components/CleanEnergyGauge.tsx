"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import IconChip from "./IconChip";
import { GaugeIcon } from "./Icons";

function scoreColor(score: number): string {
  if (score >= 7.5) return "#22945c";
  if (score >= 5) return "#eab308";
  return "#dc2626";
}

interface GaugeProps {
  label: string;
  score: number;
}

function Gauge({ label, score }: GaugeProps) {
  const data = [{ name: "score", value: score, fill: scoreColor(score) }];

  return (
    <div className="flex flex-col items-center">
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="90%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={16}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 10]} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-10 text-2xl font-bold text-navy-900">{score.toFixed(1)}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}

interface CleanEnergyGaugeProps {
  originalScore: number;
  suggestedScore: number;
}

export default function CleanEnergyGauge({
  originalScore,
  suggestedScore,
}: CleanEnergyGaugeProps) {
  const delta = suggestedScore - originalScore;

  return (
    <div className="card h-full">
      <div className="mb-1 flex items-center gap-2">
        <IconChip icon={<GaugeIcon className="h-4 w-4" />} color="green" size="sm" />
        <h3 className="text-sm font-semibold text-navy-900">
          Clean-Energy Tilt Score
        </h3>
      </div>
      <p className="mb-2 text-xs text-slate-500">
        Weighted average ESG / clean-energy alignment, scale 1–10
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Gauge label="Current" score={originalScore} />
        <Gauge label="Suggested" score={suggestedScore} />
      </div>
      <div className="mt-1 text-center">
        <span
          className={`badge ${
            delta >= 0 ? "bg-forest-500/10 text-forest-600" : "bg-red-50 text-red-600"
          }`}
        >
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(1)} pts clean-energy tilt
        </span>
      </div>
    </div>
  );
}
