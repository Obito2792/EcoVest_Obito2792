"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import IconChip from "./IconChip";
import { PieChartIcon } from "./Icons";

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

interface SectorPieChartProps {
  title: string;
  data: { sector: string; weight: number }[];
}

export default function SectorPieChart({ title, data }: SectorPieChartProps) {
  const chartData = data.map((d) => ({ name: d.sector, value: Math.round(d.weight * 1000) / 10 }));

  return (
    <div className="card h-full">
      <div className="mb-2 flex items-center gap-2">
        <IconChip icon={<PieChartIcon className="h-4 w-4" />} color="blue" size="sm" />
        <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={2}
            >
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
