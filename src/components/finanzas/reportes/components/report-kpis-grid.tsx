"use client";

import { Calendar, Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formats";
import { ReportStatCard } from "./report-stat-card";

interface ReportKpisGridProps {
  totalProyectado: number;
  totalReal: number;
  totalDeuda: number;
  totalMora: number;
  cumplimiento: number;
  deudaPorcentaje: number;
}

export function ReportKpisGrid({
  totalProyectado,
  totalReal,
  totalDeuda,
  totalMora,
  cumplimiento,
  deudaPorcentaje,
}: ReportKpisGridProps) {
  const isHighEfficiency = cumplimiento >= 75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <ReportStatCard
        title="Monto Facturado"
        value={formatCurrency(totalProyectado)}
        icon={Calendar}
        description="Total proyectado en el año escolar"
        color="primary"
        delay={0}
      />

      <ReportStatCard
        title="Monto Recaudado"
        value={formatCurrency(totalReal)}
        icon={Wallet}
        description="Ingresos efectivos en caja y bancos"
        color="emerald"
        trend={{ value: cumplimiento, isUp: isHighEfficiency }}
        progress={cumplimiento}
        delay={75}
      />

      <ReportStatCard
        title="Saldo Pendiente"
        value={formatCurrency(totalDeuda)}
        icon={AlertTriangle}
        description="Deuda total acumulada por cobrar"
        subValue={totalMora > 0 ? `Incluye mora: ${formatCurrency(totalMora)}` : undefined}
        color="red"
        progress={deudaPorcentaje}
        delay={150}
      />

      <ReportStatCard
        title="Efectividad de Cobro"
        value={`${cumplimiento.toFixed(1)}%`}
        icon={TrendingUp}
        description={
          isHighEfficiency
            ? "Alto rendimiento de cobranzas"
            : "Gestión de cobranza requerida"
        }
        color={isHighEfficiency ? "emerald" : "amber"}
        progress={cumplimiento}
        delay={225}
      />
    </div>
  );
}
