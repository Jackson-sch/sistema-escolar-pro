"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";
import {
  IconCreditCard,
  IconAlertCircle,
  IconClock,
} from "@tabler/icons-react";

interface FinancialHealthCardProps {
  collected: number;
  overdue: number;
  pending: number;
}

export function FinancialHealthCard({
  collected,
  overdue,
  pending,
}: FinancialHealthCardProps) {
  const total = collected + overdue + pending;
  const collectedPerc = total > 0 ? (collected / total) * 100 : 0;
  const overduePerc = total > 0 ? (overdue / total) * 100 : 0;
  const pendingPerc = total > 0 ? (pending / total) * 100 : 0;

  return (
    <Card className="h-full overflow-hidden rounded-2xl border-border/50 bg-card/80 shadow-sm">
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <IconCreditCard size={18} />
          </div>
          Salud Financiera
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Progress Bar Multi-Segment */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Estado de Cartera</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-1000 ease-out"
              style={{ width: `${collectedPerc}%` }}
              title={`Recaudado: ${collectedPerc.toFixed(1)}%`}
            />
            <div
              className="h-full bg-amber-500 transition-[width] duration-1000 ease-out"
              style={{ width: `${pendingPerc}%` }}
              title={`Por Vencer: ${pendingPerc.toFixed(1)}%`}
            />
            <div
              className="h-full bg-red-500 transition-[width] duration-1000 ease-out"
              style={{ width: `${overduePerc}%` }}
              title={`Vencido: ${overduePerc.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Legend / Details */}
        <div className="grid grid-cols-1 gap-3">
          <FinanceItem
            icon={IconCreditCard}
            label="Recaudado"
            amount={collected}
            color="emerald"
            percentage={collectedPerc}
          />
          <FinanceItem
            icon={IconClock}
            label="Por Vencer"
            amount={pending}
            color="amber"
            percentage={pendingPerc}
          />
          <FinanceItem
            icon={IconAlertCircle}
            label="Morosidad (Vencido)"
            amount={overdue}
            color="red"
            percentage={overduePerc}
          />
        </div>

        <div className="pt-2 text-[10px] text-center text-muted-foreground italic">
          * Datos calculados en base al ciclo escolar actual
        </div>
      </CardContent>

    </Card>
  );
}

function FinanceItem({
  icon: Icon,
  label,
  amount,
  color,
  percentage,
}: {
  icon: any;
  label: string;
  amount: number;
  color: "emerald" | "amber" | "red";
  percentage: number;
}) {
  const colors = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-3 transition-colors hover:bg-muted/40">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-9 rounded-xl flex items-center justify-center border",
            colors[color],
          )}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">
            {label}
          </p>
          <p className="text-sm font-black">{formatCurrency(amount)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-black">{percentage.toFixed(1)}%</p>
        <div
          className={cn("h-1 w-12 rounded-full bg-muted mt-1 overflow-hidden")}
        >
          <div
            className={cn(
              "h-full",
              color === "emerald"
                ? "bg-emerald-500"
                : color === "amber"
                  ? "bg-amber-500"
                  : "bg-red-500",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
