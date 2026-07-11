"use client";

import { useEffect, useState } from "react";
import { Holding, PortfolioMetrics, ReallocationMove } from "@/lib/types";

interface EsgInsightCardsProps {
  flaggedTickers: string[];
  dataset: Holding[];
  originalMetrics: PortfolioMetrics;
  suggestedMetrics: PortfolioMetrics;
  moves: ReallocationMove[];
}

interface SummaryEntry {
  loading: boolean;
  summary?: string;
  error?: string;
}

function GeminiBadge() {
  return (
    <span className="badge bg-navy-900 text-white">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z"
          fill="currentColor"
        />
      </svg>
      Generated live by Gemini
    </span>
  );
}

export default function EsgInsightCards({
  flaggedTickers,
  dataset,
  originalMetrics,
  suggestedMetrics,
  moves,
}: EsgInsightCardsProps) {
  const tickers = flaggedTickers.slice(0, 3);
  const tickerKey = tickers.join(",");
  const map = new Map(dataset.map((h) => [h.ticker, h]));

  const [summaries, setSummaries] = useState<Record<string, SummaryEntry>>({});
  const [rationale, setRationale] = useState<{
    loading: boolean;
    text?: string;
    error?: string;
  }>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setSummaries(Object.fromEntries(tickers.map((t) => [t, { loading: true }])));

    tickers.forEach(async (ticker) => {
      try {
        const res = await fetch("/api/esg-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(json.error || "Failed to summarize");
        setSummaries((prev) => ({
          ...prev,
          [ticker]: { loading: false, summary: json.summary },
        }));
      } catch (err) {
        if (cancelled) return;
        setSummaries((prev) => ({
          ...prev,
          [ticker]: {
            loading: false,
            error: err instanceof Error ? err.message : "Error generating summary",
          },
        }));
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerKey]);

  useEffect(() => {
    let cancelled = false;
    setRationale({ loading: true });

    (async () => {
      try {
        const res = await fetch("/api/rationale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ originalMetrics, suggestedMetrics, moves }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(json.error || "Failed to generate rationale");
        setRationale({ loading: false, text: json.rationale });
      } catch (err) {
        if (cancelled) return;
        setRationale({
          loading: false,
          error: err instanceof Error ? err.message : "Error generating rationale",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(moves), suggestedMetrics.esgScore, originalMetrics.esgScore]);

  return (
    <div className="space-y-4">
      <div className="card-hover border-l-4 border-l-forest-500">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-navy-900">
            Why This Reallocation
          </h3>
          <GeminiBadge />
        </div>
        {rationale.loading && <SkeletonLines lines={3} />}
        {rationale.error && (
          <p className="text-sm text-red-600">
            {rationale.error}. Set <code className="rounded bg-slate-100 px-1">GCP_PROJECT_ID</code> and{" "}
            <code className="rounded bg-slate-100 px-1">GOOGLE_APPLICATION_CREDENTIALS</code> in your
            environment to enable this feature.
          </p>
        )}
        {rationale.text && (
          <p className="text-sm leading-relaxed text-slate-700">{rationale.text}</p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-navy-900">
            Flagged Holdings — ESG Insight Cards
          </h3>
          <GeminiBadge />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickers.map((ticker) => {
            const h = map.get(ticker);
            const entry = summaries[ticker];
            return (
              <div key={ticker} className="card-hover">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-navy-900">{ticker}</span>
                  <span className="badge bg-red-50 text-red-600">
                    {h?.esgScore ?? "—"}/10
                  </span>
                </div>
                <div className="mb-2 text-xs text-slate-500">
                  {h?.name} · {h?.sector}
                </div>
                {entry?.loading && <SkeletonLines lines={3} />}
                {entry?.error && (
                  <p className="text-xs text-red-600">
                    {entry.error}. Set <code className="rounded bg-slate-100 px-1">GCP_PROJECT_ID</code> /{" "}
                    <code className="rounded bg-slate-100 px-1">GOOGLE_APPLICATION_CREDENTIALS</code> to
                    enable this feature.
                  </p>
                )}
                {entry?.summary && (
                  <p className="text-sm leading-relaxed text-slate-700">{entry.summary}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkeletonLines({ lines }: { lines: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded bg-slate-200"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
