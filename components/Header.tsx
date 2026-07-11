"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface HeaderProps {
  authed?: boolean;
}

const NAV_LINKS = [
  { href: "/account", label: "Account" },
  { href: "/browse", label: "Browse" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
];

export default function Header({ authed = false }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-navy-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href={authed ? "/account" : "/"} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-500 text-lg font-bold">
            E
          </div>
          <div>
            <div className="text-lg font-semibold leading-tight">EcoVest</div>
            <div className="text-xs leading-tight text-slate-300">
              Portfolio Greenifier
            </div>
          </div>
        </Link>

        {authed && (
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 ${
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <span className="badge hidden bg-slate-800 text-slate-200 lg:inline-flex">
            Simulated portfolio — not real money
          </span>
          {authed ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-glow-slate active:translate-y-0"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-200 transition hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-forest-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-forest-400 hover:shadow-glow-green active:translate-y-0"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
