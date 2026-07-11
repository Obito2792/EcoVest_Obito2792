"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForestSilhouette from "@/components/ForestSilhouette";
import { LeafIcon, ArrowRightIcon } from "@/components/Icons";

interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  entries: FaqEntry[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "The basics",
    entries: [
      {
        question: "Is this real money? Can I actually lose or make money?",
        answer:
          "No — EcoVest is a simulated, paper-trading experience only. There is no real brokerage connection, no real bank linking, and no real order routing anywhere in the app. Every account starts with $10,000 in mock cash, and every balance you see is illustrative.",
      },
      {
        question: "Do I need to link a bank account or card?",
        answer:
          "No. Signing up only needs an email and password — there is no payment method, bank account, or card involved at any point.",
      },
      {
        question: "What can I do once I sign up?",
        answer:
          "After a one-time profile step (your name and clean-energy interests), you land on your Account page. From there you can load a pre-built sample portfolio, or head to Browse to buy and sell any of the 19 stocks and ETFs yourself.",
      },
    ],
  },
  {
    title: "Reallocation & scoring",
    entries: [
      {
        question: "How is the clean-energy score calculated?",
        answer:
          "Every holding in the dataset carries a 1–10 clean-energy/ESG score, grounded in a short mock sustainability report excerpt for that company or fund. Higher scores mean stronger clean-energy alignment.",
      },
      {
        question: "How does the reallocation algorithm decide what to change?",
        answer:
          "It ranks your current holdings by clean-energy score, trims weight from the bottom-quartile scorers, and redistributes that freed-up capital into top-scoring clean-energy equities, ETFs, and a green bond proxy — capping any single sector at 35% of the portfolio to keep things diversified. If two candidates score similarly, the one matching your stated clean-energy interests gets a slightly larger share.",
      },
      {
        question: "What happens when I click \"Apply Reallocation\"?",
        answer:
          "The suggested move is translated directly into a batch of sell-then-buy orders, executed through the exact same trade engine as any manual trade — so your cash balance, positions, and transaction history all stay consistent.",
      },
      {
        question: "What is the Clean-Energy Buy Bonus?",
        answer:
          "Buying shares of a holding that scores 8+/10 on clean energy instantly credits a small simulated cash bonus (2% of the trade) — a lightweight, Robinhood-style incentive shown to you before you confirm the trade, not a hidden surprise.",
      },
    ],
  },
  {
    title: "The Gemini assistant",
    entries: [
      {
        question: "What can I ask the chat assistant?",
        answer:
          "Anything about the 19 stocks/ETFs in the dataset — including hypothetical questions about holdings you don't currently own — as well as general questions about how EcoVest itself works, like the reallocation logic or the clean-energy bonus.",
      },
      {
        question: "Is the assistant's information accurate, or could it make things up?",
        answer:
          "It's instructed to ground every answer strictly in EcoVest's actual holdings data and features, and to say it doesn't have an answer rather than guess. It never gives personalized investment advice or tells you to buy or sell.",
      },
      {
        question: "Where else does EcoVest use Gemini?",
        answer:
          "Two other places: plain-English ESG summaries for your lowest-scoring holdings, and a one-paragraph rationale explaining why a given reallocation was suggested — both generated live from your real numbers, never hardcoded.",
      },
    ],
  },
  {
    title: "Account & data",
    entries: [
      {
        question: "Can I change my clean-energy interests after signing up?",
        answer:
          "Yes — head to your profile page anytime to update your name or interest categories. Your Recommended For You picks and the reallocation tiebreaker update accordingly.",
      },
      {
        question: "How do I find a specific stock, ETF, or feature quickly?",
        answer:
          "Use the search icon in the header (or press Cmd/Ctrl+K) on any signed-in page. It searches tickers, company names, sectors, and app features/pages all at once.",
      },
      {
        question: "Can I reset my portfolio and start over?",
        answer:
          "Loading the sample portfolio liquidates your current holdings and replaces them with the pre-built set, which is the quickest way to reset to a known state. There isn't a separate \"wipe everything\" button beyond that today.",
      },
    ],
  },
];

export default function FaqPage() {
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

      {/* HERO — deep forest gradient with a hand-drawn treeline at the base */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-forest-700">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-forest-500/20 blur-3xl" />
        <div
          className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 animate-float rounded-full bg-forest-300/10 blur-3xl"
          style={{ animationDelay: "1.2s" }}
        />
        <LeafIcon className="animate-sway pointer-events-none absolute left-[8%] top-[18%] h-8 w-8 text-forest-300/40" />
        <span
          className="animate-sway pointer-events-none absolute right-[12%] top-[40%] block"
          style={{ animationDelay: "0.8s" }}
        >
          <LeafIcon className="h-10 w-10 text-forest-300/30" />
        </span>

        <div className="relative mx-auto max-w-3xl px-6 pb-32 pt-16 text-center">
          <span className="badge mx-auto mb-5 w-fit bg-forest-500/20 text-forest-300">
            HELP CENTER
          </span>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Everything about how EcoVest works, what's simulated, and how the
            Gemini assistant fits in.
          </p>
        </div>

        <ForestSilhouette className="h-32 text-forest-950" />
      </section>

      <section className="bg-forest-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.title} className="mb-10 last:mb-0">
              <h2 className="mb-4 text-lg font-bold text-forest-900">{cat.title}</h2>
              <div className="space-y-3">
                {cat.entries.map((entry) => (
                  <details
                    key={entry.question}
                    className="group card-hover cursor-pointer open:shadow-glow-soft"
                  >
                    <summary className="flex list-none items-center justify-between gap-4 font-medium text-navy-900 marker:content-none">
                      <span className="text-sm sm:text-base">{entry.question}</span>
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {entry.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING CTA — deep forest gradient with treeline, matching About & Features */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-700 via-forest-900 to-forest-950 pb-32 pt-16">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 animate-float rounded-full bg-forest-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Still have a question?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-forest-100">
            Sign up and ask the Gemini assistant anytime from the header —
            it's grounded in your actual holdings, no real money involved.
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
