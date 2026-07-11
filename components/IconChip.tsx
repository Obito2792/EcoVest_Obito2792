"use client";

import { ReactNode } from "react";

export type ChipColor = "green" | "blue" | "violet" | "amber" | "rose" | "slate";

const COLOR_STYLES: Record<ChipColor, string> = {
  green: "bg-forest-500/10 text-forest-600",
  blue: "bg-blue-100 text-blue-600",
  violet: "bg-violet-100 text-violet-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};

interface IconChipProps {
  icon: ReactNode;
  color?: ChipColor;
  size?: "sm" | "md";
}

export default function IconChip({ icon, color = "green", size = "md" }: IconChipProps) {
  const sizeClass = size === "sm" ? "h-9 w-9 rounded-lg" : "h-11 w-11 rounded-xl";
  return (
    <div className={`flex flex-shrink-0 items-center justify-center ${sizeClass} ${COLOR_STYLES[color]}`}>
      {icon}
    </div>
  );
}
