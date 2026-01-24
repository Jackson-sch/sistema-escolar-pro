"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ProspectoRowActions } from "@/components/gestion/admisiones/components/prospecto-row-actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] border-border/50"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] border-border/50"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "prospecto",
    header: "Interesado",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold text-foreground capitalize">
            {p.apellidoPaterno} {p.apellidoMaterno}, {p.nombre}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            DNI: {p.dni || "No registrado"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "contacto",
    header: "Contacto",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-medium text-foreground italic flex items-center gap-1">
            {p.email || "Sin correo"}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            Telf: {p.telefono || "---"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "anioPostulacion",
    header: "Año",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-[12px] font-bold">
          {row.getValue("anioPostulacion")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      const variants: any = {
        INTERESADO: "secondary",
        EVALUANDO: "warning",
        ADMITIDO: "success",
        RECHAZADO: "destructive",
        MATRICULADO: "default",
      };

      const colors: any = {
        INTERESADO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        EVALUANDO: "bg-warning/10 text-warning border-warning/20",
        ADMITIDO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        RECHAZADO: "bg-red-500/10 text-red-500 border-red-500/20",
        MATRICULADO: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      };

      return (
        <Badge
          className={`text-[10px] font-bold uppercase tracking-widest border ${colors[estado] || ""}`}
          variant="outline"
        >
          {estado}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: "Registro",
    cell: ({ row }) => (
      <span className="text-[11px] text-muted-foreground font-medium">
        {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy", {
          locale: es,
        })}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => <ProspectoRowActions row={row} table={table} />,
  },
];
