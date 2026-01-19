"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2, IconAlertCircle } from "@tabler/icons-react";

interface Comprobante {
  id: string;
  archivoUrl: string;
}

interface VerificacionDialogsProps {
  selectedComprobante: Comprobante | null;
  showRejectDialog: boolean;
  onClosePreview: () => void;
  onCloseReject: () => void;
  onConfirmReject: () => void;
  motivoRechazo: string;
  setMotivoRechazo: (val: string) => void;
  loading: boolean;
}

export function VerificacionDialogs({
  selectedComprobante,
  showRejectDialog,
  onClosePreview,
  onCloseReject,
  onConfirmReject,
  motivoRechazo,
  setMotivoRechazo,
  loading,
}: VerificacionDialogsProps) {
  return (
    <>
      {/* Dialog preview */}
      <Dialog
        open={!!selectedComprobante && !showRejectDialog}
        onOpenChange={(open) => !open && onClosePreview()}
      >
        <DialogContent className="max-w-3xl rounded-[2rem] border-none bg-background/80 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
          <div className="relative p-6 pt-12">
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <IconAlertCircle className="size-5" />
              </div>
              <DialogTitle className="font-black uppercase tracking-widest text-xs">
                Previsualización de Documento
              </DialogTitle>
              <DialogDescription className="sr-only">
                Muestra la imagen o PDF del comprobante enviado por el padre de
                familia.
              </DialogDescription>
            </div>

            <div className="mt-8 rounded-2xl overflow-hidden border border-border shadow-inner bg-card">
              {selectedComprobante?.archivoUrl.startsWith("data:image") ? (
                <img
                  src={selectedComprobante.archivoUrl}
                  alt="Comprobante"
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md h-96 gap-4">
                  <div className="size-20 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <IconAlertCircle className="size-10" />
                  </div>
                  <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">
                    El documento es un archivo PDF
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl"
                  >
                    <a
                      href={selectedComprobante?.archivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir en nueva pestaña
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog rechazo */}
      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => !open && onCloseReject()}
      >
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
              <IconAlertCircle className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Rechazar Comprobante
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para indicar el motivo del rechazo del comprobante de
              pago.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-balance text-muted-foreground font-medium">
              Indica el motivo detallado del rechazo. El padre recibirá esta
              notificación para corregir el envío.
            </p>
            <Textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: El monto indicado no coincide con la imagen adjunta..."
              className="min-h-[120px] rounded-2xl border-border/50 bg-muted/20 focus:ring-destructive/20 transition-all resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 sm:justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={onCloseReject}
              className="rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmReject}
              disabled={loading || !motivoRechazo.trim()}
              className="rounded-xl px-8 font-black shadow-lg shadow-destructive/20 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                "Confirmar Rechazo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
