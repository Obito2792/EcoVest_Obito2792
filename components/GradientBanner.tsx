"use client";

import { ReactNode } from "react";

interface StatPillItem {
  label: string;
  value: string;
}

interface GradientBannerProps {
  gradient?: string;
  eyebrow?: string;
  heading: ReactNode;
  subheading?: string;
  stats?: StatPillItem[];
  children?: ReactNode;
  className?: string;
}

export default function GradientBanner({
  gradient = "from-blue-600 via-blue-500 to-forest-500",
  eyebrow,
  heading,
  subheading,
  stats,
  children,
  className = "",
}: GradientBannerProps) {
  return (
    <div
      className={`rounded-3xl bg-gradient-to-br px-6 py-12 text-center text-white shadow-lg sm:px-12 ${gradient} ${className}`}
    >
      {eyebrow && (
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{heading}</h2>
      {subheading && (
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">{subheading}</p>
      )}
      {stats && stats.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white/15 px-6 py-3 backdrop-blur-sm"
            >
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-white/80">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
