"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  PricePoint,
  RangeKey,
  formatRangeAxisLabel,
  formatRangeTooltipLabel,
} from "@/lib/priceHistory";

interface StockPriceChartProps {
  ticker: string;
  series: PricePoint[];
  range: RangeKey;
  isPositive: boolean;
}

const POSITIVE_COLOR = "#22945c";
const NEGATIVE_COLOR = "#dc2626";

export default function StockPriceChart({ ticker, series, range, isPositive }: StockPriceChartProps) {
  const color = isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;
  const gradientId = `chart-${ticker}`;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v: number) => formatRangeAxisLabel(v, range)}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            width={54}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
            labelFormatter={(v: number) => formatRangeTooltipLabel(v, range)}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
