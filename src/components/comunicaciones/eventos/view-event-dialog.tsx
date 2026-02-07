import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconUsers,
  IconInfoCircle,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/modals/form-modal";

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
  if (!evento) return null;

  return (
    <FormModal
      isOpen={open}
      onOpenChange={onOpenChange}
      title={evento.titulo}
      description={evento.tipo}
      className="sm:max-w-[500px]"
      headerClassName={cn(
        "text-white border-none pb-8 pt-10 relative overflow-hidden",
        evento.tipo === "ACADEMICO" ? "bg-academic" : "bg-institutional",
      )}
    >
      {/* Decorative Icon in the background of FormModal's header */}
      <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
        <IconCalendar className="size-24 rotate-12" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/20 group transition-all hover:bg-muted/40">
            <div
              className={cn(
                "size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                evento.tipo === "ACADEMICO"
                  ? "bg-academic/10 text-academic"
                  : "bg-institutional/10 text-institutional",
              )}
            >
              <IconCalendar className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">
                Fecha de Actividad
              </span>
              <span className="text-base font-bold uppercase font-display">
                {format(new Date(evento.fechaInicio), "eeee, dd 'de' MMMM", {
                  locale: es,
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/20 group transition-all hover:bg-muted/40">
            <div
              className={cn(
                "size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                evento.tipo === "ACADEMICO"
                  ? "bg-academic/10 text-academic"
                  : "bg-institutional/10 text-institutional",
              )}
            >
              <IconClock className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">
                Rango Horario
              </span>
              <span className="text-base font-bold uppercase font-display">
                {evento.horaInicio} — {evento.horaFin}
              </span>
            </div>
          </div>

          {evento.ubicacion && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/20 group transition-all hover:bg-muted/40">
              <div
                className={cn(
                  "size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  evento.tipo === "ACADEMICO"
                    ? "bg-academic/10 text-academic"
                    : "bg-institutional/10 text-institutional",
                )}
              >
                <IconMapPin className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">
                  Lugar / Plataforma
                </span>
                <span className="text-base font-bold uppercase font-display">
                  {evento.ubicacion}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
            <IconInfoCircle className="size-4 text-primary" /> Detalles
            adicionales
          </div>
          <div className="p-5 rounded-2xl bg-muted/10 border border-border/10 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap font-medium shadow-inner">
            {evento.descripcion ||
              "No se ha proporcionado una descripción para este evento."}
          </div>
        </div>

        <div className="pt-6 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-8 rounded-full flex items-center justify-center bg-muted/40 border border-border/40",
                evento.publico ? "text-success" : "text-warning",
              )}
            >
              <IconUsers className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
                Privacidad
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                {evento.publico ? "Evento Público" : "Solo Invitados"}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "font-black text-[10px] tracking-[0.15em] px-5 py-2 rounded-xl shadow-sm",
              evento.tipo === "ACADEMICO"
                ? "border-academic/30 text-academic bg-academic/5"
                : "border-institutional/30 text-institutional bg-institutional/5",
            )}
          >
            {evento.modalidad}
          </Badge>
        </div>
      </div>
    </FormModal>
  );
}
