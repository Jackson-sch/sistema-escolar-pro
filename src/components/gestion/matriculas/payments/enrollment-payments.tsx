"use client";

import * as React from "react";
import { getCronogramaAction } from "@/actions/finance";
import {
  IconReceipt,
  IconCalendar,
  IconAlertTriangle,
  IconCheck,
  IconLoader2,
  IconClock,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/formats";
import { cn } from "@/lib/utils";

interface EnrollmentPaymentsProps {
  estudianteId: string;
}

export function EnrollmentPayments({ estudianteId }: EnrollmentPaymentsProps) {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      if (!estudianteId) return;
      setLoading(true);
      try {
        const res = await getCronogramaAction({ estudianteId });
        if (res.success) {
          setPayments(res.success);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [estudianteId]);

  if (loading) {
    return (
      <Card className="w-full h-[400px] flex flex-col items-center justify-center border-dashed">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary/60" />
          <p className="text-sm font-medium">Cargando cronograma...</p>
        </div>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
            <IconReceipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">
              Sin pagos registrados
            </h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              No se ha generado un cronograma de pagos para este estudiante.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Cálculos
  const totalDeuda = payments.reduce(
    (acc, p) =>
      p.pagado ? acc : acc + (Number(p.monto) - Number(p.montoPagado)),
    0
  );
  const cuotasPendientes = payments.filter((p) => !p.pagado).length;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <IconReceipt className="h-5 w-5 text-primary" />
          Cronograma de Pagos
        </CardTitle>
        <CardDescription>
          Resumen de cuotas y estado de cuenta del estudiante.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Resumen de Deuda - Diseño Sutil */}
        <div className="bg-muted/40 border rounded-lg p-4 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Deuda Total Pendiente
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {formatCurrency(totalDeuda)}
            </p>
          </div>
          <div className="text-right">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-xs font-medium"
            >
              {cuotasPendientes} cuota{cuotasPendientes !== 1 ? "s" : ""} por
              pagar
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Lista de Pagos */}
        <ScrollArea className="h-[400px] pr-4 -mr-4">
          <div className="space-y-3 pr-4">
            {payments.map((p) => {
              const isVencido =
                new Date(p.fechaVencimiento) < new Date() && !p.pagado;
              const pendiente = Number(p.monto) - Number(p.montoPagado);

              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card transition-colors hover:bg-muted/30",
                    isVencido && "border-destructive/30 bg-destructive/5"
                  )}
                >
                  {/* Info Izquierda */}
                  <div className="space-y-1.5 mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm leading-none">
                        {p.concepto.nombre}
                      </span>
                      {isVencido && (
                        <span
                          className="flex h-2 w-2 rounded-full bg-destructive"
                          title="Vencido"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconCalendar className="h-3 w-3" />
                        <span>Vence: {formatDate(p.fechaVencimiento)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Derecha (Estado y Monto) */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[140px]">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(Number(p.monto))}
                      </span>
                      {pendiente > 0 &&
                        !p.pagado &&
                        pendiente !== Number(p.monto) && (
                          <span className="text-[10px] text-muted-foreground">
                            Resta: {formatCurrency(pendiente)}
                          </span>
                        )}
                    </div>

                    <div className="w-[90px] flex justify-end">
                      {p.pagado ? (
                        <Badge
                          variant="outline"
                          className="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 gap-1 pr-2.5"
                        >
                          <IconCheck className="h-3 w-3" /> Pagado
                        </Badge>
                      ) : isVencido ? (
                        <Badge
                          variant="destructive"
                          className="gap-1 pr-2.5 shadow-none"
                        >
                          <IconAlertTriangle className="h-3 w-3" /> Vencido
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground gap-1 pr-2.5"
                        >
                          <IconClock className="h-3 w-3" /> Pendiente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
