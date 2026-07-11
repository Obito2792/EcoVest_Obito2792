"use client";

import Link from "next/link";
import IconChip, { ChipColor } from "./IconChip";
import GradientBanner from "./GradientBanner";
import Stepper from "./Stepper";
import LandingReallocationPreview from "./LandingReallocationPreview";
import Footer from "./Footer";
import ForestSilhouette from "./ForestSilhouette";
import {
  TrendingUpIcon,
  LeafIcon,
  SparklesIcon,
  ShieldIcon,
  TargetIcon,
  ArrowRightIcon,
} from "./Icons";

export default function LandingScreen() {
  return (
    <div>
      {/* HERO — deep forest gradient with a hand-drawn treeline at the base */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-forest-700">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-forest-500/20 blur-3xl" />
        <div
          className="pointer-events-none absolute -right-16 top-1/3 h-80 w-80 animate-float rounded-full bg-blue-500/10 blur-3xl"
          style={{ animationDelay: "1.4s" }}
        />
        <LeafIcon className="animate-sway pointer-events-none absolute left-[8%] top-[18%] h-8 w-8 text-forest-300/40" />
        <span
          className="animate-sway pointer-events-none absolute right-[12%] top-[45%] block"
          style={{ animationDelay: "0.8s" }}
        >
          <LeafIcon className="h-10 w-10 text-forest-300/30" />
        </span>

        <div className="relative mx-auto max-w-5xl px-6 pb-32 pt-20 text-center">
          <span className="badge mx-auto mb-6 w-fit bg-forest-500/20 text-forest-300">
            PORTFOLIO GREENIFIER
          </span>

          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
            Invest in the Future of
          </h1>
          <h1 className="mt-1 text-4xl font-bold leading-tight text-forest-400 sm:text-5xl">
            Clean Energy Portfolios
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
            EcoVest is a simulated stock and ETF trading account — sign up,
            start with $10,000 in play money, and see a clean-energy-tilted
            reallocation with real weighted return, volatility, and
            diversification math, plus Gemini-grounded explanations for every
            change. No real money, ever.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-forest-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-forest-400"
            >
              Get Started Free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Log In
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {[
              { value: "19", label: "Stocks & ETFs Tracked" },
              { value: "3", label: "Sponsor Tracks" },
              { value: "Live", label: "Gemini API" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 backdrop-blur-sm"
              >
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-300">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <ForestSilhouette className="h-32 text-forest-950" />
      </section>

      {/* ABOUT */}
      <section className="bg-forest-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-forest-900">
                About the <span className="text-forest-600">Reallocation</span>
              </h2>
              <p className="mt-4 text-slate-600">
                EcoVest analyzes your stock and ETF holdings the same way a
                real portfolio review would — sector exposure, weighted
                return, weighted volatility — then layers in a transparent
                clean-energy score for every holding.
              </p>

              <div className="mt-6 space-y-4">
                <AboutRow
                  icon={<TargetIcon className="h-4 w-4" />}
                  color="green"
                  title="Explainable Algorithm"
                  body="Quartile-based reallocation you can trace holding by holding — no black box."
                />
                <AboutRow
                  icon={<LeafIcon className="h-4 w-4" />}
                  color="green"
                  title="Clean-Energy Scored"
                  body="Every stock, ETF, and green bond proxy carries a 1–10 clean-energy/ESG score."
                />
                <AboutRow
                  icon={<SparklesIcon className="h-4 w-4" />}
                  color="green"
                  title="Gemini-Grounded"
                  body="Every explanation is generated live from your actual holdings data."
                />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="card-hover">
                  <div className="text-2xl font-bold text-forest-600">19</div>
                  <div className="text-xs text-slate-500">Stocks &amp; ETFs Tracked</div>
                </div>
                <div className="card-hover">
                  <div className="text-2xl font-bold text-forest-600">1–10</div>
                  <div className="text-xs text-slate-500">Clean-Energy Scale</div>
                </div>
              </div>
            </div>

            <div className="relative pb-5">
              <LandingReallocationPreview />
              <div className="card absolute -bottom-5 left-6 right-6 flex items-center justify-between py-3">
                <span className="text-sm font-semibold text-navy-900">Gemini-Powered</span>
                <span className="badge bg-forest-500/10 text-forest-600">Live API</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ECOVEST */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold text-forest-900">
            Four reasons this holds up under scrutiny
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
            Built for Bloomberg's FinTech track, OneEthos's Clean Energy
            track, and the Google Gemini API track — all at once.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <FeatureCard
              icon={<TrendingUpIcon className="h-5 w-5" />}
              color="blue"
              title="Real Portfolio Math"
              body="Weighted expected return and volatility, computed transparently — genuine financial analysis, not a green gimmick."
              bullets={["Sector-capped diversification", "Full before/after benchmark", "Illustrative, always labeled"]}
            />
            <FeatureCard
              icon={<LeafIcon className="h-5 w-5" />}
              color="green"
              title="Clean-Energy Tilt"
              body="Every reallocation steers real capital weight away from low scorers and into clean-energy equities and green bonds."
              bullets={["1–10 ESG scoring", "Sector-diversified targets", "Green bond proxies included"]}
            />
            <FeatureCard
              icon={<SparklesIcon className="h-5 w-5" />}
              color="violet"
              title="Gemini-Grounded Insights"
              body="Three live Gemini API calls power ESG summaries, reallocation rationale, and a grounded Q&A chatbot."
              bullets={["No hardcoded text", "Grounded in your holdings", "Visible, not buried"]}
            />
            <FeatureCard
              icon={<ShieldIcon className="h-5 w-5" />}
              color="amber"
              title="Fully Transparent"
              body="Every number is simulated and clearly labeled — nothing here is investment advice."
              bullets={["Simple weighted-average model", "Every formula explainable", "Not investment advice"]}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-forest-100/50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold text-forest-900">How It Works</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
            From raw holdings to a Gemini-explained reallocation in three steps.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <StepCard
              number="01"
              color="blue"
              duration="10 seconds"
              title="Load Your Portfolio"
              body="Sign up for $10,000 in simulated cash, then load the sample portfolio or buy stocks and ETFs yourself."
              bullets={["No real brokerage, ever", "Sample portfolio included", "Buy/sell any of 19 holdings"]}
            />
            <StepCard
              number="02"
              color="green"
              duration="Instant"
              title="See the Reallocation"
              body="Compare sector mix, return, volatility, and clean-energy score before vs. after."
              bullets={["Quartile-based logic", "Sector diversification capped", "Full before/after table"]}
            />
            <StepCard
              number="03"
              color="violet"
              duration="Anytime"
              title="Ask Gemini Anything"
              body="Open the chat panel and ask about any holding — grounded in your actual data."
              bullets={["ESG summaries", "Reallocation rationale", "Free-form Q&A"]}
            />
          </div>

          <div className="mt-8">
            <Stepper
              title="Your EcoVest Journey"
              activeIndex={0}
              steps={[
                {
                  sublabel: "Step 1",
                  label: "Load portfolio",
                  color: "blue",
                  description:
                    "Sign up for a simulated account with $10,000 in play money, then load the 13-holding sample portfolio in one click or buy any of 19 stocks and ETFs yourself.",
                  bullets: [
                    "Free account, no card required",
                    "Sample portfolio loads instantly",
                    "Or hand-pick your own holdings",
                  ],
                },
                {
                  sublabel: "Step 2",
                  label: "Analyze holdings",
                  color: "green",
                  description:
                    "EcoVest computes your real sector mix, weighted expected return, weighted volatility, and a 1–10 clean-energy score for every holding you own.",
                  bullets: [
                    "Sector breakdown by weight",
                    "Weighted return & volatility",
                    "Clean-energy score per holding",
                  ],
                },
                {
                  sublabel: "Step 3",
                  label: "Reallocate",
                  color: "violet",
                  description:
                    "A quartile-based algorithm trims your lowest clean-energy scorers and shifts that capital into clean-energy equities and green bond proxies — sector caps keep it diversified.",
                  bullets: [
                    "Bottom-quartile holdings trimmed",
                    "Redistributed into top scorers",
                    "Sector exposure capped at 35%",
                  ],
                },
                {
                  sublabel: "Step 4",
                  label: "Ask Gemini",
                  color: "amber",
                  description:
                    "Every ESG summary, reallocation rationale, and chat answer is generated live by the Gemini API, grounded in your actual holdings — nothing is hardcoded.",
                  bullets: [
                    "Live ESG summaries",
                    "Reallocation rationale on demand",
                    "Free-form Q&A on your data",
                  ],
                },
              ]}
            />
          </div>

          <div className="mt-8">
            <GradientBanner
              gradient="from-violet-600 via-purple-600 to-blue-600"
              heading="Ready to see your own numbers?"
              subheading="No real brokerage link, ever — just a free account and $10,000 in simulated cash."
              stats={[
                { value: "3", label: "Gemini API Calls" },
                { value: "19", label: "Holdings Modeled" },
                { value: "0", label: "Real Trades Executed" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* SPONSOR TRACKS */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold text-forest-900">
            Built for Three Sponsor Tracks
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
            Every feature below maps directly to a judging criterion.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <SponsorCard
              icon={<TrendingUpIcon className="h-5 w-5" />}
              color="blue"
              title="Bloomberg — FinTech"
              subtitle="Real, defensible portfolio math"
              tags={["Weighted Return", "Volatility Modeling", "Sector Caps"]}
              highlights={[
                "Full before/after benchmark",
                "Every figure traceable to a formula",
                "Sector diversification enforced",
              ]}
            />
            <SponsorCard
              icon={<LeafIcon className="h-5 w-5" />}
              color="green"
              title="OneEthos — Clean Energy"
              subtitle="Real capital steered toward clean energy"
              tags={["ESG Scoring", "Capital Reallocation", "Green Bonds"]}
              highlights={[
                "1–10 clean-energy score per holding",
                "Illustrative dollars shifted, shown live",
                "Sector-diversified clean targets",
              ]}
            />
            <SponsorCard
              icon={<SparklesIcon className="h-5 w-5" />}
              color="violet"
              title="Google Gemini API"
              subtitle="Three live, visible integrations"
              tags={["ESG Summaries", "Reallocation Rationale", "Grounded Chatbot"]}
              highlights={[
                "No hardcoded responses",
                "Grounded in real holdings data",
                "Highlighted in the demo flow",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-forest-950">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h3 className="text-2xl font-bold text-white">
            Judged on Substance, Not Just Style
          </h3>
          <p className="mt-3 text-forest-100">
            Every metric on this dashboard traces back to a specific holding
            and a specific formula — built to hold up under real scrutiny.
          </p>
        </div>
      </section>

      {/* CLOSING CTA — deep forest gradient with treeline, matching every other tab */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-700 via-forest-900 to-forest-950 pb-32 pt-16">
        <div className="pointer-events-none absolute -right-24 -top-10 h-72 w-72 animate-float rounded-full bg-forest-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Green Your
          </h2>
          <h2 className="mt-1 text-3xl font-bold text-forest-300 sm:text-4xl">
            Stock and ETF Portfolio?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-forest-100">
            Sign up, load the sample portfolio, and see a full clean-energy
            reallocation, powered live by Gemini, in under a minute.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-forest-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-glow-soft"
          >
            Get Started Free
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <p className="mt-8 text-xs text-forest-100/60">
            All figures shown throughout EcoVest are illustrative and
            simulated for demonstration purposes. This is not investment
            advice.
          </p>
        </div>

        <ForestSilhouette className="h-32 text-forest-950" />
      </section>

      <Footer />
    </div>
  );
}

function AboutRow({
  icon,
  color,
  title,
  body,
}: {
  icon: React.ReactNode;
  color: ChipColor;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <IconChip icon={icon} color={color} size="sm" />
      <div>
        <div className="text-sm font-semibold text-navy-900">{title}</div>
        <div className="text-sm text-slate-600">{body}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  color,
  title,
  body,
  bullets,
}: {
  icon: React.ReactNode;
  color: ChipColor;
  title: string;
  body: string;
  bullets: string[];
}) {
  return (
    <div className="card-hover">
      <IconChip icon={icon} color={color} />
      <h3 className="mt-4 text-base font-semibold text-navy-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
      <ul className="mt-3 space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-500">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-forest-500" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({
  number,
  color,
  duration,
  title,
  body,
  bullets,
}: {
  number: string;
  color: ChipColor;
  duration: string;
  title: string;
  body: string;
  bullets: string[];
}) {
  const badgeStyles: Record<ChipColor, string> = {
    blue: "bg-blue-600",
    green: "bg-forest-500",
    violet: "bg-violet-600",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    slate: "bg-slate-500",
  };
  return (
    <div className="card-hover">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white ${badgeStyles[color]}`}
        >
          {number}
        </span>
        <span className="badge bg-slate-100 text-slate-600">{duration}</span>
      </div>
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
      <ul className="mt-3 space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-500">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SponsorCard({
  icon,
  color,
  title,
  subtitle,
  tags,
  highlights,
}: {
  icon: React.ReactNode;
  color: ChipColor;
  title: string;
  subtitle: string;
  tags: string[];
  highlights: string[];
}) {
  return (
    <div className="card-hover">
      <div className="flex items-center gap-3">
        <IconChip icon={icon} color={color} />
        <div>
          <div className="text-sm font-semibold text-navy-900">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>

      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Focus
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="badge bg-slate-100 text-slate-600">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Highlights
      </div>
      <ul className="mt-2 space-y-1.5">
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}
