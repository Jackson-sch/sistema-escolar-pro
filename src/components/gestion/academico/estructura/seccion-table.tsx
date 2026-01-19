"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  IconTrash,
  IconMapPin,
  IconUsers,
  IconEdit,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { deleteSeccionAction } from "@/actions/academic-structure";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/modals/form-modal";
import { SeccionForm } from "./seccion-form";

export type SeccionTableType = {
  id: string;
  seccion: string;
  capacidad: number;
  aulaAsignada: string | null;
  anioAcademico: number;
  turno: string;
  gradoId: string;
  institucionId: string;
  nivel: { nombre: string };
  grado: { nombre: string; codigo: string };
  tutor: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  } | null;
  _count: { students: number; matriculas: number };
};

interface SeccionTableProps {
  data: SeccionTableType[];
  meta: {
    grados: any[];
    tutores: any[];
    institucionId: string;
  };
}

export function SeccionTable({ data, meta }: SeccionTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSeccion, setSelectedSeccion] =
    useState<SeccionTableType | null>(null);
  const [isDeleting, startTransition] = useTransition();

  const columns: ColumnDef<SeccionTableType>[] = [
    {
      id: "seccion",
      header: "Sección",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm border border-primary/20 shrink-0">
              {s.seccion}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {s.grado.nombre} "{s.seccion}"
              </span>
              <span className="text-xs text-muted-foreground">
                {s.nivel.nombre} • {s.anioAcademico}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "tutor",
      header: "Tutor",
      cell: ({ row }) => {
        const tutor = row.original.tutor;
        if (!tutor) {
          return (
            <span className="text-sm text-muted-foreground italic">
              Sin asignar
            </span>
          );
        }

        const initials = `${tutor.name[0]}${tutor.apellidoPaterno[0]}`;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-border/50">
              <AvatarFallback className="bg-muted text-foreground text-[10px] font-medium uppercase">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground capitalize">
              {tutor.name} {tutor.apellidoPaterno} {tutor.apellidoMaterno}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "turno",
      header: "Turno",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium bg-slate-50/50">
          {row.original.turno}
        </Badge>
      ),
    },
    {
      id: "capacidad",
      header: "Alumnos",
      cell: ({ row }) => {
        const current = row.original._count?.matriculas || 0;
        const max = row.original.capacidad || 1;
        const percentage = Math.min((current / max) * 100, 100);
        const isFull = current >= max;

        return (
          <div className="flex flex-col gap-1.5 w-28">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <IconUsers className="size-3.5" />
                <span>Alumnos</span>
              </div>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-md",
                  isFull
                    ? "bg-red-500/10 text-red-500"
                    : "bg-primary/10 text-primary"
                )}
              >
                {current} / {max}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-px border border-border/50">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-in-out",
                  isFull
                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                    : "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "aulaAsignada",
      header: "Aula",
      cell: ({ row }) => {
        const aula = row.original.aulaAsignada;
        return (
          <div className="flex items-center gap-1.5 text-sm">
            {aula ? (
              <>
                <IconMapPin className="size-3.5 text-muted-foreground" />
                <span className="font-medium text-xs">{aula}</span>
              </>
            ) : (
              <span className="text-muted-foreground italic text-xs">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
            onClick={() => {
              setSelectedSeccion(row.original);
              setShowEditDialog(true);
            }}
            aria-label="Editar sección"
          >
            <IconEdit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => {
              setSelectedSeccion(row.original);
              setShowDeleteModal(true);
            }}
            aria-label="Eliminar sección"
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const onConfirm = () => {
    if (!selectedSeccion) return;
    startTransition(async () => {
      const res = await deleteSeccionAction(selectedSeccion.id);
      if (res.success) {
        toast.success(res.success);
        setShowDeleteModal(false);
        setSelectedSeccion(null);
      }
      if (res.error) toast.error(res.error);
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="seccion"
        searchPlaceholder="Buscar sección..."
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirm}
        loading={isDeleting}
        title="¿Eliminar Sección?"
        description={`¿Estás seguro de eliminar la sección "${selectedSeccion?.grado.nombre} ${selectedSeccion?.seccion}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />

      <FormModal
        title="Editar Sección"
        description="Modifica los datos de la sección seleccionada."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="max-w-md"
      >
        <SeccionForm
          initialData={selectedSeccion}
          grados={meta.grados}
          tutores={meta.tutores}
          institucionId={meta.institucionId}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedSeccion(null);
          }}
        />
      </FormModal>
    </>
  );
}
