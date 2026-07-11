"use client";

import { useState } from "react";
import { AccountSummary, BonusAward, Holding } from "@/lib/types";
import { isGreenBonusEligible, formatBonusPercent, GREEN_BONUS_PERCENT } from "@/lib/bonus";
import { useToast } from "./Toast";

interface TradeModalProps {
  holding: Holding;
  side: "BUY" | "SELL";
  heldShares: number;
  cashBalance: number;
  onClose: () => void;
  onSuccess: (account: AccountSummary) => void;
}

export default function TradeModal({
  holding,
  side,
  heldShares,
  cashBalance,
  onClose,
  onSuccess,
}: TradeModalProps) {
  const [shares, setShares] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const total = shares * holding.price;
  const maxBuyShares = holding.price > 0 ? Math.floor(cashBalance / holding.price) : 0;
  const bonusEligible = side === "BUY" && isGreenBonusEligible(holding);
  const estimatedBonus = bonusEligible ? total * GREEN_BONUS_PERCENT : 0;

  async function handleConfirm() {
    setError(null);
    if (!Number.isInteger(shares) || shares <= 0) {
      setError("Enter a whole number of shares greater than zero.");
      return;
    }
    if (side === "SELL" && shares > heldShares) {
      setError(`You only hold ${heldShares} shares.`);
      return;
    }
    if (side === "BUY" && total > cashBalance) {
      setError("That trade exceeds your available simulated cash balance.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: holding.ticker, side, shares }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Trade failed.");
      const bonus: BonusAward | null = json.bonus ?? null;
      onSuccess(json as AccountSummary);
      const baseMessage = `${side === "BUY" ? "Bought" : "Sold"} ${shares} share${
        shares === 1 ? "" : "s"
      } of ${holding.ticker}.`;
      showToast(
        bonus
          ? `${baseMessage} 🌱 +$${bonus.amount.toFixed(2)} clean-energy bonus!`
          : baseMessage,
        "success"
      );
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Trade failed.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-semibold text-navy-900">
            {side === "BUY" ? "Buy" : "Sell"} {holding.ticker}
          </h3>
          <span
            className={`badge ${
              side === "BUY" ? "bg-forest-500/10 text-forest-600" : "bg-red-50 text-red-600"
            }`}
          >
            ${holding.price.toFixed(2)} / share
          </span>
        </div>
        <p className="mb-4 text-sm text-slate-500">{holding.name}</p>

        <label className="mb-1 block text-xs font-medium text-slate-600">Shares</label>
        <input
          type="number"
          min={1}
          value={shares}
          onChange={(e) => setShares(parseInt(e.target.value || "0", 10))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
        />

        {side === "SELL" ? (
          <p className="mt-1 text-xs text-slate-400">You hold {heldShares} shares.</p>
        ) : (
          <p className="mt-1 text-xs text-slate-400">
            You can afford up to {maxBuyShares} shares (${cashBalance.toFixed(2)} available).
          </p>
        )}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-500">Estimated total</span>
          <span className="font-semibold text-navy-900">${total.toFixed(2)}</span>
        </div>

        {bonusEligible && (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-forest-500/20 bg-forest-500/5 px-3 py-2 text-sm">
            <span className="text-forest-700">
              🌱 Clean-Energy Bonus ({formatBonusPercent()})
            </span>
            <span className="font-semibold text-forest-700">
              +${estimatedBonus.toFixed(2)}
            </span>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
            {loading ? "Confirming…" : `Confirm ${side === "BUY" ? "Buy" : "Sell"}`}
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          Simulated trade — fills instantly at the listed mock price. No real money moves.
        </p>
      </div>
    </div>
  );
}
