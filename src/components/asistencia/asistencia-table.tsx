"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { IconUser } from "@tabler/icons-react";
import { SegmentedControl } from "./segmented-control";

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
  return (
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
          Observaciones
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
            className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-3 items-start md:items-center bg-card/40 hover:bg-card/60 border border-border/40 p-3 md:p-2 rounded-2xl transition-all group shadow"
          >
            {/* ID */}
            <div className="hidden md:block col-span-1">
              <span className="text-[10px] font-bold text-muted-foreground transition-colors">
                #{String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Estudiante */}
            <div className="col-span-12 md:col-span-4 flex items-center gap-3 w-full">
              <Avatar className="h-11 w-11 md:h-10 md:w-10 border border-primary/30 shadow-2xl ring-1 ring-primary/15 shrink-0">
                <AvatarImage src={alumno.image || ""} alt={alumno.name} />
                <AvatarFallback className="bg-linear-to-br from-primary/30 to-primary/5 text-primary text-[10px] font-black uppercase">
                  {alumno.name?.[0]}
                  {alumno.apellidoPaterno?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 capitalize">
                <span className="text-sm font-bold text-muted-foreground truncate leading-tight tracking-tight">
                  {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground tracking-tight">
                  {alumno.name}
                </span>
              </div>
            </div>

            {/* Estado */}
            <div className="col-span-12 md:col-span-3 flex justify-center w-full md:w-auto py-1">
              <SegmentedControl
                value={alumno.estado}
                onChange={(v) => onEstadoChange(alumno.id, v)}
              />
            </div>

            {/* Observaciones */}
            <div className="col-span-12 md:col-span-4 w-full">
              <div className="relative">
                <Input
                  value={alumno.justificacion}
                  onChange={(e) =>
                    onJustificacionChange(alumno.id, e.target.value)
                  }
                  placeholder="Agregar nota..."
                  className="bg-muted/20 border focus:border-primary/20 rounded-full h-10 md:h-9 text-xs placeholder:text-muted-foreground text-muted-foreground transition-all pl-4 w-full"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
