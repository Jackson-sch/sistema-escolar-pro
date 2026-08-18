"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { IconUser, IconMail, IconAlertTriangle } from "@tabler/icons-react";
import { SegmentedControl } from "@/components/asistencia/segmented-control";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CitacionModal } from "@/components/comunicaciones/citaciones/citacion-modal";

interface AsistenciaTableProps {
  data: any[];
  onEstadoChange: (id: string, estado: string) => void;
  onJustificacionChange: (id: string, justificacion: string) => void;
}

export function AsistenciaTable({
  data,
  onEstadoChange,
  onJustificacionChange,
}: AsistenciaTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showCitacionModal, setShowCitacionModal] = useState(false);

  const handleOpenCitacion = (alumno: any) => {
    setSelectedStudent(alumno);
    setShowCitacionModal(true);
  };

  return (
    <>
      <div className="w-full flex flex-col gap-3 p-4">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 mb-2">
          <div className="col-span-1 text-xs font-bold text-muted-foreground">
            ID
          </div>
          <div className="col-span-4 text-xs font-bold text-muted-foreground">
            Estudiante
          </div>
          <div className="col-span-3 text-xs font-bold text-muted-foreground text-center">
            Estado de Asistencia
          </div>
          <div className="col-span-4 text-xs font-bold text-muted-foreground">
            Observaciones & Acciones
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/5 opacity-40">
            <IconUser className="size-12 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              Sin registros disponibles
            </p>
          </div>
        ) : (
          data.map((alumno, index) => (
            <div
              key={alumno.id}
              className="flex flex-col md:grid md:grid-cols-12 gap-3.5 md:gap-3 items-stretch md:items-center bg-card/80 hover:bg-card/95 border border-border/40 p-4 md:p-2.5 rounded-2xl transition-[background-color,box-shadow] group shadow-sm hover:shadow-md"
            >
              {/* ID & Mobile Header */}
              <div className="flex items-center justify-between md:col-span-1">
                <span className="text-[10px] font-bold text-muted-foreground/40 transition-colors">
                  #{String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Estudiante */}
              <div className="md:col-span-4 flex items-center gap-3 w-full">
                <Avatar className="h-10 w-10 md:h-9 md:w-9 border border-primary/20 shadow-sm shrink-0">
                  <AvatarImage src={alumno.image || ""} alt={alumno.name} />
                  <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary text-[10px] font-black uppercase">
                    {alumno.name?.[0]}
                    {alumno.apellidoPaterno?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 capitalize">
                  <span className="text-sm font-bold text-foreground/80 truncate leading-tight tracking-tight">
                    {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground tracking-tight flex items-center gap-1.5">
                    {alumno.name}
                    {(alumno.estado === "ausente" || alumno.estado === "falta") && (
                      <span className="inline-flex items-center text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.2 rounded-md">
                        Ausente
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Estado */}
              <div className="md:col-span-3 flex justify-center w-full md:w-auto py-1.5 md:py-0 border-y border-border/5 md:border-0">
                <SegmentedControl
                  value={alumno.estado}
                  onChange={(v) => onEstadoChange(alumno.id, v)}
                />
              </div>

              {/* Observaciones & Citación */}
              <div className="md:col-span-4 w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={alumno.justificacion}
                    onChange={(e) =>
                      onJustificacionChange(alumno.id, e.target.value)
                    }
                    placeholder="Agregar nota u observación..."
                    className="bg-muted/10 border-border/40 focus:border-primary/30 rounded-xl h-9 text-xs placeholder:text-muted-foreground/40 text-muted-foreground transition-[border-color] pl-3.5 w-full"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenCitacion(alumno)}
                      className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground/60 hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                    >
                      <IconMail className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Citar apoderado</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>

      <CitacionModal
        isOpen={showCitacionModal}
        onOpenChange={setShowCitacionModal}
        estudiante={selectedStudent}
      />
    </>
  );
}
