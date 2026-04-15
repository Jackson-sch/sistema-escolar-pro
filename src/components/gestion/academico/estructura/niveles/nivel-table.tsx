"use client";

import { useState } from "react";
import { IconSchool, IconTrash, IconLayersSubtract } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteNivelAction } from "@/actions/academic-structure";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Card, CardContent } from "@/components/ui/card";

export type NivelTableType = {
  id: string;
  nombre: string;
  _count: { grados: number };
};

interface NivelTableProps {
  data: NivelTableType[];
  meta?: any;
}

export function NivelTable({ data }: NivelTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNivel, setSelectedNivel] = useState<NivelTableType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed bg-muted/10">
        <div className="size-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
          <IconSchool className="size-7 text-sky-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-bold text-foreground">No hay niveles registrados</h3>
        <p className="text-sm text-muted-foreground max-w-xs mt-1.5 leading-relaxed">
          Crea un nivel educativo (Ej. Inicial, Primaria) para estructurar la malla académica.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-6">
        {data.map((nivel) => (
          <Card
            key={nivel.id}
            className="group relative overflow-hidden hover:border-sky-500/30 transition-all duration-300"
          >
            {/* Top glow line on hover */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2.5 right-2.5 size-7 rounded-lg text-muted-foreground/40 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
              onClick={() => {
                setSelectedNivel(nivel);
                setShowDeleteModal(true);
              }}
              aria-label={`Eliminar nivel ${nivel.nombre}`}
            >
              <IconTrash className="size-3.5" strokeWidth={1.5} />
            </Button>

            <CardContent className="p-5 flex flex-col gap-4">
              {/* Icon */}
              <div className="size-12 rounded-xl bg-gradient-to-br from-sky-500/15 to-blue-600/10 border border-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                <IconSchool className="size-6 text-sky-400" strokeWidth={1.5} />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-2 min-w-0">
                <h3 className="font-bold text-sm text-foreground truncate leading-snug pr-6">
                  {nivel.nombre}
                </h3>
                <span className="inline-flex items-center gap-1.5 w-fit px-2 py-1 rounded-md bg-muted/60 border border-border/50 text-[11px] font-medium text-muted-foreground">
                  <IconLayersSubtract className="size-3 shrink-0" strokeWidth={2} />
                  {nivel._count.grados}{" "}
                  {nivel._count.grados === 1 ? "Grado" : "Grados"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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