"use client";

import {
  User,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  XCircle,
  Layers,
  Loader2,
  X,
  DollarSign,
  CreditCard,
  Box,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UniformReceiptDownload } from "./uniform-receipt-download";
import { formatCurrency } from "@/lib/formats";

interface SalesDetailDialogProps {
  venta: any | null;
  onClose: () => void;
  isPending: boolean;
  onUpdateStatus: (ventaId: string, nuevoEstado: any) => void;
  onApprove: (ventaId: string) => void;
  onConfirmDelivery: (ventaId: string) => void;
}

export function SalesDetailDialog({
  venta,
  onClose,
  isPending,
  onUpdateStatus,
  onApprove,
  onConfirmDelivery,
}: SalesDetailDialogProps) {
  return (
    <Dialog open={!!venta} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-border/50 bg-card rounded-3xl overflow-hidden shadow-sm">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <BadgeDollarSign className="size-7 text-primary" />
            Venta {venta?.codigo}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/60 text-xs font-medium uppercase tracking-wider">
            Gestión de reserva y aprobación administrativa.
          </DialogDescription>
        </DialogHeader>

        {venta && (
          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/10 border border-border/20 shadow-sm flex flex-col gap-2">
                <span className="text-[8px] font-bold text-primary/80 uppercase tracking-widest bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-full w-max">
                  Estudiante
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-foreground capitalize">
                  <User className="size-4 text-primary shrink-0" />
                  {venta.estudiante?.name}{" "}
                  {venta.estudiante?.apellidoPaterno}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-muted/10 border border-border/20 shadow-sm flex flex-col gap-2">
                <span className="text-[8px] font-bold text-primary/80 uppercase tracking-widest bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-full w-max">
                  Sede de recojo
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Building2 className="size-4 text-primary shrink-0" />
                  {venta.sede?.nombre}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-muted-foreground/80 uppercase ml-1">
                Resumen de pedido
              </span>
              <div className="space-y-2">
                {venta.detalles?.map((d: any) => (
                  <div
                    key={d.id}
                    className="p-3.5 flex justify-between items-center bg-muted/5 border border-border/10 rounded-2xl hover:bg-muted/10 transition-colors duration-200"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-foreground">
                        {d.variante.uniforme.nombre}
                      </span>
                      <div className="flex gap-2">
                        <span className="text-[9px] text-primary/80 bg-primary/5 border border-primary/10 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                          Talla {d.variante.talla}
                        </span>
                        <span className="text-[9px] text-muted-foreground/80 font-bold bg-muted/20 px-2 py-0.5 rounded-md">
                          {d.cantidad} {d.cantidad === 1 ? "unidad" : "unidades"}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-foreground font-mono">
                      {formatCurrency(d.subtotal)}
                    </span>
                  </div>
                ))}
                
                <div className="mt-4 p-4 flex justify-between items-center bg-linear-to-r from-success/5 via-success/10 to-success/5 border border-success/20 rounded-2xl shadow-inner">
                  <span className="text-xs font-bold text-foreground uppercase tracking-widest">
                    Total a Pagar
                  </span>
                  <span className="text-2xl font-black text-success font-monoer">
                    {formatCurrency(venta.total)}
                  </span>
                </div>
              </div>
            </div>

            {venta.estado === "RESERVADO" && (
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 flex items-start gap-3.5 shadow-[0_4px_16px_rgba(245,158,11,0.03)] animate-pulse">
                <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  <span className="font-black text-amber-600 dark:text-amber-400 block mb-0.5 uppercase tracking-wider">
                    Aprobación Administrativa Requerida
                  </span>
                  Al aprobar esta reserva, se generará una obligación de pago en el cronograma escolar y el stock se descontará del inventario.
                </div>
              </div>
            )}

            {venta.estado === "APROBADO" && (
              <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-3.5 shadow-[0_4px_16px_rgba(16,185,129,0.03)]">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 block mb-0.5 uppercase tracking-wider">
                    Reserva Aprobada
                  </span>
                  La reserva administrativa ha sido autorizada y vinculada con éxito al módulo de tesorería del estudiante.
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-6 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="border-border/30 bg-muted/10 text-foreground/80 hover:bg-muted/20 rounded-xl flex-1 transition-[background-color,transform] duration-200 active:scale-[0.98]"
          >
            <X className="size-4" />
            Cerrar
          </Button>
          {venta?.estado === "RESERVADO" && (
            <div className="flex gap-2 flex-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateStatus(venta.id, "CANCELADO")}
                disabled={isPending}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-full transition-[color,background-color,transform] duration-200 active:scale-95"
              >
                <XCircle className="size-4" /> Rechazar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateStatus(venta.id, "EN_PRUEBA")}
                disabled={isPending}
                className="text-violet-500 hover:text-violet-600 hover:bg-violet-500/10 rounded-full transition-[color,background-color,transform] duration-200 active:scale-95"
              >
                <Layers className="size-4" />
                Prueba
              </Button>
              <Button
                onClick={() => onApprove(venta.id)}
                disabled={isPending}
                size="sm"
                className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 rounded-full transition-[background-color,transform] duration-200 active:scale-95"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4" />
                    <span>Aprobar y Cobrar</span>
                  </div>
                )}
              </Button>
            </div>
          )}
          {venta?.estado === "EN_PRUEBA" && (
            <div className="flex gap-2 flex-3">
              <Button
                variant="ghost"
                onClick={() => onUpdateStatus(venta.id, "CANCELADO")}
                disabled={isPending}
                size="sm"
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-full transition-[color,background-color,transform] duration-200 active:scale-95"
              >
                <XCircle className="size-4" /> Rechazar
              </Button>
              <Button
                onClick={() => onApprove(venta.id)}
                disabled={isPending}
                size="sm"
                className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 rounded-full transition-[background-color,transform] duration-200 active:scale-95"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4" />
                    <span>Aprobar y Cobrar</span>
                  </div>
                )}
              </Button>
            </div>
          )}
          {venta?.estado === "APROBADO" && (
            <div className="flex gap-2 flex-1">
              <UniformReceiptDownload venta={venta} />
              <Button
                onClick={() => onConfirmDelivery(venta.id)}
                disabled={isPending}
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full transition-[background-color,transform] duration-200 active:scale-95"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Box className="size-4" />
                    <span>Confirmar Entrega</span>
                  </div>
                )}
              </Button>
            </div>
          )}
          {venta && ["ENTREGADO", "PAGADO"].includes(venta.estado) && (
            <UniformReceiptDownload venta={venta} />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
