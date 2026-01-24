"use client";

import * as React from "react";
import { useQueryState, parseAsString } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import { IconGrain, IconTrash, IconFilterOff } from "@tabler/icons-react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteGradoAction } from "@/actions/academic-structure";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type GradoTableType = {
  id: string;
  nombre: string;
  codigo: string;
  orden: number;
  nivel: { nombre: string };
  _count: { nivelesAcademicos: number };
};

interface GradoTableProps {
  data: GradoTableType[];
  meta?: {
    niveles: { id: string; nombre: string }[];
  };
}

export function GradoTable({ data, meta }: GradoTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGrado, setSelectedGrado] = useState<GradoTableType | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // URL State with nuqs
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [nivelFilter, setNivelFilter] = useQueryState(
    "nivel",
    parseAsString.withDefault("ALL"),
  );

  const hasActiveFilters = searchQuery !== "" || nivelFilter !== "ALL";

  const onClearFilters = () => {
    setSearchQuery("");
    setNivelFilter("ALL");
  };

  const columns: ColumnDef<GradoTableType>[] = [
    {
      accessorKey: "nombre",
      header: "Grado",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <IconGrain className="size-5 text-green-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {row.original.nombre}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {row.original.codigo}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "nivel.nombre",
      header: "Nivel",
      id: "nivel",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal uppercase">
          {row.original.nivel.nombre}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value === "ALL" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "orden",
      header: "Orden",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-medium">
          #{row.original.orden}
        </span>
      ),
    },
    {
      id: "secciones",
      header: "Secciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {row.original._count.nivelesAcademicos}
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {row.original._count.nivelesAcademicos === 1
              ? "Sección"
              : "Secciones"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              setSelectedGrado(row.original);
              setShowDeleteModal(true);
            }}
            aria-label={`Eliminar grado ${row.original.nombre}`}
          >
            <IconTrash className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      ),
    },
  ];

  const onConfirm = async () => {
    if (!selectedGrado) return;
    setIsDeleting(true);
    try {
      const res = await deleteGradoAction(selectedGrado.id);
      if (res.success) {
        toast.success(res.success);
        setShowDeleteModal(false);
        setSelectedGrado(null);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="nombre"
        searchPlaceholder="Buscar grado..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        meta={meta}
      >
        {(table) => {
          // Sync URL level filter with table column filter
          useEffect(() => {
            table
              .getColumn("nivel")
              ?.setFilterValue(nivelFilter === "ALL" ? "" : nivelFilter);
          }, [nivelFilter, table]);

          return (
            <div className="flex items-center gap-2">
              <Select value={nivelFilter} onValueChange={setNivelFilter}>
                <SelectTrigger className="w-[140px] h-9 bg-muted/5 border-border/40 text-[11px] font-medium transition-all focus:ring-primary/20 rounded-full">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
                  <SelectItem value="ALL" className="text-[11px] font-medium">
                    Todos los niveles
                  </SelectItem>
                  {meta?.niveles?.map((n) => (
                    <SelectItem
                      key={n.id}
                      value={n.nombre}
                      className="text-[11px] font-medium uppercase"
                    >
                      {n.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }}
      </DataTable>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirm}
        loading={isDeleting}
        title="¿Eliminar Grado?"
        description={`¿Estás seguro de eliminar el grado "${selectedGrado?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}
