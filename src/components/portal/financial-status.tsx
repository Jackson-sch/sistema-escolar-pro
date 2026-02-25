"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconCreditCard } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";
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
  const upcomingDate = payments.upcoming[0]?.fechaVencimiento
    ? new Date(payments.upcoming[0].fechaVencimiento).toLocaleDateString(
        "es-ES",
        { month: "short", day: "2-digit" },
      )
    : "Sin fecha";

  return (
    <Card className="bg-card border-white/5 overflow-hidden shadow-2xl h-full flex flex-col @container">
      <CardContent className="p-6 flex flex-col gap-5 h-full">
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
                Vencido
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
              <div className="flex items-center justify-between w-full mb-1">
                <p className="text-[10px] font-bold text-success uppercase tracking-widest">
                  Próximo Pago
                </p>
                <div className="text-right">
                  <p className="text-[8px] text-success/70 font-bold uppercase leading-none">
                    Vence
                  </p>
                  <p className="text-[10px] font-bold text-success capitalize leading-none">
                    {upcomingDate}
                  </p>
                </div>
              </div>
              <p className="text-xl @[12rem]:text-2xl font-black text-success whitespace-nowrap">
                {formatCurrency(upcomingAmount)}
              </p>
            </div>
          </div>
        </div>

        <Button className="w-full bg-primary hover:bg-primary/80 text-white font-black text-lg py-7 rounded-full">
          <IconCreditCard className="size-6" />
          PAGAR AHORA
        </Button>
      </CardContent>
    </Card>
  );
}
