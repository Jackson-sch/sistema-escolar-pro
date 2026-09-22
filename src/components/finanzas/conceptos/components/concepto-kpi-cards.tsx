"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import {
  IconReceipt,
  IconCheck,
  IconClock,
  IconCoins,
} from "@tabler/icons-react";
import { ConceptoTableType } from "../concepto-columns";

interface ConceptoKpiCardsProps {
  conceptos: ConceptoTableType[];
}

export function ConceptoKpiCards({ conceptos }: ConceptoKpiCardsProps) {
  const total = conceptos.length;
  const activos = conceptos.filter((c) => c.activo).length;
  const conMora = conceptos.filter((c) => (c.moraDiaria || 0) > 0).length;

  const pensiones = conceptos.filter((c) =>
    /pensi[oó]n/i.test(c.nombre),
  );
  const promedioPension =
    pensiones.length > 0
      ? pensiones.reduce((acc, c) => acc + Number(c.montoSugerido || 0), 0) /
        pensiones.length
      : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Conceptos */}
      <Card className="bg-card border border-border/60 rounded-2xl shadow-xs p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Conceptos
          </span>
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <IconReceipt size={16} />
          </div>
        </div>
        <div>
          <h4 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground">
            {total}
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium">
            {activos} activos · {total - activos} inactivos
          </p>
        </div>
      </Card>

      {/* 2. Activos */}
      <Card className="bg-card border border-border/60 rounded-2xl shadow-xs p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            En Circulación
          </span>
          <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <IconCheck size={16} />
          </div>
        </div>
        <div>
          <h4 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            {activos}
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium">
            Disponibles para cobro
          </p>
        </div>
      </Card>

      {/* 3. Pensión Promedio */}
      <Card className="bg-card border border-border/60 rounded-2xl shadow-xs p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Pensión Promedio
          </span>
          <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <IconCoins size={16} />
          </div>
        </div>
        <div>
          <h4 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground">
            {formatCurrency(promedioPension)}
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium">
            {pensiones.length > 0
              ? `${pensiones.length} conceptos de pensión`
              : "Sin pensiones registradas"}
          </p>
        </div>
      </Card>

      {/* 4. Con Mora */}
      <Card className="bg-card border border-border/60 rounded-2xl shadow-xs p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Políticas de Mora
          </span>
          <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <IconClock size={16} />
          </div>
        </div>
        <div>
          <h4 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
            {conMora}
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium">
            Aplican recargo por día
          </p>
        </div>
      </Card>
    </div>
  );
}
