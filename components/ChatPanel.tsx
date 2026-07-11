"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import holdingsData from "@/data/holdings.json";
import { AccountSummary, Holding, PortfolioLine } from "@/lib/types";

const dataset = holdingsData as Holding[];

// Pages where the floating assistant shouldn't appear: the public landing
// page and the auth/onboarding flow. Everywhere else once signed in
// (Account, Browse, Dashboard, Transactions, and any future page) gets it.
const HIDDEN_PATHS = ["/", "/login", "/signup", "/profile"];

interface Message {
  role: "user" | "assistant";
  text: string;
}

/**
 * Global, always-available chat entry point once a user is signed in. Fetches
 * its own account snapshot (rather than requiring a parent page to pass one
 * down) so it can live once in the root layout and show up on every
 * authenticated page, not just the Dashboard.
 */
export default function ChatPanel() {
  const pathname = usePathname();
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: 'Ask me about any holding in the dataset — e.g. "Why is XOM rated low on clean energy?" or "What would happen if I dropped Tesla entirely?"',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account");
        if (cancelled) return;
        if (res.ok) {
          const json = await res.json();
          setAccount(json as AccountSummary);
        }
      } finally {
        if (!cancelled) setCheckedAuth(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const contextPortfolio: PortfolioLine[] = useMemo(() => {
    if (!account || account.positions.length === 0) return [];
    return account.positions
      .map((p) => {
        const h = dataset.find((d) => d.ticker === p.ticker);
        return { ticker: p.ticker, weight: (h?.price ?? 0) * p.shares };
      })
      .filter((l) => l.weight > 0);
  }, [account]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    const nextMessages: Message[] = [...messages, { role: "user", text: question }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: nextMessages.slice(0, -1),
          portfolio: contextPortfolio,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setMessages((prev) => [...prev, { role: "assistant", text: json.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `${err instanceof Error ? err.message : "Something went wrong."} (Make sure GEMINI_API_KEY is set in .env.local.)`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Not signed in, or on a page where the assistant shouldn't float (landing,
  // auth, onboarding) — render nothing.
  if (!checkedAuth || !account || HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-150 hover:-translate-y-1 hover:from-violet-500 hover:to-blue-500 hover:shadow-glow-violet active:translate-y-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z"
            fill="currentColor"
          />
        </svg>
        Ask Gemini about your holdings
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-navy-950 px-4 py-3 text-white">
              <div>
                <div className="font-semibold">EcoVest Assistant</div>
                <div className="text-xs text-slate-300">
                  Powered by Gemini · grounded in your holdings data
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-xl leading-none text-slate-300 hover:text-white"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {contextPortfolio.length === 0 && (
              <div className="border-b border-slate-100 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                You don&apos;t hold anything yet, so I&apos;ll answer using the full 19-holding
                dataset instead of your personal weights.
              </div>
            )}

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-navy-900 text-white"
                        : "bg-slate-100 text-navy-900"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="e.g. Why is XOM rated low on clean energy?"
                  className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="btn-primary h-fit"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
