"use client";

import { ReactNode } from "react";
import { ChipColor } from "@/components/IconChip";
import {
  ZapIcon,
  TrendingUpIcon,
  ShieldIcon,
  BuildingIcon,
  LayersIcon,
  LeafIcon,
  BarChartIcon,
  TargetIcon,
} from "@/components/Icons";

const SECTOR_ICON: Record<string, (props: { className?: string }) => JSX.Element> = {
  Technology: ZapIcon,
  Energy: TrendingUpIcon,
  Utilities: ShieldIcon,
  Financials: BuildingIcon,
  Industrials: LayersIcon,
  "Clean Energy": LeafIcon,
  "Consumer Staples": BarChartIcon,
  Healthcare: ShieldIcon,
  Materials: TargetIcon,
  "Green Bonds": LeafIcon,
};

const SECTOR_COLOR: Record<string, ChipColor> = {
  Technology: "blue",
  Energy: "amber",
  Utilities: "slate",
  Financials: "violet",
  Industrials: "slate",
  "Clean Energy": "green",
  "Consumer Staples": "rose",
  Healthcare: "rose",
  Materials: "slate",
  "Green Bonds": "green",
};

export function sectorIcon(sector: string, className = "h-5 w-5"): ReactNode {
  const Icon = SECTOR_ICON[sector] ?? TargetIcon;
  return <Icon className={className} />;
}

export function sectorColor(sector: string): ChipColor {
  return SECTOR_COLOR[sector] ?? "slate";
}
