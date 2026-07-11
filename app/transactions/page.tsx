"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { TransactionRecord } from "@/lib/types";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionRecord[] | null>(null);

  useEffect(() => {
    (async () => {
      const accountRes = await fetch("/api/account");
      if (accountRes.status === 401) {
        router.push("/login");
        return;
      }
      const accountJson = await accountRes.json();
      if (accountRes.ok && !accountJson.profileComplete) {
        router.push("/profile");
        return;
      }

      const res = await fetch("/api/transactions");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (res.ok) setTransactions(json.transactions);
    })();
  }, [router]);

  return (
    <>
      <Header authed />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="animate-fade-in-up mb-1 text-2xl font-bold text-navy-900">
          Transaction History
        </h1>
        <p className="animate-fade-in-up mb-6 text-sm text-slate-500" style={{ animationDelay: "40ms" }}>
          Every simulated trade you&apos;ve made, most recent first.
        </p>

        <div className="animate-fade-in-up card overflow-x-auto" style={{ animationDelay: "80ms" }}>
          {!transactions ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-9 rounded-lg" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No trades yet. Buy something from Browse or try the sample portfolio.
            </p>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Ticker</th>
                  <th className="py-2 pr-3">Side</th>
                  <th className="py-2 pr-3">Shares</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Cash After</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr
                    key={t.id}
                    className="animate-fade-in-up border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                    style={{ animationDelay: `${100 + Math.min(i, 20) * 20}ms` }}
                  >
                    <td className="py-2 pr-3 text-slate-600">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 font-medium text-navy-900">{t.ticker}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`badge ${
                          t.side === "BUY"
                            ? "bg-forest-500/10 text-forest-600"
                            : t.side === "BONUS"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {t.side === "BONUS" ? "🌱 Bonus" : t.side}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{t.side === "BONUS" ? "—" : t.shares}</td>
                    <td className="py-2 pr-3">
                      {t.side === "BONUS" ? (
                        <span className="font-medium text-forest-600">+${t.price.toFixed(2)}</span>
                      ) : (
                        `$${t.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-2 pr-3">${t.cashAfter.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
