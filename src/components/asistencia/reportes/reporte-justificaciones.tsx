"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconFileCheck, IconLoader2, IconCalendar } from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ReporteJustificacionesProps {
  justificaciones: any[];
  isPending: boolean;
}

export function ReporteJustificaciones({ justificaciones, isPending }: ReporteJustificacionesProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground animate-in fade-in animation-duration-">
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 shadow-lg shadow-sky-500/5">
          <IconLoader2 className="size-8 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Recuperando Registros de Justificaciones
          </p>
          <p className="text-xs text-muted-foreground/70">Consolidando permisos e inasistencias justificadas...</p>
        </div>
      </div>
    );
  }

  if (justificaciones.length === 0) {
    return (
      <div className="min-h-[380px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/40 bg-card/40 backdrop-blur-md shadow-xs animate-in zoom-in-95 animation-duration-">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full" />
          <div className="relative size-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shadow-md shadow-sky-500/10">
            <IconFileCheck className="size-8" />
          </div>
        </div>
        <h3 className="text-base font-extrabold uppercase tracking-tight text-foreground">Sin Justificaciones Registradas</h3>
        <p className="max-w-sm text-center text-xs text-muted-foreground leading-relaxed mt-1">
          No se encontraron permisos o inasistencias justificadas en el periodo o sección seleccionada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in animation-duration-">
      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden shadow-lg shadow-sky-500/5">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
              <IconFileCheck className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Historial de Justificaciones
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium">Registro detallado de motivos de inasistencia respaldados</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5 rounded-full px-2.5 py-0.5">
            {justificaciones.length} Justificaciones
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[150px]">
                  Fecha
                </TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[220px]">
                  Estudiante
                </TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[150px]">
                  Sección / Aula
                </TableHead>
                <TableHead className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Motivo / Observación Registrada
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {justificaciones.map((item) => (
                <TableRow key={item.id} className="group border-b border-border/20 last:border-0 hover:bg-sky-500/[0.02] transition-colors">
                  <TableCell className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <IconCalendar className="size-3.5 text-sky-500" />
                      <span className="text-xs font-mono font-bold text-foreground capitalize">
                        {format(new Date(item.fecha), "dd MMM yyyy", { locale: es })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="text-xs font-bold uppercase text-foreground/90">{item.estudiante}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <Badge variant="outline" className="text-[10px] font-bold border-border/40 bg-muted/30 text-muted-foreground rounded-full px-2 py-0">
                      {item.seccion}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-5">
                    <p className="text-xs text-muted-foreground italic border-l-2 border-sky-500/30 pl-3 py-0.5 leading-relaxed">
                      &quot;{item.justificacion}&quot;
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
