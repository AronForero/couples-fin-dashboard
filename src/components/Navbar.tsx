"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/balance", label: "Balance" },
  { href: "/expenses", label: "Gastos" },
];

export default function Navbar() {
  const { displayName, coupleMembers, logout } = useAuth();
  const pathname = usePathname();

  const isSolo = coupleMembers.length < 2;

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-indigo-600">A&M</span>
          <div className="flex gap-1">
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </Link>
            ))}
            {isSolo && (
              <Link
                href="/invite"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/invite"
                    ? "bg-orange-50 text-orange-700"
                    : "text-orange-600 hover:bg-orange-50"
                }`}
              >
                Invitar
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:inline">
            {displayName}
          </span>
          <button
            onClick={logout}
            className="text-sm text-slate-400 hover:text-red-600 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
