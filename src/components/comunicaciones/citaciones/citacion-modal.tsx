"use client";

import { useState, useTransition } from "react";
import { IconMail, IconCalendar, IconClock, IconLoader2, IconSend } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/modals/form-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CitacionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  estudiante?: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  } | null;
}

export function CitacionModal({
  isOpen,
  onOpenChange,
  estudiante,
}: CitacionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [motivo, setMotivo] = useState("Asistencia / Inasistencias");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("09:00");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudiante) return;

    startTransition(async () => {
      // Simulación de envío de citación (vía notificación/email al apoderado)
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(
        `Citación enviada correctamente al apoderado de ${estudiante.name} ${estudiante.apellidoPaterno}.`
      );
      onOpenChange(false);
      setMensaje("");
      setFecha("");
    });
  };

  return (
    <FormModal
      title="Citación a Apoderado"
      description={`Enviar una citación o entrevista previa para la familia del estudiante ${estudiante ? `${estudiante.name} ${estudiante.apellidoPaterno}` : ""}.`}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="sm:max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Motivo de la Citación</Label>
          <Select value={motivo} onValueChange={setMotivo}>
            <SelectTrigger className="h-9 rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Asistencia / Inasistencias" className="text-xs">
                Asistencia / Inasistencias Recurrentes
              </SelectItem>
              <SelectItem value="Rendimiento Académico" className="text-xs">
                Rendimiento Académico / Calificaciones
              </SelectItem>
              <SelectItem value="Conducta y Convivencia" className="text-xs">
                Conducta y Convivencia Escolar
              </SelectItem>
              <SelectItem value="Entrevista Personal" className="text-xs">
                Entrevista Personal / Orientación
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Fecha Sugerida</Label>
            <div className="relative">
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Hora Sugerida</Label>
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              className="h-9 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Instrucciones o Mensaje Adicional</Label>
          <Textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe detalles adicionales para el apoderado (ej: aula de atención, temas a tratar)..."
            className="rounded-xl text-xs min-h-[90px] resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="rounded-xl text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isPending ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : (
              <IconSend className="size-3.5" />
            )}
            Enviar Citación
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
