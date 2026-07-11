"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GREEN_BONUS_PERCENT, formatBonusPercentPrecise } from "@/lib/bonus";

interface BonusBadgeProps {
  ticker: string;
  price: number;
  size?: "sm" | "md";
}

const POPOVER_WIDTH = 240;
const ESTIMATED_HEIGHT = 132;
const GAP = 8;

export default function BonusBadge({ ticker, price, size = "md" }: BonusBadgeProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const left = Math.min(
        Math.max(rect.left, GAP),
        window.innerWidth - POPOVER_WIDTH - GAP
      );
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < ESTIMATED_HEIGHT + GAP;
      const top = openUpward ? rect.top - GAP : rect.bottom + GAP;
      setCoords({ top, left, openUpward });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const bonusAmount = price * GREEN_BONUS_PERCENT;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        className={`badge cursor-pointer bg-amber-100 text-amber-700 transition-colors hover:bg-amber-200 ${
          size === "sm" ? "text-xs" : ""
        }`}
      >
        🌱 Bonus
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={popoverRef}
            className="animate-fade-in-up fixed z-[999] rounded-xl border border-amber-200 bg-white p-3 text-left shadow-glow-soft"
            style={{
              top: coords.top,
              left: coords.left,
              width: POPOVER_WIDTH,
              transform: coords.openUpward ? "translateY(-100%)" : undefined,
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Clean-Energy Buy Bonus
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Buy {ticker} and get a{" "}
              <span className="font-semibold text-forest-600">
                {formatBonusPercentPrecise()}
              </span>{" "}
              simulated cash bonus, credited instantly — no real money involved.
            </p>
            <p className="mt-1.5 text-xs text-slate-400">
              At today&apos;s price of ${price.toFixed(2)}, that&apos;s about{" "}
              <span className="font-medium text-navy-900">
                ${bonusAmount.toFixed(2)}
              </span>{" "}
              per share bought.
            </p>
          </div>,
          document.body
        )}
    </>
  );
}
