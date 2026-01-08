"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          GigSecure
        </Link>

        <nav className="flex gap-3 text-sm">
          <Link
            href="/client"
            className="px-3 py-1 rounded-full border border-slate-700 hover:border-blue-500 hover:text-blue-400"
          >
            Client dashboard
          </Link>
          <Link
            href="/freelancer"
            className="px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-400"
          >
            Freelancer dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
