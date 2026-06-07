"use client";

import type { CoupleHistory } from "@/types";

interface CoupleSelectorProps {
  couples: CoupleHistory[];
  activeCoupleId: number | null;
  onChange: (coupleId: number | null) => void;
}

export default function CoupleSelector({
  couples,
  activeCoupleId,
  onChange,
}: CoupleSelectorProps) {
  const activeCouple = couples.find((c) => c.is_active);
  const historicalCouples = couples.filter((c) => !c.is_active);

  return (
    <select
      value={activeCoupleId ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val ? Number(val) : null);
      }}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {activeCouple && (
        <option value={activeCouple.couple_id}>
          Pareja actual ({activeCouple.partner_name})
        </option>
      )}
      {historicalCouples.map((c) => (
        <option key={c.couple_id} value={c.couple_id}>
          {c.partner_name} (anterior)
        </option>
      ))}
    </select>
  );
}
