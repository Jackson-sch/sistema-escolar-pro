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

export function ReporteTable({
  reportData,
  daysInMonth,
  anio,
  mes,
}: ReporteTableProps) {
  const getDayStatus = (asistencias: any[], day: number) => {
    const asistencia = asistencias.find(
      (a) => new Date(a.fecha).getDate() === day,
    );
    if (!asistencia) return null;
    if (asistencia.tardanza) return "tarde";
    if (asistencia.justificada) return "justificado";
    if (!asistencia.presente) return "ausente";
    return "presente";
  };

  const renderStatusIcon = (status: string | null) => {
    switch (status) {
      case "presente":
        return <IconCircleFilled className="size-3 text-emerald-500 mx-auto" />;
      case "ausente":
        return <IconCircleFilled className="size-3 text-red-500 mx-auto" />;
      case "tarde":
        return <IconCircleFilled className="size-3 text-amber-500 mx-auto" />;
      case "justificado":
        return <IconCircleFilled className="size-3 text-sky-500 mx-auto" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-auto relative bg-dark shadow-2xl">
      <table className="w-full border-separate border-spacing-0 min-w-max">
        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
          <TableRow className="border-b border-white/5 hover:bg-transparent">
            <TableHead className="w-[160px] sm:w-[180px] h-12 sticky left-0 bg-background dark:bg-dark z-40 border-r border-b shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)] text-[10px] font-black uppercase tracking-widest py-3 text-left text-muted-foreground">
              Estudiante
            </TableHead>

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const date = new Date(anio, mes, day);
              const weekend = isWeekend(date);
              return (
                <TableHead
                  key={day}
                  className={cn(
                    "text-center p-0 min-w-[36px] text-[10px] font-medium border-r text-muted-foreground/70",
                    weekend && "bg-muted text-muted-foreground",
                  )}
                >
                  <div className="flex flex-col items-center py-2 h-12 justify-center">
                    <span className="opacity-50 text-muted-foreground font-normal scale-90">
                      {format(date, "eee", { locale: es }).charAt(0).toUpperCase()}
                    </span>
                    <span>{day}</span>
                  </div>
                </TableHead>
              );
            })}

            <TableHead className="text-center text-[11px] font-semibold px-2 min-w-[40px] bg-emerald-50 dark:bg-emerald-500/50 dark:text-emerald-50 text-emerald-700 border-l">
              P
            </TableHead>
            <TableHead className="text-center text-[11px] font-semibold px-2 min-w-[40px] bg-red-50 dark:bg-red-500/50 dark:text-red-50 text-red-700 border-r">
              F
            </TableHead>
            <TableHead className="text-center text-[11px] font-semibold px-2 min-w-[40px] bg-amber-50 dark:bg-amber-500/50 dark:text-amber-50 text-amber-700 border-r">
              T
            </TableHead>
            <TableHead className="text-center text-[11px] font-semibold px-2 min-w-[40px] bg-sky-50 dark:bg-sky-500/50 dark:text-sky-50 text-sky-700">
              J
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.map((alumno) => {
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
                className="hover:bg-white/2 group transition-colors border-b border-white/5"
              >
                <TableCell className="sticky left-0 bg-background group-hover:bg-card/80 z-30 border-r border-b shadow-[4px_0_4px_-2px_rgba(0,0,0,0.3)] font-bold text-[11px] py-3 min-w-[160px] sm:min-w-[180px] capitalize transition-colors">
                  <div
                    className="truncate max-w-[140px] sm:max-w-[160px]"
                    title={`${alumno.apellidoPaterno} ${alumno.apellidoMaterno}, ${alumno.name}`}
                  >
                    {alumno.apellidoPaterno} {alumno.apellidoMaterno},{" "}
                    {alumno.name}
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
                          "text-center p-0 border min-w-[36px] h-11",
                          weekend && "bg-muted",
                        )}
                      >
                        <div className="flex items-center justify-center h-full">
                          {renderStatusIcon(status)}
                        </div>
                      </TableCell>
                    );
                  },
                )}

                <TableCell className="text-center font-bold text-xs bg-emerald-50/20 dark:bg-emerald-500/20 text-emerald-700 border-l min-w-[40px]">
                  {stats.P}
                </TableCell>
                <TableCell className="text-center font-bold text-xs bg-red-50/20 dark:bg-red-500/20 text-red-700 border-r min-w-[40px]">
                  {stats.F}
                </TableCell>
                <TableCell className="text-center font-bold text-xs bg-amber-50/20 dark: text-amber-700 border-r min-w-[40px]">
                  {stats.T}
                </TableCell>
                <TableCell className="text-center font-bold text-xs bg-sky-50/20 dark: text-sky-700 min-w-[40px]">
                  {stats.J}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </table>
    </div>
  );
}
