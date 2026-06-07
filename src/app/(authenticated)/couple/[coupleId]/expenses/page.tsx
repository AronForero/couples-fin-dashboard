"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getCoupleHistory, getCoupleExpenses } from "@/lib/api";
import Link from "next/link";
import type { CoupleHistory, Expense } from "@/types";
import ExpenseTable from "@/components/ExpenseTable";
import MonthPicker from "@/components/MonthPicker";

const now = new Date();

export default function CoupleExpensesPage() {
  const params = useParams();
  const coupleId = Number(params.coupleId);
  const { token } = useAuth();
  const [couple, setCouple] = useState<CoupleHistory | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getCoupleHistory(token)
      .then((couples) => {
        const found = couples.find((c) => c.couple_id === coupleId);
        setCouple(found ?? null);
      })
      .catch((e) => setError(e.message));
  }, [token, coupleId]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getCoupleExpenses(token, coupleId, year, month)
      .then(setExpenses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, coupleId, year, month]);

  if (!couple && !loading) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-500 mb-4">Pareja no encontrada</p>
        <Link
          href="/couple/manage"
          className="text-indigo-600 text-sm font-medium hover:underline"
        >
          Volver a gestionar pareja
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/couple/manage"
            className="text-sm text-slate-500 hover:text-slate-700 mb-1 inline-block"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {couple?.partner_name ?? "Cargando..."}
          </h1>
          {couple && (
            <p className="text-sm text-slate-500">
              {new Date(couple.joined_at).toLocaleDateString("es-CO", {
                month: "short",
                year: "numeric",
              })}{" "}
              —{" "}
              {couple.left_at
                ? new Date(couple.left_at).toLocaleDateString("es-CO", {
                    month: "short",
                    year: "numeric",
                  })
                : "Presente"}
            </p>
          )}
        </div>
        <MonthPicker
          year={year}
          month={month}
          onChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )}

      {!loading && expenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">
            No hay gastos registrados para este mes
          </p>
        </div>
      )}

      {!loading && expenses.length > 0 && (
        <ExpenseTable expenses={expenses} readOnly />
      )}
    </div>
  );
}
