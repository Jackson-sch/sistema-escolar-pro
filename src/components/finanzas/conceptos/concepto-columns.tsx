import { ColumnDef } from "@tanstack/react-table";
import {
  IconReceipt,
  IconTrash,
  IconEdit,
  IconClock,
  IconSchool,
  IconCertificate,
  IconShirt,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export type ConceptoTableType = {
  id: string;
  nombre: string;
  montoSugerido: number;
  moraDiaria: number;
  moneda: string;
  activo: boolean;
  institucionId?: string;
};

const getCategoryMeta = (nombre: string) => {
  if (/pensi[oó]n/i.test(nombre)) {
    return {
      icon: IconSchool,
      color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    };
  }
  if (/matr[ií]cula/i.test(nombre)) {
    return {
      icon: IconReceipt,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    };
  }
  if (/constancia|certificado|carnet/i.test(nombre)) {
    return {
      icon: IconCertificate,
      color: "text-violet-600 bg-violet-500/10 border-violet-500/20",
    };
  }
  if (/uniforme|taller/i.test(nombre)) {
    return {
      icon: IconShirt,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    };
  }
  return {
    icon: IconReceipt,
    color: "text-muted-foreground bg-muted border-border/40",
  };
};

export const getConceptoColumns = (meta: {
  onEdit: (concepto: ConceptoTableType) => void;
  onDelete: (concepto: ConceptoTableType) => void;
  onToggleActivo: (concepto: ConceptoTableType, activo: boolean) => void;
}): ColumnDef<ConceptoTableType>[] => [
  {
    accessorKey: "nombre",
    header: "Concepto de Pago",
    cell: ({ row }) => {
      const cat = getCategoryMeta(row.original.nombre);
      const CatIcon = cat.icon;

      return (
        <div className="flex items-center gap-3">
          <div
            className={`size-9 rounded-xl flex items-center justify-center border shadow-2xs ${cat.color}`}
          >
            <CatIcon className="size-4.5" />
          </div>
          <div>
            <span className="font-bold text-xs text-foreground block">
              {row.original.nombre}
            </span>
            {!row.original.activo && (
              <span className="text-[10px] text-muted-foreground italic">
                (Desactivado)
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "montoSugerido",
    header: "Monto Sugerido",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-xs text-primary tabular-nums">
        {formatCurrency(row.original.montoSugerido)}
      </span>
    ),
  },
  {
    accessorKey: "moraDiaria",
    header: "Mora por Día",
    cell: ({ row }) => {
      const mora = Number(row.original.moraDiaria || 0);
      return mora > 0 ? (
        <Badge
          variant="outline"
          className="text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1"
        >
          <IconClock size={11} />
          <span>S/ {mora.toFixed(2)} / día</span>
        </Badge>
      ) : (
        <span className="text-[11px] text-muted-foreground">Sin mora</span>
      );
    },
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Switch
          checked={row.original.activo}
          onCheckedChange={(checked) =>
            meta.onToggleActivo(row.original, checked)
          }
          className="scale-90 cursor-pointer"
        />
        <Badge
          variant="outline"
          className={
            row.original.activo
              ? "text-[10px] font-black bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "text-[10px] font-black bg-muted text-muted-foreground border-border/40"
          }
        >
          {row.original.activo ? "Activo" : "Inactivo"}
        </Badge>
      </div>
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
          aria-label={`Editar concepto ${row.original.nombre}`}
          className="size-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 cursor-pointer"
          onClick={() => meta.onEdit(row.original)}
        >
          <IconEdit className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Eliminar concepto ${row.original.nombre}`}
          className="size-8 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
          onClick={() => meta.onDelete(row.original)}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    ),
  },
];
