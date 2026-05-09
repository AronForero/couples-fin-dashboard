"use client";

import type { Expense } from "@/types";
import { formatCOP } from "@/components/CategoryBreakdown";

interface ExpenseTableProps {
  expenses: Expense[];
}

const CATEGORY_COLORS: Record<string, string> = {
  ALIMENTACIÓN: "bg-green-100 text-green-700",
  ENTRETENIMIENTO: "bg-purple-100 text-purple-700",
  TRANSPORTE: "bg-blue-100 text-blue-700",
  SALUD: "bg-pink-100 text-pink-700",
  EDUCACIÓN: "bg-amber-100 text-amber-700",
  HOGAR: "bg-orange-100 text-orange-700",
  SERVICIOS: "bg-cyan-100 text-cyan-700",
  ROPA: "bg-fuchsia-100 text-fuchsia-700",
  OTROS: "bg-slate-100 text-slate-600",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
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
                        CATEGORY_COLORS[exp.categoria] ?? CATEGORY_COLORS.OTROS
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
