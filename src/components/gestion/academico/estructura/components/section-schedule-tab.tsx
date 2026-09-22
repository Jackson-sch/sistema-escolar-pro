"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconClock,
  IconCalendarEvent,
  IconExternalLink,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHorariosBySeccionAction } from "@/actions/schedules";

const DIAS_SEMANA = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miércoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
];

interface SectionScheduleTabProps {
  seccionId: string;
  onOpenScheduleEditor: () => void;
}

export function SectionScheduleTab({
  seccionId,
  onOpenScheduleEditor,
}: SectionScheduleTabProps) {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getHorariosBySeccionAction(seccionId).then((res) => {
      if (isMounted) {
        if (res.data) setHorarios(res.data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [seccionId]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/20">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <IconClock className="size-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              Horario Escolar Semanal
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {horarios.length} bloques horarios programados de Lunes a Viernes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenScheduleEditor}
            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
          >
            <IconPlus className="size-3.5" />
            <span>Editar Bloques</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-border/60 cursor-pointer"
          >
            <Link href="/gestion/academico/horarios">
              <IconExternalLink className="size-3.5" />
              <span>Módulo Completo</span>
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <IconLoader2 className="size-6 animate-spin text-primary" />
          <span className="text-xs font-semibold">Cargando horario semanal...</span>
        </div>
      ) : horarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 border border-dashed rounded-2xl p-6 text-center">
          <IconCalendarEvent className="size-10 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-bold text-foreground">No hay bloques horarios configurados</p>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
            Este salón aún no tiene asignado su cronograma pedagógico semanal.
          </p>
          <Button
            size="sm"
            onClick={onOpenScheduleEditor}
            className="mt-4 h-8 px-4 rounded-xl text-xs font-bold cursor-pointer"
          >
            <IconPlus className="size-3.5 mr-1" />
            Programar Horario
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {DIAS_SEMANA.map((dia) => {
            const bloquesDia = horarios.filter((h) => h.diaSemana === dia.id);
            if (bloquesDia.length === 0) return null;

            return (
              <div
                key={dia.id}
                className="rounded-xl border border-border/40 bg-card overflow-hidden"
              >
                <div className="px-3.5 py-2 bg-muted/30 border-b border-border/30 flex items-center justify-between">
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">
                    {dia.nombre}
                  </span>
                  <Badge variant="secondary" className="text-[9px] font-bold h-4.5 px-1.5">
                    {bloquesDia.length} bloques
                  </Badge>
                </div>

                <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {bloquesDia.map((bloque) => {
                    const areaColor = bloque.curso?.areaCurricular?.color || "#6366f1";
                    const prof = bloque.curso?.profesor;

                    return (
                      <div
                        key={bloque.id}
                        className="p-2.5 rounded-lg border border-border/40 bg-muted/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {bloque.horaInicio} - {bloque.horaFin}
                          </span>
                          <div
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: areaColor }}
                          />
                        </div>

                        <p className="text-xs font-bold text-foreground truncate">
                          {bloque.curso?.nombre}
                        </p>

                        {prof && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {prof.name} {prof.apellidoPaterno}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
