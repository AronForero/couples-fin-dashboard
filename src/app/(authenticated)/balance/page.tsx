"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getBalance, getCoupleHistory } from "@/lib/api";
import type { BalanceResponse, CoupleHistory } from "@/types";
import MonthPicker from "@/components/MonthPicker";
import BalanceCard from "@/components/BalanceCard";
import CategoryBreakdown, { formatCOP } from "@/components/CategoryBreakdown";
import CoupleSelector from "@/components/CoupleSelector";

const now = new Date();

export default function BalancePage() {
  const { token, memberNames } = useAuth();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couples, setCouples] = useState<CoupleHistory[]>([]);
  const [selectedCoupleId, setSelectedCoupleId] = useState<number | null>(null);

  // Fetch couple history on mount
  useEffect(() => {
    if (!token) return;
    getCoupleHistory(token)
      .then((history) => {
        setCouples(history);
        const active = history.find((c) => c.is_active);
        if (active) setSelectedCoupleId(active.couple_id);
      })
      .catch(() => {});
  }, [token]);

  // Fetch balance when couple or month changes
  useEffect(() => {
    if (!token || !selectedCoupleId) return;
    setLoading(true);
    setError("");
    getBalance(token, year, month, selectedCoupleId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, year, month, selectedCoupleId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Balance</h1>
        <div className="flex items-center gap-4">
          {couples.length > 1 && (
            <CoupleSelector
              couples={couples}
              activeCoupleId={selectedCoupleId}
              onChange={setSelectedCoupleId}
            />
          )}
          <MonthPicker
            year={year}
            month={month}
            onChange={(y, m) => {
              setYear(y);
              setMonth(m);
            }}
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          <BalanceCard
            compartido={data.compartido}
            memberNames={memberNames}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Gastos personales
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {data.personal.viewer_name}
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-500 mb-1">Total personal</p>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">
                {formatCOP(data.personal.viewer_gasto)}
              </p>
            </div>

            <CategoryBreakdown
              title="Por categoría"
              data={data.personal.por_categoria}
              total={data.personal.gastos_totales}
            />

            {data.personal.gastos_totales === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                Sin gastos personales este mes
              </p>
            )}
          </div>
        </div>
      )}

      {data &&
        !loading &&
        data.compartido.gastos_totales === 0 &&
        data.personal.gastos_totales === 0 && (
          <p className="text-sm text-slate-400 text-center py-12">
            No hay gastos registrados para {data.mes.toLowerCase()} {year}
          </p>
        )}
    </div>
  );
}
