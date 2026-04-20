"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconCreditCard } from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { ShineBorder } from "@/components/ui/shine-border";

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
    <Card className="overflow-hidden shadow-2xl h-full flex flex-col @container liquid-glass border-white/10 relative">
      <CardContent className="p-6 flex flex-col gap-6 h-full">
        <h3 className="font-bold text-sm uppercase tracking-wider">
          Estado Financiero
        </h3>

        <div className="grid grid-cols-1 @xs:grid-cols-2 gap-4">
          {/* Overdue Section */}
          <div className="relative bg-destructive/5 rounded-2xl p-4 flex flex-col justify-center min-w-0 overflow-hidden">
            <ShineBorder
              borderWidth={1}
              shineColor={["#ff000055", "#ff0000"]}
            />
            <div className="relative z-10 flex flex-col items-start w-full">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">
                Total Vencido
              </p>
              <p className="text-xl @[12rem]:text-2xl font-black text-red-500 whitespace-nowrap">
                {formatCurrency(overdueAmount)}
              </p>
            </div>
            <IconAlertTriangle className="absolute -right-2 -bottom-2 size-12 text-red-500/10 -rotate-12" />
          </div>

          {/* Upcoming Section */}
          <div className="relative bg-success/5 rounded-2xl p-4 flex flex-col justify-center min-w-0 overflow-hidden">
            <ShineBorder
              borderWidth={1}
              shineColor={["#064e3b55", "#064e3b"]}
            />
            <div className="relative z-10 flex flex-col items-start w-full">
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
                className="flex items-center justify-between p-3 rounded-xl bg-muted dark:bg-white/5 border border-white/5"
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

        <Button className="w-full bg-primary hover:bg-primary/80 text-white font-black text-lg py-7 rounded-full shrink-0">
          <IconCreditCard className="size-6" />
          PAGAR AHORA
        </Button>
      </CardContent>
    </Card>
  );
}
