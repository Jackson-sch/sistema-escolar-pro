"use client";

import { ConciliacionDialog } from "@/components/finanzas/conciliacion-dialog";
import { BulkActionsButton } from "@/components/finanzas/cronogramas/bulk-actions-button";
import { AddPensionButton } from "@/components/finanzas/cronogramas/add-pension-button";
import { Button } from "@/components/ui/button";
import { IconTable, IconLoader2 } from "@tabler/icons-react";

interface CronogramaHeaderToolbarProps {
  conceptos: any[];
  niveles: any[];
  onExportExcel: () => void;
  isExporting: boolean;
}

export function CronogramaHeaderToolbar({
  conceptos,
  niveles,
  onExportExcel,
  isExporting,
}: CronogramaHeaderToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3.5 px-1">
      <div>
        <h3 className="text-base font-extrabold text-foreground tracking-tight">
          Cronograma de Pagos y Cobranzas
        </h3>
        <p className="text-xs text-muted-foreground font-normal">
          Control detallado de cuotas escolares, vencimientos y estados de pago.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
        <ConciliacionDialog />

        <BulkActionsButton conceptos={conceptos} niveles={niveles} />

        <AddPensionButton conceptos={conceptos} niveles={niveles} />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isExporting}
          onClick={onExportExcel}
          className="h-9 gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold rounded-xl cursor-pointer shadow-2xs shrink-0 transition-transform hover:scale-105"
        >
          {isExporting ? (
            <IconLoader2 className="size-3.5 animate-spin" />
          ) : (
            <IconTable className="size-3.5 text-emerald-600" />
          )}
          <span>{isExporting ? "Exportando..." : "Exportar Excel"}</span>
        </Button>
      </div>
    </div>
  );
}
