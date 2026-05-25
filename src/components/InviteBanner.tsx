"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DISMISSED_KEY = "finduo_invite_banner_dismissed";

export default function InviteBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="bg-orange-50 border-b border-orange-200">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <p className="text-sm text-orange-800">
          Invitá a tu pareja para compartir gastos.
          <Link
            href="/invite"
            className="ml-2 font-semibold text-orange-900 underline underline-offset-2 hover:text-orange-700"
          >
            Invitar
          </Link>
        </p>
        <button
          onClick={handleDismiss}
          className="text-orange-400 hover:text-orange-600 transition-colors ml-4"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
