"use client";

import { IconTrendingUp } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MESES_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface IndividualHistoryTableProps {
  data: any[];
}

export function IndividualHistoryTable({ data }: IndividualHistoryTableProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden shadow-lg shadow-indigo-500/5">
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <IconTrendingUp className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              Evolución por Periodos Mensuales
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Tasa de puntualidad e inasistencias desglosada
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Mes
              </TableHead>
              <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Pres.
              </TableHead>
              <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                Falt.
              </TableHead>
              <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Tard.
              </TableHead>
              <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Just.
              </TableHead>
              <TableHead className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tasa de Asistencia
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((mesData) => {
              const totalDias =
                mesData.presentes +
                mesData.ausentes +
                mesData.tardanzas +
                mesData.justificadas;
              const tasa =
                totalDias > 0
                  ? ((mesData.presentes +
                      mesData.tardanzas +
                      mesData.justificadas) /
                      totalDias) *
                    100
                  : 0;

              return (
                <TableRow
                  key={mesData.mes}
                  className="group border-b border-border/20 last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="py-3 px-5 font-bold text-xs uppercase text-foreground">
                    {MESES_OPTIONS[mesData.mes]?.nombre || `Mes ${mesData.mes}`}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {mesData.presentes}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                    {mesData.ausentes}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                    {mesData.tardanzas}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                    {mesData.justificadas}
                  </TableCell>
                  <TableCell className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 h-2 bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            tasa >= 90
                              ? "bg-emerald-500"
                              : tasa >= 75
                                ? "bg-amber-500"
                                : "bg-rose-500",
                          )}
                          style={{ width: `${tasa}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-mono font-bold w-12 text-right",
                          tasa >= 90
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tasa >= 75
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {tasa.toFixed(1)}%
                      </span>
                    </div>
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
