"use client";

import { Separator } from "@/components/ui/separator";
import { VerificacionHeader } from "@/components/finanzas/verificacion/verificacion-header";
import { VerificacionVoucher } from "@/components/finanzas/verificacion/verificacion-voucher";
import { VerificacionActionPanel } from "@/components/finanzas/verificacion/verificacion-action-panel";
import { Comprobante } from "@/components/finanzas/verificacion/types";

interface VerificacionDetailProps {
  comprobante: Comprobante;
  loading: boolean;
  onAprobar: (id: string) => void;
  onRechazar: (comprobante: Comprobante) => void;
  motivoRechazo: string;
  setMotivoRechazo: (val: string) => void;
  onBack?: () => void;
}

export function VerificacionDetail({
  comprobante,
  loading,
  onAprobar,
  onRechazar,
  motivoRechazo,
  setMotivoRechazo,
  onBack,
}: VerificacionDetailProps) {
  return (
    <div className="flex flex-col h-full bg-card animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto custom-scrollbar p-4 sm:p-6">
      <div className="max-w-6xl mx-auto w-full">
        <VerificacionHeader comprobante={comprobante} onBack={onBack} />

        <Separator decorative />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-5">
            <VerificacionVoucher archivoUrl={comprobante.archivoUrl} />
          </div>

          <div className="lg:col-span-7">
            <VerificacionActionPanel
              comprobante={comprobante}
              loading={loading}
              onAprobar={onAprobar}
              onRechazar={onRechazar}
              motivoRechazo={motivoRechazo}
              setMotivoRechazo={setMotivoRechazo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
