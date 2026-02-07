"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { FormModal } from "@/components/modals/form-modal";

interface VerificacionDialogsProps {
  showRejectDialog: boolean;
  onCloseReject: () => void;
  onConfirmReject: () => void;
  motivoRechazo: string;
  setMotivoRechazo: (val: string) => void;
  loading: boolean;
}

export function VerificacionDialogs({
  showRejectDialog,
  onCloseReject,
  onConfirmReject,
  motivoRechazo,
  setMotivoRechazo,
  loading,
}: VerificacionDialogsProps) {
  return (
    <FormModal
      isOpen={showRejectDialog}
      onOpenChange={(open) => !open && onCloseReject()}
      title="Rechazar Comprobante"
      description="Indica el motivo detallado del rechazo. El padre recibirá esta notificación para corregir el envío."
      className="sm:max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
          <IconAlertCircle className="size-6 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">
            Esta acción no se puede deshacer. El comprobante pasará a estado
            rechazado.
          </p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Motivo del Rechazo
          </label>
          <Textarea
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
            placeholder="Ej: El monto indicado no coincide con la imagen adjunta..."
            className="min-h-[120px] rounded-2xl border-zinc-200 dark:border-zinc-800 focus:ring-destructive/20 transition-all resize-none shadow-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onCloseReject}
            className="flex-1 rounded-full font-bold text-zinc-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmReject}
            disabled={loading || !motivoRechazo.trim()}
            className="flex-1 rounded-full active:scale-[0.98] transition-all"
          >
            {loading ? (
              <>
                <IconLoader2 className="mr-2 size-5 animate-spin" />
                Rechazando...
              </>
            ) : (
              "Confirmar Rechazo"
            )}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}
