"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconBolt,
  IconReceipt2,
  IconArrowUpRight,
  IconChecklist,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formats";
import Link from "next/link";

interface FinancialCollectionGaugeProps {
  realtime: {
    todayRevenue: number;
    todayTransactions: number;
    monthRevenue: number;
    pendingVouchersCount: number;
  };
  totalOverdue: number;
  totalPending: number;
}

export function FinancialCollectionGauge({
  realtime,
  totalOverdue,
  totalPending,
}: FinancialCollectionGaugeProps) {
  const todayRevenue = realtime?.todayRevenue || 0;
  const todayTransactions = realtime?.todayTransactions || 0;
  const monthRevenue = realtime?.monthRevenue || 0;
  const pendingVouchers = realtime?.pendingVouchersCount || 0;

  const totalCycle = monthRevenue + totalPending;
  const progressPct =
    totalCycle > 0 ? Math.min(100, Math.round((monthRevenue / totalCycle) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Recaudación de Hoy (Caja POS) */}
      <Card className="rounded-2xl border-border/50 bg-card/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Recaudación de Hoy
          </span>
          <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <IconBolt className="size-4" />
          </div>
        </div>
        <div className="my-2">
          <h3 className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {formatCurrency(todayRevenue)}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {todayTransactions} pagos registrados en la jornada
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-semibold h-8 rounded-xl border-border/60 cursor-pointer justify-between"
          asChild
        >
          <Link href="/finanzas/caja">
            <span>Abrir Caja Rápida</span>
            <IconArrowUpRight size={13} />
          </Link>
        </Button>
      </Card>

      {/* 2. Termómetro de Recaudación del Mes */}
      <Card className="rounded-2xl border-border/50 bg-card/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Avance del Mes Corriente
          </span>
          <Badge
            variant="outline"
            className="font-mono text-[10px] font-bold border-border/60"
          >
            {progressPct}% Recaudado
          </Badge>
        </div>
        <div className="my-2 space-y-1.5">
          <h3 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(monthRevenue)}
          </h3>
          <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Deuda por cobrar: {formatCurrency(totalPending)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-semibold h-8 rounded-xl border-border/60 cursor-pointer justify-between"
          asChild
        >
          <Link href="/finanzas">
            <span>Ver Cronogramas</span>
            <IconArrowUpRight size={13} />
          </Link>
        </Button>
      </Card>

      {/* 3. Vouchers Pendientes por Validar */}
      <Card className="rounded-2xl border-border/50 bg-card/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Auditoría de Comprobantes
          </span>
          <div className="size-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
            <IconChecklist className="size-4" />
          </div>
        </div>
        <div className="my-2">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold font-mono text-violet-600 dark:text-violet-400">
              {pendingVouchers}
            </h3>
            <span className="text-xs text-muted-foreground">vouchers en espera</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pendingVouchers > 0
              ? "Requieren validación contable para emitir recibo"
              : "Bandeja al día, sin vouchers por conciliar"}
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="w-full text-xs font-semibold h-8 rounded-xl cursor-pointer justify-between"
          asChild
        >
          <Link href="/finanzas/verificacion">
            <span>Revisar Vouchers</span>
            <IconArrowUpRight size={13} />
          </Link>
        </Button>
      </Card>
    </div>
  );
}
