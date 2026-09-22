"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import { IconSchool, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface NivelStat {
  nivel: string;
  totalProyectado: number;
  totalRecaudado: number;
  totalDeuda: number;
  totalAlumnos: number;
}

interface NivelRecaudacionMatrixProps {
  cronograma: any[];
}

export function NivelRecaudacionMatrix({ cronograma }: NivelRecaudacionMatrixProps) {
  // Agrupar por nivel académico
  const nivelesMap: Record<string, NivelStat> = {
    Inicial: { nivel: "Inicial", totalProyectado: 0, totalRecaudado: 0, totalDeuda: 0, totalAlumnos: 0 },
    Primaria: { nivel: "Primaria", totalProyectado: 0, totalRecaudado: 0, totalDeuda: 0, totalAlumnos: 0 },
    Secundaria: { nivel: "Secundaria", totalProyectado: 0, totalRecaudado: 0, totalDeuda: 0, totalAlumnos: 0 },
  };

  const studentSet = new Set<string>();

  cronograma.forEach((item: any) => {
    const rawNivel =
      item.estudiante?.nivelAcademico?.nivel?.nombre ||
      item.estudiante?.nivelAcademico?.grado?.nivel?.nombre ||
      "Primaria";

    let nivelKey = "Primaria";
    if (/inicial/i.test(rawNivel)) nivelKey = "Inicial";
    else if (/secundaria/i.test(rawNivel)) nivelKey = "Secundaria";

    const original = Number(item.monto || 0);
    const mora = Number(item.moraAcumulada || 0);
    const total = original + mora;
    const pagado = Number(item.montoPagado || (item.pagado ? total : 0));
    const saldo = Math.max(0, total - pagado);

    nivelesMap[nivelKey].totalProyectado += original;
    nivelesMap[nivelKey].totalRecaudado += pagado;
    nivelesMap[nivelKey].totalDeuda += saldo;

    if (item.estudianteId && !studentSet.has(`${nivelKey}-${item.estudianteId}`)) {
      studentSet.add(`${nivelKey}-${item.estudianteId}`);
      nivelesMap[nivelKey].totalAlumnos += 1;
    }
  });

  const nivelesList = Object.values(nivelesMap);

  return (
    <Card className="bg-card/70 backdrop-blur-xs border border-border/60 rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20 shadow-2xs shrink-0">
            <IconSchool size={18} />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-extrabold tracking-tight text-foreground">
              Rendimiento Financiero por Nivel Educativo
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Comparativa de cobranza y mora acumulada en Inicial, Primaria y Secundaria
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nivelesList.map((n) => {
            const ratio =
              n.totalProyectado > 0
                ? (n.totalRecaudado / n.totalProyectado) * 100
                : 0;

            const isHighCompliance = ratio >= 75;
            const isMedium = ratio >= 50 && ratio < 75;

            return (
              <div
                key={n.nivel}
                className="p-3.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">
                    Nivel {n.nivel}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full border",
                      isHighCompliance
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : isMedium
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20",
                    )}
                  >
                    {ratio.toFixed(1)}% Cobrado
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Recaudado:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(n.totalRecaudado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Por Cobrar:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                      {formatCurrency(n.totalDeuda)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground border-t border-border/40 pt-1">
                    <span>Total Proyectado:</span>
                    <span className="font-black text-foreground font-mono">
                      {formatCurrency(n.totalProyectado)}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      isHighCompliance
                        ? "bg-emerald-500"
                        : isMedium
                          ? "bg-amber-500"
                          : "bg-rose-500",
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
