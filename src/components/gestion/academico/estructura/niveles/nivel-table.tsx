"use client";

import { useQueryState, parseAsString } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import { IconSchool, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { deleteNivelAction } from "@/actions/academic-structure";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useState } from "react";

export type NivelTableType = {
  id: string;
  nombre: string;
  _count: { grados: number };
};

interface NivelTableProps {
  data: NivelTableType[];
  meta?: any;
}

export function NivelTable({ data, meta }: NivelTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNivel, setSelectedNivel] = useState<NivelTableType | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // URL State with nuqs
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );

  const columns: ColumnDef<NivelTableType>[] = [
    {
      accessorKey: "nombre",
      header: "Nivel Educativo",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <IconSchool className="size-5 text-sky-500" strokeWidth={1.5} />
          </div>
          <span className="font-semibold text-foreground">
            {row.original.nombre}
          </span>
        </div>
      ),
    },
    {
      id: "grados",
      header: "Grados",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {row.original._count.grados}
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {row.original._count.grados === 1 ? "Grado" : "Grados"}
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
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => {
              setSelectedNivel(row.original);
              setShowDeleteModal(true);
            }}
            aria-label={`Eliminar nivel ${row.original.nombre}`}
          >
            <IconTrash className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      ),
    },
  ];

  const onConfirm = async () => {
    if (!selectedNivel) return;
    setIsDeleting(true);
    try {
      const res = await deleteNivelAction(selectedNivel.id);
      if (res.success) {
        toast.success(res.success);
        setShowDeleteModal(false);
        setSelectedNivel(null);
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
        searchPlaceholder="Buscar nivel..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        meta={meta}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirm}
        loading={isDeleting}
        title="¿Eliminar Nivel Educativo?"
        description={`¿Estás seguro de eliminar el nivel "${selectedNivel?.nombre}"? Esta acción no se puede deshacer y podría afectar a los grados asociados.`}
      />
    </>
  );
}
