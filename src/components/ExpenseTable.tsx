"use client";

import type { Expense } from "@/types";
import { formatCOP } from "@/components/CategoryBreakdown";

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  readOnly?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  ALIMENTACIÓN: "bg-green-100 text-green-700",
  ENTRETENIMIENTO: "bg-purple-100 text-purple-700",
  TRANSPORTE: "bg-blue-100 text-blue-700",
  SALUD: "bg-pink-100 text-pink-700",
  EDUCACIÓN: "bg-amber-100 text-amber-700",
  VIVIENDA: "bg-orange-100 text-orange-700",
  INTERESES: "bg-cyan-100 text-cyan-700",
  "AHORRO/INVERSIÓN": "bg-teal-100 text-teal-700",
  IMPREVISTOS: "bg-slate-100 text-slate-600",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export default function ExpenseTable({ expenses, onEdit, readOnly = false }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-slate-400">No hay gastos este mes</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Concepto</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Categoría</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Pagó</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Valor</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">Compartida</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">A pagar</th>
              {!readOnly && <th className="px-4 py-3 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {formatDate(exp.fecha)}
                </td>
                <td className="px-4 py-3 text-slate-900 font-medium max-w-[200px] truncate">
                  {exp.concepto}
                </td>
                <td className="px-4 py-3">
                  {exp.categoria && (
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        CATEGORY_COLORS[exp.categoria] ?? CATEGORY_COLORS.IMPREVISTOS
                      }`}
                    >
                      {exp.categoria.toLowerCase()}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      exp.quien_pago === "Aru"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {exp.quien_pago}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-900 whitespace-nowrap">
                  {formatCOP(exp.valor)}
                </td>
                <td className="px-4 py-3 text-center">
                  {exp.compartida === "Si" ? (
                    <span className="text-emerald-500">✓</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600 whitespace-nowrap">
                  {exp.valor_a_pagar ? formatCOP(exp.valor_a_pagar) : "—"}
                </td>
                {!readOnly && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit?.(exp)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
