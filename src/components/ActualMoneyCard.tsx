"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getActualMoney } from "@/lib/api";
import { formatCOP } from "@/components/CategoryBreakdown";
import type { ActualMoneyResponse } from "@/types";

interface ActualMoneyCardProps {
  year: number;
  month: number | null; // null = whole year
  onChange?: (year: number, month: number | null) => void;
  compact?: boolean;
}

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function ActualMoneyCard({
  year,
  month,
  onChange,
  compact = false,
}: ActualMoneyCardProps) {
  const { token, hasCouple } = useAuth();
  const [data, setData] = useState<ActualMoneyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const periodMode: "month" | "year" = month == null ? "year" : "month";

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getActualMoney(token, {
      year,
      month: periodMode === "month" ? month : null,
    })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, year, month, periodMode]);

  const handleModeChange = (next: "month" | "year") => {
    if (next === "year") {
      onChange?.(year, null);
    } else {
      onChange?.(year, month ?? new Date().getMonth() + 1);
    }
  };

  const label =
    periodMode === "year"
      ? `Año ${year}`
      : `${MONTH_NAMES_ES[(month ?? 1) - 1]} ${year}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          💰 Tu dinero real — {label}
        </h3>
        {onChange && (
          <div className="flex items-center gap-2">
            <select
              value={periodMode}
              onChange={(e) => handleModeChange(e.target.value as "month" | "year")}
              className="text-sm rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>
            {periodMode === "month" ? (
              <>
                <select
                  value={month ?? 1}
                  onChange={(e) => onChange(year, parseInt(e.target.value, 10))}
                  className="text-sm rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {MONTH_NAMES_ES.map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => onChange(parseInt(e.target.value, 10), month ?? 1)}
                  className="text-sm rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <select
                value={year}
                onChange={(e) => onChange(parseInt(e.target.value, 10), null)}
                className="text-sm rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {data && !loading && (
        <>
          {!compact && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">💵 Ingresos</span>
                <span className="text-emerald-600 font-semibold tabular-nums">
                  {formatCOP(data.total_income)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">💸 Gastos personales</span>
                <span className="text-slate-700 tabular-nums">
                  {formatCOP(data.personal_expenses)}
                </span>
              </div>
              {hasCouple && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    🤝 Tu parte de compartidos (
                    {Math.round(data.split_percentage * 100)}%)
                  </span>
                  <span className="text-slate-700 tabular-nums">
                    {formatCOP(data.shared_expenses_my_share)}
                  </span>
                </div>
              )}
            </div>
          )}

          {compact && (
            <div className="space-y-1 mb-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Ingresos</span>
                <span className="text-emerald-600 font-semibold tabular-nums">
                  {formatCOP(data.total_income)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gastos</span>
                <span className="text-slate-700 tabular-nums">
                  {formatCOP(
                    data.personal_expenses + data.shared_expenses_my_share,
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500">
                {data.actual_money >= 0 ? "Te quedan" : "Estás en negativo por"}
              </span>
              <span
                className={`text-2xl font-bold tabular-nums ${
                  data.actual_money >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatCOP(Math.abs(data.actual_money))}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
