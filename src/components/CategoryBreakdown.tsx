"use client";

import type { CategoryBreakdown } from "@/types";

interface CategoryBreakdownProps {
  title: string;
  data: CategoryBreakdown;
  total: number;
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CategoryBreakdown({
  title,
  data,
  total,
}: CategoryBreakdownProps) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  if (entries.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {title}
      </h4>
      <div className="space-y-2">
        {entries.map(([cat, amount]) => {
          const pct = total > 0 ? (amount / total) * 100 : 0;
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
  );
}

export { formatCOP };
