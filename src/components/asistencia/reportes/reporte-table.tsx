"use client";

import { format, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import { IconCircleFilled } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReporteTableProps {
  reportData: any[];
  daysInMonth: number;
  anio: number;
  mes: number;
}

function parseDayFromDate(dateInput: string | Date): number {
  if (!dateInput) return -1;
  if (typeof dateInput === "string") {
    const datePart = dateInput.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      return parseInt(parts[2], 10);
    }
  }
  const d = new Date(dateInput);
  return d.getUTCDate();
}

function getDayStatus(asistencias: any[], day: number) {
  const asistencia = asistencias.find(
    (a) => parseDayFromDate(a.fecha) === day,
  );
  if (!asistencia) return null;
  if (asistencia.tardanza) return "tarde";
  if (asistencia.justificada) return "justificado";
  if (!asistencia.presente) return "ausente";
  return "presente";
}

function renderStatusIcon(status: string | null) {
  switch (status) {
    case "presente":
      return <IconCircleFilled className="size-2.5 text-emerald-500 mx-auto drop-shadow-xs" />;
    case "ausente":
      return <IconCircleFilled className="size-2.5 text-rose-500 mx-auto drop-shadow-xs" />;
    case "tarde":
      return <IconCircleFilled className="size-2.5 text-amber-500 mx-auto drop-shadow-xs" />;
    case "justificado":
      return <IconCircleFilled className="size-2.5 text-sky-500 mx-auto drop-shadow-xs" />;
    default:
      return <span className="text-muted-foreground/20 text-[10px]">•</span>;
  }
}

export function ReporteTable({
  reportData,
  daysInMonth,
  anio,
  mes,
}: ReporteTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md shadow-lg shadow-indigo-500/5">
      <div className="overflow-x-auto relative max-h-[600px] scrollbar-thin">
        <Table className="border-collapse min-w-max">
          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-md z-20 border-b border-border/40">
            <TableRow className="hover:bg-transparent border-b border-border/40">
              <TableHead className="w-[180px] sm:w-[220px] h-12 sticky left-0 bg-muted/95 backdrop-blur-md z-30 border-r border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-[4px_0_12px_-2px_rgba(0,0,0,0.06)] px-4">
                Estudiante
              </TableHead>

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(anio, mes, day);
                const weekend = isWeekend(date);
                return (
                  <TableHead
                    key={day}
                    className={cn(
                      "text-center p-0 min-w-[34px] text-[10px] font-bold border-r border-border/20 text-muted-foreground/80",
                      weekend && "bg-muted/40 text-muted-foreground/40",
                    )}
                  >
                    <div className="flex flex-col items-center py-1.5 h-11 justify-center">
                      <span className="text-[9px] font-semibold opacity-60 uppercase">
                        {format(date, "eee", { locale: es }).charAt(0)}
                      </span>
                      <span className="text-xs font-mono font-bold">{day}</span>
                    </div>
                  </TableHead>
                );
              })}

              <TableHead className="text-center text-[10px] font-black uppercase px-2 min-w-[42px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l border-border/40">
                P
              </TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase px-2 min-w-[42px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-r border-border/40">
                F
              </TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase px-2 min-w-[42px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-r border-border/40">
                T
              </TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase px-2 min-w-[42px] bg-sky-500/10 text-sky-600 dark:text-sky-400">
                J
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((alumno, idx) => {
              const stats = {
                P: alumno.asistencias.filter(
                  (a: any) => a.presente && !a.tardanza && !a.justificada,
                ).length,
                F: alumno.asistencias.filter(
                  (a: any) => !a.presente && !a.justificada,
                ).length,
                T: alumno.asistencias.filter((a: any) => a.tardanza).length,
                J: alumno.asistencias.filter((a: any) => a.justificada).length,
              };

              return (
                <TableRow
                  key={alumno.id}
                  className="group hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0"
                >
                  <TableCell className="sticky left-0 bg-background/95 group-hover:bg-muted/95 backdrop-blur-md z-10 border-r border-border/40 font-bold text-xs py-2.5 px-4 min-w-[180px] sm:min-w-[220px] shadow-[4px_0_12px_-2px_rgba(0,0,0,0.06)] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground/40 hidden sm:inline">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div
                        className="truncate max-w-[150px] sm:max-w-[180px] uppercase font-bold text-foreground/90"
                        title={`${alumno.apellidoPaterno} ${alumno.apellidoMaterno}, ${alumno.name}`}
                      >
                        {alumno.apellidoPaterno} {alumno.apellidoMaterno},{" "}
                        <span className="font-semibold text-foreground/70">{alumno.name}</span>
                      </div>
                    </div>
                  </TableCell>

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => {
                      const date = new Date(anio, mes, day);
                      const weekend = isWeekend(date);
                      const status = getDayStatus(alumno.asistencias, day);
                      return (
                        <TableCell
                          key={day}
                          className={cn(
                            "text-center p-0 border-r border-border/20 min-w-[34px] h-10",
                            weekend && "bg-muted/20",
                          )}
                        >
                          <div className="flex items-center justify-center h-full">
                            {renderStatusIcon(status)}
                          </div>
                        </TableCell>
                      );
                    },
                  )}

                  <TableCell className="text-center font-mono font-bold text-xs bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-l border-border/40 min-w-[42px]">
                    {stats.P}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs bg-rose-500/5 text-rose-600 dark:text-rose-400 border-r border-border/40 min-w-[42px]">
                    {stats.F}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs bg-amber-500/5 text-amber-600 dark:text-amber-400 border-r border-border/40 min-w-[42px]">
                    {stats.T}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs bg-sky-500/5 text-sky-600 dark:text-sky-400 min-w-[42px]">
                    {stats.J}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
