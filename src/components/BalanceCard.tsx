"use client";

import type { SharedBalance } from "@/types";
import { formatCOP } from "@/components/CategoryBreakdown";

interface BalanceCardProps {
  compartido: SharedBalance;
  memberNames: [string, string];
}

export default function BalanceCard({
  compartido,
  memberNames,
}: BalanceCardProps) {
  const {
    aron_gasto,
    mon_gasto,
    gastos_totales,
    balance_key,
    deuda_total,
    por_categoria,
  } = compartido;

  const [name0, name1] = memberNames;

  const deudor = balance_key.includes(`${name1} debe`) ? name1 : name0;
  const acreedor = deudor === name1 ? name0 : name1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Gastos compartidos
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">{name0} pagó</p>
          <p className="text-lg font-semibold text-slate-900 tabular-nums">
            {formatCOP(aron_gasto)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">{name1} pagó</p>
          <p className="text-lg font-semibold text-slate-900 tabular-nums">
            {formatCOP(mon_gasto)}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500">Total compartidos</span>
          <span className="font-medium text-slate-900 tabular-nums">
            {formatCOP(gastos_totales)}
          </span>
        </div>
      </div>

      {deuda_total > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{deudor}</span> debe a{" "}
            <span className="font-semibold">{acreedor}</span>
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1 tabular-nums">
            {formatCOP(deuda_total)}
          </p>
        </div>
      )}

      {deuda_total === 0 && gastos_totales > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-emerald-800 font-medium">
            Están a mano este mes
          </p>
        </div>
      )}

      {Object.keys(por_categoria).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Por categoría
          </h4>
          <div className="space-y-2">
            {Object.entries(por_categoria)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => {
                const pct =
                  gastos_totales > 0 ? (amount / gastos_totales) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="text-slate-700 capitalize">
                        {cat.toLowerCase()}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {formatCOP(amount)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
