"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IconChip from "@/components/IconChip";
import CountUp from "@/components/CountUp";
import ForestSilhouette from "@/components/ForestSilhouette";
import { LeafIcon, TrendingUpIcon, SparklesIcon, ArrowRightIcon } from "@/components/Icons";

const STATS = [
  { value: 19, prefix: "", label: "Stocks & ETFs Modeled" },
  { value: 10, prefix: "1–", label: "Clean-Energy Scale" },
  { value: 3, prefix: "", label: "Sponsor Tracks" },
  { value: 10000, prefix: "$", label: "Simulated Starting Cash" },
];

export default function AboutPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/account");
      if (res.ok) setAuthed(true);
    })();
  }, []);

  return (
    <>
      <Header authed={authed} />

      {/* HERO — the GROW acrostic, the exact same build used on the landing page */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-forest-700">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-forest-500/20 blur-3xl" />
        <div
          className="pointer-events-none absolute -right-16 top-1/3 h-80 w-80 animate-float rounded-full bg-blue-500/10 blur-3xl"
          style={{ animationDelay: "1.2s" }}
        />
        <LeafIcon className="animate-sway pointer-events-none absolute left-[8%] top-[18%] h-8 w-8 text-forest-300/40" />
        <span
          className="animate-sway pointer-events-none absolute right-[12%] top-[45%] block"
          style={{ animationDelay: "0.8s" }}
        >
          <LeafIcon className="h-10 w-10 text-forest-300/30" />
        </span>

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="order-2 flex w-full justify-start lg:-ml-20 lg:order-1">
              <div className="space-y-1 text-left font-extrabold leading-none tracking-tight">
                <p className="flex items-baseline leading-none text-slate-300">
                  <Image
                    src="/GROWiconNBG.png?v=2"
                    alt="G"
                    width={128}
                    height={128}
                    className="h-[96px] w-[96px] object-contain sm:h-[128px] sm:w-[128px]"
                  />
                  <span className="text-5xl leading-none sm:text-6xl">reen</span>
                </p>
                <p className="flex items-baseline leading-none text-slate-300">
                  <span className="text-[96px] uppercase leading-none text-[#2e984d] sm:text-[128px]">R</span>
                  <span className="text-5xl leading-none sm:text-6xl">eturn</span>
                </p>
                <p className="flex items-baseline leading-none text-slate-300">
                  <span className="text-[96px] uppercase leading-none text-[#2e984d] sm:text-[128px]">O</span>
                  <span className="text-5xl leading-none sm:text-6xl">n</span>
                </p>
                <p className="flex items-baseline leading-none text-slate-300">
                  <span className="text-[96px] uppercase leading-none text-[#2e984d] sm:text-[128px]">W</span>
                  <span className="text-5xl leading-none sm:text-6xl">ealth</span>
                </p>
              </div>
            </div>

            <div className="order-1 text-center lg:order-2 lg:text-left">
              <span className="badge mb-6 w-fit bg-forest-400/25 text-forest-50 lg:mx-0">
                OUR MISSION
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                About EcoVest
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-forest-100 lg:mx-0">
                EcoVest exists on one idea, spelled out in our primary goal: GROW — Green
                Return On Wealth — and it's meant to be grown into, not just
                read. Every clean-energy tilt is judged on the same real,
                weighted portfolio math as any other return.
              </p>
            </div>
          </div>
        </div>

        <ForestSilhouette className="h-40 text-forest-950" />
      </section>

      <section className="bg-forest-50">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <div className="rounded-2xl border border-forest-200 bg-white px-6 py-7 shadow-sm sm:px-10">
            <p className="text-base font-medium leading-relaxed text-navy-900 sm:text-lg">
              Grow your wealth through returns that also grow a greener economy
              <span className="text-forest-600"> — that&apos;s the whole thesis</span>, and
              every feature in EcoVest traces back to it.
            </p>
          </div>
        </div>
      </section>

      {/* Animated growth stats */}
      <section className="bg-forest-950">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-forest-300 sm:text-3xl">
                  <CountUp value={s.value} prefix={s.prefix} duration={900} />
                </div>
                <div className="mt-1 text-xs text-forest-100/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-forest-100/50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-forest-900">Why we built this</h2>
              <p className="mt-4 text-slate-700">
                Most "green investing" tools ask you to choose between doing
                good and doing well — pick the ethical option, or pick the
                one with better numbers. EcoVest was built to reject that
                trade-off: every reallocation it suggests is judged on real,
                weighted return and volatility math, not just a clean-energy
                score.
              </p>
              <p className="mt-4 text-slate-700">
                It was built in a single 12-hour hackathon, spanning
                Bloomberg's FinTech track, OneEthos's Clean Energy track, and
                the Google Gemini API track — which is why every feature has
                to justify itself on real financial substance, real
                clean-energy impact, and a genuine, visible use of Gemini,
                all at once.
              </p>
            </div>

            <div className="space-y-4">
              <AboutStat
                icon={<TrendingUpIcon className="h-5 w-5" />}
                title="Real math, not a green gimmick"
                body="Weighted return, volatility, and sector diversification — computed transparently, every time."
              />
              <AboutStat
                icon={<LeafIcon className="h-5 w-5" />}
                title="Clean energy, scored honestly"
                body="A 1–10 score per holding, grounded in an actual sustainability excerpt — not a marketing label."
              />
              <AboutStat
                icon={<SparklesIcon className="h-5 w-5" />}
                title="Gemini, visibly at work"
                body="Every explanation on your dashboard is generated live from your real holdings — nothing is hardcoded."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-forest-700 via-forest-900 to-forest-950 pb-32 pt-16">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 animate-float rounded-full bg-forest-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to GROW your simulated portfolio?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-forest-100">
            $10,000 in play money, a real reallocation engine, and Gemini
            explaining every move — no real brokerage, ever.
          </p>
          <Link
            href={authed ? "/account" : "/signup"}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-forest-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-glow-soft"
          >
            {authed ? "Go to Account" : "Get Started Free"}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <ForestSilhouette className="h-32 text-forest-950" />
      </section>

      <Footer />
    </>
  );
}

function AboutStat({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-soft">
      <IconChip icon={icon} color="green" size="sm" />
      <div>
        <div className="text-sm font-semibold text-forest-900">{title}</div>
        <div className="text-sm text-slate-600">{body}</div>
      </div>
    </div>
  );
}
