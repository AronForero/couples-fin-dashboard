"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getExpenses, getIncomes, updateExpense, deleteExpense } from "@/lib/api";
import type { Expense, ExpenseUpdate, Income, Transaction, TransactionFilter } from "@/types";
import MonthPicker from "@/components/MonthPicker";
import ExpenseTable from "@/components/ExpenseTable";
import ExpenseEditModal from "@/components/ExpenseEditModal";
import { formatCOP } from "@/components/CategoryBreakdown";

const now = new Date();

const FILTER_LABELS: Record<TransactionFilter, string> = {
  all: "Todos",
  expenses: "Gastos",
  incomes: "Ingresos",
};

export default function ExpensesPage() {
  const { token, memberNames, isActive } = useAuth();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>("all");

  const fetchData = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    Promise.all([
      getExpenses(token, year, month),
      getIncomes(token, year, month),
    ])
      .then(([exps, incs]) => {
        setExpenses(exps);
        setIncomes(incs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave(id: number, data: ExpenseUpdate) {
    if (!token) return;
    await updateExpense(token, id, data);
    fetchData();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteExpense(token, id);
    fetchData();
  }

  const expenseTotal = expenses.reduce((sum, e) => sum + e.valor, 0);
  const incomeTotal = incomes.reduce((sum, i) => sum + i.valor, 0);
  const sharedCount = expenses.filter((e) => e.compartida === "Si").length;
  const personalCount = expenses.length - sharedCount;

  const expenseTransactions: Transaction[] = expenses.map((e) => ({ ...e, type: "expense" }));
  const incomeTransactions: Transaction[] = incomes.map((i) => ({ ...i, type: "income" }));

  const allTransactions = [...expenseTransactions, ...incomeTransactions].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return b.id - a.id;
  });

  const visibleTransactions = allTransactions.filter((t) => {
    if (filter === "expenses") return t.type === "expense";
    if (filter === "incomes") return t.type === "income";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Transacciones</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {(Object.keys(FILTER_LABELS) as TransactionFilter[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {FILTER_LABELS[key]}
              </button>
            ))}
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
      </div>

      {!loading && (expenses.length > 0 || incomes.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Total gastos</p>
            <p className="text-lg font-semibold text-slate-900 tabular-nums">
              {formatCOP(expenseTotal)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Total ingresos</p>
            <p className="text-lg font-semibold text-emerald-600 tabular-nums">
              {formatCOP(incomeTotal)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Gastos compartidos</p>
            <p className="text-lg font-semibold text-slate-900">{sharedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Gastos personales</p>
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

      {!loading && visibleTransactions.length === 0 && allTransactions.length > 0 && (
        <div className="text-sm text-slate-500 text-center py-12">
          No hay {filter === "expenses" ? "gastos" : "ingresos"} para el mes seleccionado.
        </div>
      )}

      {!loading && visibleTransactions.length === 0 && allTransactions.length === 0 && (
        <div className="text-sm text-slate-500 text-center py-12">
          No hay transacciones para el mes seleccionado.
        </div>
      )}

      {!loading && visibleTransactions.length > 0 && (
        <ExpenseTable
          transactions={visibleTransactions}
          onEdit={setEditingExpense}
          readOnly={!isActive}
        />
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
