"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formats";
import {
  IconHistory,
  IconReceipt2,
  IconWallet,
  IconCalendarCheck,
  IconX,
} from "@tabler/icons-react";
import { BoletaDownloadButton } from "./boleta-download-button";

interface PaymentHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historial: any[];
}

export function PaymentHistoryDrawer({
  open,
  onOpenChange,
  historial,
}: PaymentHistoryDrawerProps) {
  const totalPagado = historial.reduce((sum, item) => sum + item.monto, 0);
  const ultimoPago = historial[0]?.updatedAt;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      shouldScaleBackground={false}
    >
      <DrawerContent className="ml-auto flex h-full max-w-[440px] flex-col border-l border-border/40 bg-card/95 shadow-lg outline-none">
        {/* ── HEADER ── */}
        <DrawerHeader className="border-b border-border/30 px-6 pb-4 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <IconHistory className="size-5" />
              </div>
              <div>
                <DrawerTitle className="text-lg font-bold text-foreground tracking-tight leading-tight">
                  Historial de Pagos
                </DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                  Registro de transacciones validadas
                </DrawerDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="size-8 rounded-xl border border-border/40 hover:bg-muted text-muted-foreground cursor-pointer"
            >
              <IconX className="size-4" />
            </Button>
          </div>

          {/* ── STATS SUMMARY BLOCK ── */}
          {historial.length > 0 && (
            <div className="rounded-2xl border border-border/40 bg-muted/30 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <IconWallet className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Total Invertido
                    </span>
                    <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">
                      {formatCurrency(totalPagado)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Pagos Concluidos
                  </span>
                  <p className="text-lg font-bold font-mono text-foreground leading-none mt-0.5">
                    {historial.length}
                  </p>
                </div>
              </div>

              {ultimoPago && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-border/20 text-xs text-muted-foreground font-medium">
                  <IconCalendarCheck className="size-3.5 text-indigo-500 shrink-0" />
                  <span>
                    Último pago el:{" "}
                    <strong className="font-mono font-bold text-foreground">
                      {formatDate(ultimoPago, "dd MMM yyyy")}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </DrawerHeader>

        {/* ── LISTA DE PAGOS REALIZADOS ── */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-3">
            {historial.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                <div className="size-16 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground/40">
                  <IconReceipt2 className="size-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground text-sm">
                    Sin registros de pago
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[220px]">
                    Los pagos que efectúes aparecerán aquí con su respectiva boleta de venta.
                  </p>
                </div>
              </div>
            ) : (
              historial.map((item) => {
                const pagoValido =
                  item.pagos && item.pagos.length > 0 ? item.pagos[0] : null;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/40 bg-card/80 p-4 space-y-3 transition-[border-color] hover:border-indigo-500/30 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-bold text-xs text-foreground truncate">
                          {item.concepto.nombre}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                            {formatDate(item.updatedAt, "dd MMM yyyy")}
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md"
                          >
                            Procesado
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold font-mono text-foreground">
                          {formatCurrency(item.monto)}
                        </p>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">
                          Soles (S/)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-border/20">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <IconReceipt2 className="size-3.5 text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Comprobante Emitido
                        </span>
                      </div>

                      {pagoValido ? (
                        <BoletaDownloadButton
                          pago={pagoValido}
                          estudiante={item.estudiante}
                        />
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/60 italic">
                          En emisión...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {historial.length > 0 && (
              <p className="pt-4 text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                Boletas y comprobantes electrónicos emitidos de forma oficial.
                <br />
                Para consultas sobre pagos, contactar al área de Tesorería.
              </p>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
