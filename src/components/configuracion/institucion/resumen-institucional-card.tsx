"use client";

import { MagicCard } from "@/components/ui/magic-card";
import {
  IconSchool,
  IconMapPin,
  IconCalendar,
  IconBuildingArch,
} from "@tabler/icons-react";
import { useWatch } from "react-hook-form";
import { type InstitucionFormControl } from "./types";
import { cn } from "@/lib/utils";

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
    <MagicCard className="rounded-2xl p-6 bg-card/30 border-border/40 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Resumen Institucional
        </h3>
      </div>

      <div className="flex flex-col gap-4 py-4">
        {/* Item 1: Nombre */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <IconSchool className="size-4 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">
              Colegio
            </span>
            <span className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
              {nombreMostrar}
            </span>
          </div>
        </div>

        {/* Item 2: Ubicación */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
            <IconMapPin className="size-4 text-violet-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">
              Ubicación
            </span>
            <span className="text-sm font-medium text-foreground/90 line-clamp-2 leading-tight">
              {ubicacion}
            </span>
            {direccion && (
              <span className="text-[10px] text-muted-foreground/70 truncate max-w-[180px]">
                {direccion}
              </span>
            )}
          </div>
        </div>

        {/* Item 3: Año Académico */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <IconCalendar className="size-4 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">
              Año Académico
            </span>
            <span className="text-sm font-bold text-foreground">{ciclo}</span>
            {(fechaInicio || fechaFin) && (
              <span className="text-[10px] text-muted-foreground/70">
                {fechaInicio
                  ? new Date(fechaInicio).toLocaleDateString()
                  : "..."}{" "}
                - {fechaFin ? new Date(fechaFin).toLocaleDateString() : "..."}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Status */}
      <div className="mt-auto pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-500 tracking-wide uppercase">
            Sistema Activo
          </span>
        </div>
      </div>
    </MagicCard>
  );
}
