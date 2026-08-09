"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconUsers,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/modals/form-modal";
import { useState } from "react";
import { deleteEventoAction } from "@/actions/communications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface ViewEventDialogProps {
  evento: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEventDialog({
  evento,
  open,
  onOpenChange,
}: ViewEventDialogProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!evento) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteEventoAction({ id: evento.id });
      if (res.success) {
        toast.success(res.success);
        setShowConfirmDelete(false);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormModal
        isOpen={open}
        onOpenChange={onOpenChange}
        title={evento.titulo}
        description={evento.tipo}
        className="sm:max-w-[520px]"
        headerClassName={cn(
          "text-white border-none pb-6 pt-8 relative overflow-hidden",
          evento.tipo === "ACADEMICO" ? "bg-indigo-600" : "bg-emerald-600",
        )}
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
          <IconCalendar className="size-20 rotate-12" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/50 border border-border/40">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center shrink-0",
                  evento.tipo === "ACADEMICO"
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                )}
              >
                <IconCalendar className="size-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Fecha de Actividad
                </span>
                <span className="text-xs font-bold capitalize truncate">
                  {format(new Date(evento.fechaInicio), "eeee, dd 'de' MMMM", {
                    locale: es,
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/50 border border-border/40">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center shrink-0",
                  evento.tipo === "ACADEMICO"
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                )}
              >
                <IconClock className="size-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Rango Horario
                </span>
                <span className="text-xs font-bold font-mono">
                  {evento.horaInicio} — {evento.horaFin}
                </span>
              </div>
            </div>

            {evento.ubicacion && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/50 border border-border/40">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0",
                    evento.tipo === "ACADEMICO"
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  <IconMapPin className="size-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                    Lugar / Plataforma
                  </span>
                  <span className="text-xs font-bold truncate">
                    {evento.ubicacion}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              <IconInfoCircle className="size-3.5 text-indigo-500" /> Detalles de la Actividad
            </div>
            <div className="p-3.5 rounded-xl bg-background/40 border border-border/30 text-xs leading-relaxed text-foreground whitespace-pre-wrap font-medium">
              {evento.descripcion || "No se ha proporcionado una descripción detallada para este evento."}
            </div>
          </div>

          <div className="pt-3 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg flex items-center justify-center bg-muted/30 border border-border/30 text-muted-foreground">
                <IconUsers className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Visibilidad
                </span>
                <span className="text-[11px] font-semibold">
                  {evento.publico ? "Evento Público" : "Solo Invitados"}
                </span>
              </div>
            </div>

            {/* Botón Eliminar Evento */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              className="rounded-xl px-3 h-8 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <IconTrash className="size-3.5" />
              <span>Eliminar Evento</span>
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Modal de Confirmación Estilo Sistema (Con ShineBorder) */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="¿Eliminar evento del calendario?"
        description={`Esta acción eliminará de forma permanente la actividad "${evento.titulo}".`}
        loading={loading}
        variant="danger"
      />
    </>
  );
}
