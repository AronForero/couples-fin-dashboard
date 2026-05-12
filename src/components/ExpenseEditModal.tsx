"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Expense, ExpenseUpdate } from "@/types";

const CATEGORIES = [
  "ALIMENTACIÓN",
  "TRANSPORTE",
  "VIVIENDA",
  "SALUD",
  "EDUCACIÓN",
  "ENTRETENIMIENTO",
  "INTERESES",
  "AHORRO/INVERSIÓN",
  "IMPREVISTOS",
];

interface ExpenseEditModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: (id: number, data: ExpenseUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function ExpenseEditModal({
  expense,
  onClose,
  onSave,
  onDelete,
}: ExpenseEditModalProps) {
  const [fecha, setFecha] = useState("");
  const [concepto, setConcepto] = useState("");
  const [valor, setValor] = useState("");
  const [quienPago, setQuienPago] = useState("Aru");
  const [compartida, setCompartida] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (expense) {
      setFecha(expense.fecha);
      setConcepto(expense.concepto);
      setValor(String(expense.valor));
      setQuienPago(expense.quien_pago);
      setCompartida(expense.compartida === "Si");
      setCategoria(expense.categoria ?? "");
      setError("");
      setConfirmDelete(false);
    }
  }, [expense]);

  if (!expense) return null;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!expense) return;
    setError("");
    setSaving(true);
    try {
      await onSave(expense.id, {
        fecha,
        concepto,
        valor: parseInt(valor, 10),
        quien_pago: quienPago,
        compartida: compartida ? "Si" : "No",
        categoria: categoria || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!expense) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    try {
      await onDelete(expense.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Editar gasto</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor
              </label>
              <input
                type="number"
                required
                min={0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Concepto
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Categoría
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Quién pagó?
            </label>
            <div className="flex gap-2">
              {["Aru", "Mon"].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setQuienPago(name)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quienPago === name
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Gasto compartido
            </span>
            <button
              type="button"
              onClick={() => setCompartida(!compartida)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                compartida ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  compartida ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                confirmDelete
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              {confirmDelete ? "¿Eliminar?" : "Eliminar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
