"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  IconCalendarEvent,
  IconEdit,
  IconTrash,
  IconCalendarDue,
  IconCheck,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPeriodoButton } from "@/components/evaluaciones/management/add-periodo-button";
import { EditPeriodoDialog } from "./edit-periodo-dialog";
import { PeriodoDeleteDialog } from "./periodo-delete-dialog";
import { deletePeriodoAction } from "@/actions/evaluations/periodos";

interface PeriodoItem {
  id: string;
  nombre: string;
  tipo: string;
  numero: number;
  fechaInicio: string | Date;
  fechaFin: string | Date;
  anioEscolar: number;
  activo: boolean;
  institucionId?: string;
  _count?: { evaluaciones: number };
}

interface PeriodosManagerProps {
  periodos: PeriodoItem[];
  institucionId?: string;
}

const ROMAN_NUMERALS: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
};

export function PeriodosManager({ periodos, institucionId }: PeriodosManagerProps) {
  const [editingPeriodo, setEditingPeriodo] = React.useState<PeriodoItem | null>(null);
  const [deletingPeriodo, setDeletingPeriodo] = React.useState<PeriodoItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteConfirm = async () => {
    if (!deletingPeriodo) return;
    setIsDeleting(true);
    try {
      const res = await deletePeriodoAction({ id: deletingPeriodo.id });
      if (res.success) {
        toast.success(res.success);
        setDeletingPeriodo(null);
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al intentar eliminar el periodo");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              Gestión de Periodos Académicos
            </h3>
            <Badge variant="outline" className="text-xs font-bold">
              {periodos.length} {periodos.length === 1 ? "periodo" : "periodos"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configura los bimestres, trimestres y sus fechas límite de evaluación.
          </p>
        </div>

        <AddPeriodoButton
          institucionId={institucionId}
          existingCount={periodos.length}
        />
      </div>

      {/* Grid de Periodos */}
      {periodos.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-3xl space-y-3 bg-muted/10">
          <IconCalendarDue className="size-10 mx-auto text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            No se han registrado periodos académicos para este ciclo escolar.
          </p>
          <AddPeriodoButton
            institucionId={institucionId}
            existingCount={0}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {periodos.map((p) => {
            const r = ROMAN_NUMERALS[p.numero] || `${p.numero}`;
            const evalCount = p._count?.evaluaciones || 0;
            const fInicio = format(new Date(p.fechaInicio), "d 'de' MMMM", { locale: es });
            const fFin = format(new Date(p.fechaFin), "d 'de' MMMM", { locale: es });

            return (
              <div
                key={p.id}
                className="group relative border rounded-3xl p-5 bg-card/80 hover:bg-card hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center size-8 rounded-xl bg-primary/10 text-primary text-xs font-extrabold border border-primary/20">
                        {r}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                        {p.tipo}
                      </Badge>
                    </div>

                    <Badge
                      variant={p.activo ? "default" : "secondary"}
                      className="text-[10px] font-bold gap-1"
                    >
                      {p.activo ? (
                        <>
                          <IconCheck className="size-3" />
                          <span>Activo</span>
                        </>
                      ) : (
                        "Cerrado"
                      )}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm tracking-tight text-foreground/90">
                      {p.nombre}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5 font-medium">
                      <IconCalendarEvent className="size-3.5 text-muted-foreground/70 shrink-0" />
                      <span>
                        {fInicio} al {fFin}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    {evalCount > 0 ? (
                      <span className="text-primary font-bold">
                        {evalCount} {evalCount === 1 ? "evaluación" : "evaluaciones"}
                      </span>
                    ) : (
                      <span>Sin evaluaciones</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPeriodo(p)}
                      className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Editar periodo"
                    >
                      <IconEdit className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingPeriodo(p)}
                      className="size-7.5 rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      title="Eliminar periodo"
                    >
                      <IconTrash className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingPeriodo && (
        <EditPeriodoDialog
          open={!!editingPeriodo}
          onOpenChange={(open) => !open && setEditingPeriodo(null)}
          periodo={editingPeriodo}
        />
      )}

      <PeriodoDeleteDialog
        periodo={deletingPeriodo}
        onClose={() => setDeletingPeriodo(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
