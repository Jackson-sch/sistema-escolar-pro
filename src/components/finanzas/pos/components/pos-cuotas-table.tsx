"use client";

import { useMemo } from "react";
import {
  IconReceipt2,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/formats";
import { StudentCobroData } from "./pos-types";

interface POSCuotasTableProps {
  studentData: StudentCobroData;
  selectedCronogramaIds: string[];
  onToggleCronograma: (id: string) => void;
  onSelectAllExpired: () => void;
}

export function POSCuotasTable({
  studentData,
  selectedCronogramaIds,
  onToggleCronograma,
  onSelectAllExpired,
}: POSCuotasTableProps) {
  const selectedIdSet = useMemo(
    () => new Set(selectedCronogramaIds),
    [selectedCronogramaIds]
  );

  return (
    <Card className="rounded-2xl border-border/60 bg-card shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <IconReceipt2 className="size-4 text-primary" /> Cuotas y Pensiones
            del Año
          </CardTitle>
          <CardDescription className="text-xs">
            Selecciona las cuotas que el padre va a cancelar en esta operación
          </CardDescription>
        </div>
        {studentData.resumen.cuotasVencidasCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSelectAllExpired}
            className="h-8 rounded-xl text-xs font-bold border-rose-500/30 text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 shrink-0 cursor-pointer"
          >
            <IconAlertTriangle className="size-3.5 mr-1" />
            Pagar Vencidas ({studentData.resumen.cuotasVencidasCount})
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
        {studentData.cronogramas.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            No hay cronogramas registrados para este alumno.
          </p>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {studentData.cronogramas.map((c) => {
              const isSelected = selectedIdSet.has(c.id);
              const isPaid = c.estado === "PAID";
              const isExpired = c.estado === "EXPIRED";

              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={isPaid ? -1 : 0}
                  aria-pressed={isSelected}
                  aria-disabled={isPaid}
                  onClick={() => !isPaid && onToggleCronograma(c.id)}
                  onKeyDown={(e) => {
                    if (!isPaid && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onToggleCronograma(c.id);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl border transition-all select-none",
                    isPaid
                      ? "bg-muted/10 border-border/30 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "bg-primary/5 border-primary/50 ring-1 ring-primary/30 cursor-pointer shadow-2xs"
                      : isExpired
                      ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50 cursor-pointer"
                      : "bg-card border-border/60 hover:border-border cursor-pointer",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-border/60 bg-background",
                        isPaid &&
                          "bg-emerald-500/20 border-emerald-500/40 text-emerald-600",
                      )}
                    >
                      {isSelected && (
                        <IconCheck size={13} className="stroke-[3]" />
                      )}
                      {isPaid && <IconCheck size={13} className="stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-extrabold text-foreground truncate">
                          {c.conceptoNombre}
                        </p>
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase py-0",
                            isPaid &&
                              "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                            isExpired &&
                              "bg-rose-500/10 text-rose-600 border-rose-500/20",
                            !isPaid &&
                              !isExpired &&
                              "bg-amber-500/10 text-amber-600 border-amber-500/20",
                          )}
                        >
                          {isPaid
                            ? "Pagado"
                            : isExpired
                            ? `Vencido (${c.diasVencido}d)`
                            : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Vencimiento: {formatDate(c.fechaVencimiento)}
                        {c.moraAcumulada > 0 &&
                          ` · Mora: S/ ${c.moraAcumulada.toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold font-mono text-foreground">
                      {formatCurrency(
                        c.saldoPendiente > 0 ? c.saldoPendiente : c.montoTotal,
                      )}
                    </p>
                    {c.montoPagado > 0 && !isPaid && (
                      <p className="text-[10px] text-emerald-600 font-mono">
                        Pagado: S/ {c.montoPagado.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
