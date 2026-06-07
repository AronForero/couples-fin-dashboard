"use client";

import Link from "next/link";
import type { CoupleHistory } from "@/types";

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Presente";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CO", {
    month: "short",
    year: "numeric",
  });
}

interface CoupleHistoryCardProps {
  couple: CoupleHistory;
}

export default function CoupleHistoryCard({ couple }: CoupleHistoryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {couple.partner_name}
          </h3>
          <p className="text-sm text-slate-500">
            {formatDate(couple.joined_at)} — {formatDate(couple.left_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Total gastado</p>
          <p className="text-lg font-semibold text-slate-900 tabular-nums">
            {formatCOP(couple.total_spent)}
          </p>
        </div>
      </div>

      <Link
        href={`/couple/${couple.couple_id}/expenses`}
        className="block w-full text-center bg-slate-100 text-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-200 transition-colors"
      >
        Ver gastos
      </Link>
    </div>
  );
}
