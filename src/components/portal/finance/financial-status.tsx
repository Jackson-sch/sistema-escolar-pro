"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconCreditCard } from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";

interface FinancialStatusProps {
  payments: {
    overdue: any[];
    upcoming: any[];
    totalDeuda: number;
  };
}

export function FinancialStatus({ payments }: FinancialStatusProps) {
  const overdueAmount = payments.overdue.reduce(
    (acc, p) => acc + (p.monto - p.montoPagado),
    0,
  );
  const upcomingAmount = payments.upcoming[0]?.monto || 0;

  return (
    <Card className="@container flex h-full flex-col overflow-hidden rounded-2xl border-border/50 bg-card/80 shadow-sm">
      <CardContent className="p-6 flex flex-col gap-6 h-full">
        <h3 className="font-bold text-sm uppercase tracking-wider">
          Estado Financiero
        </h3>

        <div className="grid grid-cols-1 @xs:grid-cols-2 gap-4">
          {/* Overdue Section */}
          <div className="flex min-w-0 flex-col justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex w-full flex-col items-start">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">
                Total Vencido
              </p>
              <p className="text-xl @[12rem]:text-2xl font-black text-red-500 whitespace-nowrap">
                {formatCurrency(overdueAmount)}
              </p>
            </div>
          </div>

          {/* Upcoming Section */}
          <div className="flex min-w-0 flex-col justify-center rounded-xl border border-success/20 bg-success/5 p-4">
            <div className="flex w-full flex-col items-start">
              <p className="text-[10px] font-bold text-success uppercase tracking-widest mb-1">
                Próximo a Vencer
              </p>
              <p className="text-xl @[12rem]:text-2xl font-black text-success whitespace-nowrap">
                {formatCurrency(upcomingAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed List of Pending Payments */}
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Detalle de Deuda (
            {payments.overdue.length + payments.upcoming.length})
          </p>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
            {/* Overdue Items */}
            {payments.overdue.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {p.concepto.nombre}
                  </p>
                  <p className="text-[10px] font-bold text-red-500 uppercase">
                    Vencido • {formatDate(p.fechaVencimiento, "dd MMMM")}
                  </p>
                </div>
                <p className="text-sm font-black text-red-500 shrink-0 ml-2">
                  {formatCurrency(p.monto - p.montoPagado)}
                </p>
              </div>
            ))}

            {/* Upcoming Items */}
            {payments.upcoming.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {p.concepto.nombre}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Vence • {formatDate(p.fechaVencimiento, "dd MMMM")}
                  </p>
                </div>
                <p className="text-sm font-black text-emerald-500 shrink-0 ml-2">
                  {formatCurrency(p.monto - p.montoPagado)}
                </p>
              </div>
            ))}

            {payments.overdue.length === 0 &&
              payments.upcoming.length === 0 && (
                <p className="text-sm text-center text-slate-500 italic py-4">
                  No tienes pagos pendientes.
                </p>
              )}
          </div>
        </div>

        <Button className="h-10 w-full shrink-0 rounded-xl font-semibold">
          <IconCreditCard className="size-4" />
          Pagar ahora
        </Button>
      </CardContent>
    </Card>
  );
}
