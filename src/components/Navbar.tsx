"use client";

import { useAuth } from "@/lib/auth";
import { useState, useRef, useEffect } from "react";
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isSolo = coupleMembers.length < 2;

  function renderStatusBadge() {
    if (!user) return null;
    if (user.status === "trial") {
      const days = getTrialDaysRemaining(user.created_at);
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full inline-block bg-amber-100 text-amber-700">
          Prueba — {days} días restantes
        </span>
      );
    }
    if (user.status === "active") {
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full inline-block bg-emerald-100 text-emerald-700">
          Activo
        </span>
      );
    }
    if (user.status === "suspended") {
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full inline-block bg-red-100 text-red-700">
          Suspendido
        </span>
      );
    }
    return null;
  }

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

          <div ref={dropdownRef} className="relative">
            {user && (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {displayName}
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{displayName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <div className="pt-1">{renderStatusBadge()}</div>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left text-sm text-slate-500 hover:text-red-600 transition-colors py-2 mt-3 border-t border-slate-100"
                    >
                      Salir
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
