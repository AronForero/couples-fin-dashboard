"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserStatus } from "@/types";

const NAV_ITEMS = [
  { href: "/balance", label: "Balance" },
  { href: "/expenses", label: "Gastos" },
  { href: "/couple/manage", label: "Pareja" },
];

const TRIAL_DAYS = 30;

function getTrialDaysRemaining(createdAt: string): number {
  const created = new Date(createdAt);
  const expires = new Date(created.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = expires.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function StatusBanner({ status, createdAt }: { status: UserStatus; createdAt: string }) {
  if (status === "active") return null;

  if (status === "trial") {
    const days = getTrialDaysRemaining(createdAt);
    return (
      <div className="bg-amber-400 text-white text-sm py-1 px-4 text-center">
        Modo de prueba — {days} días restantes
      </div>
    );
  }

  if (status === "suspended") {
    return (
      <div className="bg-[#F97316] text-white text-sm py-1 px-4 text-center">
        Tu cuenta está suspendida. Completa tu pago para continuar.
      </div>
    );
  }

  return null;
}

export default function Navbar() {
  const { displayName, coupleMembers, logout, user } = useAuth();
  const pathname = usePathname();

  const isSolo = coupleMembers.length < 2;

  return (
    <div>
      {user && <StatusBanner status={user.status} createdAt={user.created_at} />}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-indigo-600">FinDuo</span>
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
    </div>
  );
}
