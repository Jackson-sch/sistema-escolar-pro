import { ColumnDef } from "@tanstack/react-table";
import { IconReceipt, IconTrash, IconEdit } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ConceptoTableType = {
  id: string;
  nombre: string;
  montoSugerido: number;
  moraDiaria: number;
  moneda: string;
  activo: boolean;
  institucionId?: string;
};

export const getConceptoColumns = (meta: {
  onEdit: (concepto: ConceptoTableType) => void;
  onDelete: (concepto: ConceptoTableType) => void;
}): ColumnDef<ConceptoTableType>[] => [
  {
    accessorKey: "nombre",
    header: "Concepto de Pago",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <IconReceipt className="size-5 text-primary" />
        </div>
        <span className="font-semibold">{row.original.nombre}</span>
      </div>
    ),
  },
  {
    accessorKey: "montoSugerido",
    header: "Monto Sugerido",
    cell: ({ row }) => (
      <span className="font-semibold text-primary tabular-nums">
        {formatCurrency(row.original.montoSugerido)}
      </span>
    ),
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.activo ? "default" : "secondary"}>
        {row.original.activo ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex gap-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => meta.onEdit(row.original)}
        >
          <IconEdit className="size-4 text-blue-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => meta.onDelete(row.original)}
        >
          <IconTrash className="size-4 text-destructive" />
        </Button>
      </div>
    ),
  },
];
