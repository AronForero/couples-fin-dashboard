"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getExpenses, updateExpense, deleteExpense } from "@/lib/api";
import type { Expense, ExpenseUpdate } from "@/types";
import MonthPicker from "@/components/MonthPicker";
import ExpenseTable from "@/components/ExpenseTable";
import ExpenseEditModal from "@/components/ExpenseEditModal";
import { formatCOP } from "@/components/CategoryBreakdown";

const now = new Date();

export default function ExpensesPage() {
  const { token, memberNames } = useAuth();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const fetchExpenses = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getExpenses(token, year, month)
      .then(setExpenses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, year, month]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  async function handleSave(id: number, data: ExpenseUpdate) {
    if (!token) return;
    await updateExpense(token, id, data);
    fetchExpenses();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteExpense(token, id);
    fetchExpenses();
  }

  const total = expenses.reduce((sum, e) => sum + e.valor, 0);
  const sharedCount = expenses.filter((e) => e.compartida === "Si").length;
  const personalCount = expenses.length - sharedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Gastos</h1>
        <MonthPicker
          year={year}
          month={month}
          onChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
      </div>

      {!loading && expenses.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Total</p>
            <p className="text-lg font-semibold text-slate-900 tabular-nums">
              {formatCOP(total)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Compartidos</p>
            <p className="text-lg font-semibold text-slate-900">{sharedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Personales</p>
            <p className="text-lg font-semibold text-slate-900">{personalCount}</p>
          </div>
        </div>
      )}

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

      {!loading && (
        <ExpenseTable expenses={expenses} onEdit={setEditingExpense} />
      )}

      <ExpenseEditModal
        expense={editingExpense}
        memberNames={memberNames}
        onClose={() => setEditingExpense(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
