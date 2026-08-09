"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { getBoletaColumns, BoletaColumnType } from "./boletas-columns";
import { IconHistory } from "@tabler/icons-react";

interface BoletasTableProps {
  data: BoletaColumnType[];
}

export function BoletasTable({ data }: BoletasTableProps) {
  const columns = React.useMemo(() => getBoletaColumns(), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <IconHistory className="size-5 text-primary" />
          Documentos Recientes
        </h3>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="concepto"
        searchPlaceholder="Buscar por concepto (ej. Pensión, Matrícula)..."
        emptyStateTitle="No hay boletas de pago disponibles"
        emptyStateDescription="Las boletas se mostrarán aquí cuando se registren y validen tus pagos."
        showColumnVisibility={false}
      />
    </div>
  );
}
