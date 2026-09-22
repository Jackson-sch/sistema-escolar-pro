"use client";

import { FinancialCollectionGauge } from "./financial-collection-gauge";
import { FinancialHealthCard } from "@/components/dashboard/financial-health-card";
import { ChartAreaInteractive } from "@/components/common/chart-area-interactive";
import { RecentPaymentsTable } from "./recent-payments-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconBolt,
  IconReceipt,
  IconChecklist,
  IconShirt,
  IconArrowRight,
  IconCreditCard,
} from "@tabler/icons-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/formats";

interface DashboardFinancialTabProps {
  stats: any;
}

export function DashboardFinancialTab({ stats }: DashboardFinancialTabProps) {
  const realtime = stats?.financialRealtime || {
    todayRevenue: 0,
    todayTransactions: 0,
    monthRevenue: 0,
    pendingVouchersCount: 0,
  };
  const totalRevenue = stats?.totalRevenue || 0;
  const totalOverdue = stats?.totalOverdue || 0;
  const totalPending = stats?.totalPending || 0;
  const recentPayments = stats?.recentPayments || [];

  return (
    <div className="space-y-6">
      {/* 1. Indicadores en vivo (Caja de Hoy, Mes, Auditoría) */}
      <FinancialCollectionGauge
        realtime={realtime}
        totalOverdue={totalOverdue}
        totalPending={totalPending}
      />

      {/* 2. Gráfico y Monitores de Salud Financiera Balanceados */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Columna Izquierda: Gráfico de Ingresos + Tabla de Últimos Ingresos */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <ChartAreaInteractive data={stats?.chartData} />
          <RecentPaymentsTable payments={recentPayments} />
        </div>

        {/* Columna Derecha: Salud Financiera + Operaciones */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <FinancialHealthCard
            collected={totalRevenue}
            overdue={totalOverdue}
            pending={totalPending}
          />

          <Card className="rounded-2xl border-border/50 bg-card/80 p-5 shadow-2xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Operaciones de Tesorería</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Acceso a los centros de cobro y conciliación
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between rounded-xl h-10 border-border/60 text-xs font-semibold hover:bg-muted/60"
                asChild
              >
                <Link href="/finanzas/caja">
                  <span className="flex items-center gap-2">
                    <IconBolt size={16} className="text-amber-500" /> Caja Rápida / Cobro POS
                  </span>
                  <IconArrowRight size={14} className="text-muted-foreground" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between rounded-xl h-10 border-border/60 text-xs font-semibold hover:bg-muted/60"
                asChild
              >
                <Link href="/finanzas/verificacion">
                  <span className="flex items-center gap-2">
                    <IconChecklist size={16} className="text-violet-500" /> Validar Vouchers ({realtime.pendingVouchersCount})
                  </span>
                  <IconArrowRight size={14} className="text-muted-foreground" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between rounded-xl h-10 border-border/60 text-xs font-semibold hover:bg-muted/60"
                asChild
              >
                <Link href="/finanzas">
                  <span className="flex items-center gap-2">
                    <IconReceipt size={16} className="text-emerald-500" /> Cronogramas & Deudas
                  </span>
                  <IconArrowRight size={14} className="text-muted-foreground" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between rounded-xl h-10 border-border/60 text-xs font-semibold hover:bg-muted/60"
                asChild
              >
                <Link href="/uniformes">
                  <span className="flex items-center gap-2">
                    <IconShirt size={16} className="text-pink-500" /> Tienda & Ventas de Uniformes
                  </span>
                  <IconArrowRight size={14} className="text-muted-foreground" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
