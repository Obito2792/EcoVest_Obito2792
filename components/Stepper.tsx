"use client";

import { useState } from "react";
import { ChipColor } from "./IconChip";

interface Step {
  label: string;
  sublabel: string;
  description: string;
  bullets: string[];
  color: ChipColor;
}

interface StepperProps {
  title?: string;
  steps: Step[];
  activeIndex?: number;
}

const DOT_COLOR: Record<ChipColor, string> = {
  blue: "bg-blue-600",
  green: "bg-forest-500",
  violet: "bg-violet-600",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-500",
};

const RING_COLOR: Record<ChipColor, string> = {
  blue: "ring-blue-200",
  green: "ring-forest-200",
  violet: "ring-violet-200",
  amber: "ring-amber-200",
  rose: "ring-rose-200",
  slate: "ring-slate-200",
};

const BADGE_STYLE: Record<ChipColor, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-forest-500/10 text-forest-600",
  violet: "bg-violet-100 text-violet-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
};

export default function Stepper({ title, steps, activeIndex = 0 }: StepperProps) {
  const [selected, setSelected] = useState(activeIndex);
  const active = steps[selected];

  return (
    <div className="card-hover">
      {title && <h3 className="mb-6 text-center text-base font-semibold text-navy-900">{title}</h3>}

      <div className="flex items-start">
        {steps.map((step, i) => {
          const isSelected = i === selected;
          return (
            <div key={step.label} className="flex flex-1 items-start last:flex-none">
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={isSelected}
                className="group flex flex-1 flex-col items-center gap-0 px-1 text-center transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
                    isSelected
                      ? `${DOT_COLOR[step.color]} text-white ring-4 ${RING_COLOR[step.color]}`
                      : "bg-slate-100 text-slate-400 group-hover:ring-4 group-hover:ring-slate-100"
                  }`}
                >
                  {i + 1}
                </div>
                <div
                  className={`mt-2 text-xs font-semibold ${
                    isSelected ? "text-navy-900" : "text-slate-400"
                  }`}
                >
                  {step.sublabel}
                </div>
                <div className="max-w-[9rem] text-xs text-slate-500">{step.label}</div>
              </button>
              {i < steps.length - 1 && (
                <div className="mt-5 h-px flex-1 bg-slate-200" style={{ minWidth: 24 }} />
              )}
            </div>
          );
        })}
      </div>

      <div key={selected} className="animate-fade-in-up mt-6 rounded-xl bg-slate-50 p-5">
        <div className="flex items-center gap-2">
          <span className={`badge ${BADGE_STYLE[active.color]}`}>{active.sublabel}</span>
          <span className="text-sm font-semibold text-navy-900">{active.label}</span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{active.description}</p>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
          {active.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-slate-500">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-forest-500" />
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">Click any step above to see how it works.</p>
      </div>
    </div>
  );
}
