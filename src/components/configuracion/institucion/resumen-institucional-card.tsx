"use client";

import { Card } from "@/components/ui/card";
import {
  IconSchool,
  IconMapPin,
  IconCalendar,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useWatch } from "react-hook-form";
import { type InstitucionFormControl } from "./types";

interface ResumenInstitucionalCardProps {
  control: InstitucionFormControl;
}

export function ResumenInstitucionalCard({
  control,
}: ResumenInstitucionalCardProps) {
  const nombreInstitucion = useWatch({ control, name: "nombreInstitucion" });
  const nombreComercial = useWatch({ control, name: "nombreComercial" });
  const direccion = useWatch({ control, name: "direccion" });
  const distrito = useWatch({ control, name: "distrito" });
  const departamento = useWatch({ control, name: "departamento" });
  const cicloEscolarActual = useWatch({ control, name: "cicloEscolarActual" });
  const fechaInicio = useWatch({ control, name: "fechaInicioClases" });
  const fechaFin = useWatch({ control, name: "fechaFinClases" });

  const ubicacion =
    [distrito, departamento].filter(Boolean).join(", ") ||
    "Ubicación no definida";
  const nombreMostrar =
    nombreComercial || nombreInstitucion || "Nueva Institución";
  const ciclo = cicloEscolarActual || new Date().getFullYear();

  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
          <IconInfoCircle className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Resumen Institucional
          </h3>
          <p className="text-xs text-muted-foreground font-normal">
            Vista previa de parámetros clave.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-1">
        {/* Item 1: Nombre */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <IconSchool className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Colegio
            </span>
            <span className="text-xs font-bold text-foreground line-clamp-2 leading-tight">
              {nombreMostrar}
            </span>
          </div>
        </div>

        {/* Item 2: Ubicación */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <IconMapPin className="size-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Ubicación
            </span>
            <span className="text-xs font-medium text-foreground/90 line-clamp-2 leading-tight">
              {ubicacion}
            </span>
            {direccion && (
              <span className="text-[10px] text-muted-foreground/70 truncate max-w-[200px]">
                {direccion}
              </span>
            )}
          </div>
        </div>

        {/* Item 3: Año Académico */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <IconCalendar className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Año Académico
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              {ciclo}
            </span>
            {(fechaInicio || fechaFin) && (
              <span className="text-[10px] text-muted-foreground/70 font-mono">
                {fechaInicio || "..."} — {fechaFin || "..."}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Status */}
      <div className="mt-auto pt-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Sistema Activo
          </span>
        </div>
      </div>
    </Card>
  );
}
