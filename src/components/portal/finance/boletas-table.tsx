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
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
          <IconHistory className="size-5 text-primary" />
          Documentos Recientes
        </h3>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="concepto"
        searchPlaceholder="Buscar por concepto (ej. Pensión, Matrícula)..."
        emptyStateTitle="No hay boletas disponibles"
        emptyStateDescription="Tus comprobantes aparecerán aquí conforme se procesen los pagos realizados."
        showColumnVisibility={false}
      />
    </div>
  );
}
