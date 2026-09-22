import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconReceipt } from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { cn } from "@/lib/utils";

export function StudentPagosTab({ cronogramas }: { cronogramas: any[] }) {
  const items = React.useMemo(() => {
    const now = new Date();
    return cronogramas.map((c: any) => ({
      ...c,
      isVenc:
        c.estado === "EXPIRED" ||
        (c.estado === "PENDING" && new Date(c.fechaVencimiento) < now),
      isPagado: c.estado === "PAID",
    }));
  }, [cronogramas]);

  return (
    <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <IconReceipt className="size-4 text-primary" /> Cronograma de Pagos y
          Cuotas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0" suppressHydrationWarning>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No se han generado cuotas de pago para este estudiante.
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((c: any) => {
              const { isVenc, isPagado } = c;
              return (
                <div
                  key={c.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {c.concepto?.nombre || "Cuota Escolar"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Vencimiento: {formatDate(c.fechaVencimiento)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold">
                      {formatCurrency(c.monto)}
                    </span>
                    <Badge
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        isPagado &&
                          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                        isVenc &&
                          "bg-rose-500/10 text-rose-600 border-rose-500/20",
                        !isPagado &&
                          !isVenc &&
                          "bg-amber-500/10 text-amber-600 border-amber-500/20",
                      )}
                    >
                      {isPagado
                        ? "✓ Pagado"
                        : isVenc
                          ? "⚠️ Vencido"
                          : "⏳ Pendiente"}
                    </Badge>
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
