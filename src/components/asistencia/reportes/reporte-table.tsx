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
      {/* ── Leyenda Rápida Superior ── */}
      <div className="flex items-center justify-between gap-4 p-3 sm:px-5 border-b border-border/40 bg-muted/20 text-xs flex-wrap">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
            Leyenda:
          </span>
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <IconCircleFilled className="size-2.5 text-emerald-500" />
            <span>Presente (P)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <IconCircleFilled className="size-2.5 text-amber-500" />
            <span>Tardanza (T)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <IconCircleFilled className="size-2.5 text-rose-500" />
            <span>Falta (F)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <IconCircleFilled className="size-2.5 text-sky-500" />
            <span>Justificada (J)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <span className="inline-block size-3 rounded-xs bg-muted/80 border border-border/40" />
            <span>Fin de semana</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative max-h-[600px] scrollbar-thin">
        <Table className="border-collapse min-w-max">
          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-md z-20 border-b border-border/40">
            <TableRow className="hover:bg-transparent border-b border-border/40">
              <TableHead className="w-[240px] sm:w-[280px] h-12 sticky left-0 bg-muted/95 backdrop-blur-md z-30 border-r border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-[4px_0_12px_-2px_rgba(0,0,0,0.06)] px-4">
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
                      weekend && "bg-muted/50 dark:bg-slate-900/50 text-muted-foreground/40",
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
              <TableHead className="text-center text-[10px] font-black uppercase px-2 min-w-[42px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border-r border-border/40">
                J
              </TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase px-2 min-w-[54px] bg-primary/10 text-primary">
                % Asist
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((alumno, idx) => {
              const P = alumno.asistencias.filter(
                (a: any) => a.presente && !a.tardanza && !a.justificada,
              ).length;
              const F = alumno.asistencias.filter(
                (a: any) => !a.presente && !a.justificada,
              ).length;
              const T = alumno.asistencias.filter((a: any) => a.tardanza).length;
              const J = alumno.asistencias.filter((a: any) => a.justificada).length;
              const totalMarcados = P + F + T + J;
              const pctAsistencia =
                totalMarcados > 0 ? Math.round(((P + T) / totalMarcados) * 100) : 0;

              return (
                <TableRow
                  key={alumno.id}
                  className="group hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0"
                >
                  <TableCell className="sticky left-0 bg-background/95 group-hover:bg-muted/95 backdrop-blur-md z-10 border-r border-border/40 font-bold text-xs py-2.5 px-4 min-w-[240px] sm:min-w-[280px] shadow-[4px_0_12px_-2px_rgba(0,0,0,0.06)] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground/40 hidden sm:inline shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div
                        className="truncate uppercase font-bold text-foreground/90"
                        title={`${alumno.apellidoPaterno} ${alumno.apellidoMaterno || ""}, ${alumno.name}`}
                      >
                        {alumno.apellidoPaterno} {alumno.apellidoMaterno || ""}, {alumno.name}
                      </div>
                    </div>
                  </TableCell>

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const date = new Date(anio, mes, day);
                    const weekend = isWeekend(date);
                    const status = getDayStatus(alumno.asistencias, day);

                    return (
                      <TableCell
                        key={day}
                        className={cn(
                          "p-0 text-center border-r border-border/20 h-10",
                          weekend && "bg-muted/30 dark:bg-slate-900/30",
                        )}
                      >
                        {weekend ? (
                          <span className="text-muted-foreground/15 text-[9px] select-none">-</span>
                        ) : (
                          renderStatusIcon(status)
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell className="text-center font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-l border-border/40">
                    {P}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/5 border-r border-border/40">
                    {F}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 border-r border-border/40">
                    {T}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs text-sky-600 dark:text-sky-400 bg-sky-500/5 border-r border-border/40">
                    {J}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs text-primary bg-primary/5">
                    {pctAsistencia}%
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
