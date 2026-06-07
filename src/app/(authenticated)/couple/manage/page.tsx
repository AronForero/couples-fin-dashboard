"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getCoupleHistory, leaveCouple } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { CoupleHistory } from "@/types";
import CoupleHistoryCard from "@/components/CoupleHistoryCard";
import LeaveCoupleDialog from "@/components/LeaveCoupleDialog";

export default function CoupleManagePage() {
  const { token, user, refreshUser } = useAuth();
  const router = useRouter();
  const [couples, setCouples] = useState<CoupleHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const activeCouple = couples.find((c) => c.is_active);
  const historicalCouples = couples.filter((c) => !c.is_active);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getCoupleHistory(token)
      .then(setCouples)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleLeave() {
    if (!token) return;
    setLeaving(true);
    try {
      await leaveCouple(token);
      await refreshUser();
      router.push("/invite?left=true");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al salir de la pareja");
      setLeaving(false);
      setShowLeaveDialog(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Gestionar pareja</h1>
        <p className="text-sm text-slate-500 mt-1">
          Administrá tu pareja financiera actual y revisá el historial
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Current couple */}
      {activeCouple && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Pareja actual
              </h2>
              <p className="text-sm text-slate-500">
                En pareja con{" "}
                <span className="font-medium text-slate-700">
                  {activeCouple.partner_name}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Total gastado juntos</p>
              <p className="text-lg font-semibold text-slate-900 tabular-nums">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(activeCouple.total_spent)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLeaveDialog(true)}
            className="w-full bg-red-50 text-red-600 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Salir de la pareja
          </button>
        </div>
      )}

      {/* No active couple */}
      {!activeCouple && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500 mb-4">
            No tenés una pareja activa
          </p>
          <button
            onClick={() => router.push("/invite")}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Crear o unirse a una pareja
          </button>
        </div>
      )}

      {/* Historical couples */}
      {historicalCouples.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Parejas anteriores
          </h2>
          <div className="space-y-4">
            {historicalCouples.map((couple) => (
              <CoupleHistoryCard key={couple.couple_id} couple={couple} />
            ))}
          </div>
        </div>
      )}

      <LeaveCoupleDialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onConfirm={handleLeave}
        partnerName={activeCouple?.partner_name ?? ""}
        loading={leaving}
      />
    </div>
  );
}
