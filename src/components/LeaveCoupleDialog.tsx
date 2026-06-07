"use client";

interface LeaveCoupleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partnerName: string;
  loading?: boolean;
}

export default function LeaveCoupleDialog({
  isOpen,
  onClose,
  onConfirm,
  partnerName,
  loading = false,
}: LeaveCoupleDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          ¿Salir de la pareja?
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Vas a dejar de compartir gastos con{" "}
          <span className="font-semibold">{partnerName}</span>. Se creará un
          nuevo código de invitación para formar una nueva pareja.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-slate-100 text-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saliendo..." : "Salir"}
          </button>
        </div>
      </div>
    </div>
  );
}
