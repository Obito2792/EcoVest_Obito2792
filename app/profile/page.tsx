"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INTEREST_CATEGORIES } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0 && interests.length > 0;

  function toggleInterest(category: string) {
    setInterests((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, interests }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save profile.");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-forest-700 px-6 py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-forest-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="animate-pop-in relative w-full max-w-lg rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-500 text-lg font-bold text-white">
            E
          </div>
          <div className="text-lg font-semibold text-navy-900">EcoVest</div>
        </div>

        <span className="badge mb-3 bg-forest-500/10 text-forest-600">Almost there</span>
        <h1 className="text-xl font-bold text-navy-900">Create your profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          A couple of quick details so we can personalize your recommendations and
          reallocation. Takes about 10 seconds.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">First name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="Jamie"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Last name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="Rivera"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Which clean-energy areas are you interested in? Pick one or more.
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_CATEGORIES.map((category) => {
                const selected = interests.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleInterest(category)}
                    aria-pressed={selected}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 ${
                      selected
                        ? "border-forest-500 bg-forest-500/10 text-forest-700 hover:shadow-glow-green"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:shadow-glow-slate"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={!canContinue || loading} className="btn-primary w-full">
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Simulated portfolio — your interests personalize the demo, they never touch real money.
        </p>
      </div>
    </div>
  );
}
