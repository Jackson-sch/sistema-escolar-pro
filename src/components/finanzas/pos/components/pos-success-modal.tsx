"use client";

import {
  IconCircleCheck,
  IconPrinter,
  IconBrandWhatsapp,
  IconFileText,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface POSSuccessModalProps {
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  comprobanteEmitido: any;
  onImprimirTicket: () => void;
  onWhatsAppReceipt: () => void;
  onResetPOS: () => void;
}

export function POSSuccessModal({
  showSuccessModal,
  setShowSuccessModal,
  comprobanteEmitido,
  onImprimirTicket,
  onWhatsAppReceipt,
  onResetPOS,
}: POSSuccessModalProps) {
  if (!comprobanteEmitido) return null;

  const handleDownloadPdfA4 = () => {
    const url = `/api/documentos/comprobante-pago?numeroBoleta=${comprobanteEmitido.numeroBoleta}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-card border-border/60">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1">
            <IconCircleCheck className="size-7" />
          </div>
          <DialogTitle className="text-lg font-black text-foreground">
            ¡Cobranza Exitosa!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-mono">
            Comprobante N° {comprobanteEmitido.numeroBoleta}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estudiante:</span>
            <span className="font-bold text-foreground">
              {comprobanteEmitido.estudiante.name}{" "}
              {comprobanteEmitido.estudiante.apellidoPaterno}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto Cobrado:</span>
            <span className="font-mono font-black text-base text-primary">
              S/ {comprobanteEmitido.totalCobrado.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Método de Pago:</span>
            <span className="font-semibold text-foreground">
              {comprobanteEmitido.metodoPago}
            </span>
          </div>
          {comprobanteEmitido.vuelto > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold border-t border-border/30 pt-1.5">
              <span>Vuelto entregado:</span>
              <span className="font-mono">
                S/ {comprobanteEmitido.vuelto.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onImprimirTicket}
            className="h-10 rounded-xl font-bold text-xs gap-1 border-border/60 flex-col py-1.5"
            title="Imprimir ticket térmico 80mm"
          >
            <IconPrinter className="size-4 text-primary" />
            <span className="text-[10px]">Ticket 80mm</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdfA4}
            className="h-10 rounded-xl font-bold text-xs gap-1 border-border/60 flex-col py-1.5"
            title="Descargar Boleta oficial en PDF A4"
          >
            <IconFileText className="size-4 text-sky-600" />
            <span className="text-[10px]">Boleta A4</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onWhatsAppReceipt}
            className="h-10 rounded-xl font-bold text-xs gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 flex-col py-1.5"
            title="Enviar recibo digital por WhatsApp"
          >
            <IconBrandWhatsapp className="size-4" />
            <span className="text-[10px]">WhatsApp</span>
          </Button>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={onResetPOS}
          className="w-full h-10 rounded-xl font-extrabold text-xs mt-2 cursor-pointer"
        >
          Nuevo Cobro
        </Button>
      </DialogContent>
    </Dialog>
  );
}
