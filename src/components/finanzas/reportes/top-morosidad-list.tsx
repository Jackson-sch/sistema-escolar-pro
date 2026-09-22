"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCrown, IconMedal, IconBrandWhatsapp } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Deudor {
  id: string;
  nombre: string;
  deuda: number;
  cuotas: number;
  telefono?: string;
  aula?: string;
}

interface TopMorosidadListProps {
  deudores: Deudor[];
}

function handleWhatsAppReminder(deudor: Deudor) {
  const phone = deudor.telefono ? deudor.telefono.replace(/\D/g, "") : "";
  const fullPhone = phone.length === 9 ? `51${phone}` : phone;
  const msg = encodeURIComponent(
    `Estimado apoderado de ${deudor.nombre}, le saludamos cordialmente del área de tesorería del colegio. ` +
      `Le recordamos que registra un saldo pendiente de ${formatCurrency(deudor.deuda)} correspondiente a sus cuotas escolares. ` +
      `Agradeceremos regularizar su pago o comunicarse con nosotros para cualquier consulta. ¡Muchas gracias!`,
  );

  if (fullPhone) {
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  } else {
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }
}

export function TopMorosidadList({ deudores }: TopMorosidadListProps) {
  const maxDeuda = deudores.length > 0 ? deudores[0].deuda : 1;


  return (
    <Card className="bg-card/70 backdrop-blur-xs border border-border/60 rounded-2xl shadow-2xs overflow-hidden h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
        <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-2xs shrink-0">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm sm:text-base font-extrabold tracking-tight text-foreground">
              Ranking de Morosidad
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 rounded-full px-2 h-4.5 text-[10px] font-black uppercase tracking-wider"
            >
              Top {deudores.length} Alumnos
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground font-normal">
            Estudiantes con mayor saldo de cuotas pendientes acumuladas
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-4 pt-1 flex-1">
        {deudores.map((deudor, i) => {
          const percentage = (deudor.deuda / maxDeuda) * 100;

          const rankConfig = [
            {
              bg: "bg-amber-500/15 border-amber-500/30",
              text: "text-amber-600",
              icon: IconCrown,
            },
            {
              bg: "bg-muted/40 border-border/40",
              text: "text-muted-foreground",
              icon: IconMedal,
            },
            {
              bg: "bg-amber-800/10 border-amber-800/20",
              text: "text-amber-800 dark:text-amber-300",
              icon: IconMedal,
            },
          ];

          const rank = rankConfig[i] || {
            bg: "bg-muted/20 border-border/20",
            text: "text-muted-foreground/60",
            icon: null,
          };

          const RankIcon = rank.icon;

          return (
            <div
              key={deudor.id}
              className="relative flex items-center justify-between group p-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 hover:border-amber-500/30 transition-colors duration-200"
            >
              <div className="relative flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl text-xs font-black shrink-0 border shadow-2xs",
                    rank.bg,
                    rank.text,
                  )}
                >
                  {RankIcon ? (
                    <RankIcon className="size-4" />
                  ) : (
                    <span className="tabular-nums font-mono text-[11px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-amber-600 transition-colors">
                    {deudor.nombre}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                      {deudor.cuotas} cuota{deudor.cuotas > 1 ? "s" : ""}
                    </span>
                    {deudor.aula && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        · {deudor.aula}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Badge
                  variant="outline"
                  className="font-mono text-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 px-2.5 h-7 rounded-lg font-black"
                >
                  {formatCurrency(deudor.deuda)}
                </Badge>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleWhatsAppReminder(deudor)}
                  title="Enviar recordatorio de pago por WhatsApp"
                  className="size-7 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer"
                >
                  <IconBrandWhatsapp className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {deudores.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <IconCrown className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">
                ¡Sin morosidad crítica!
              </p>
              <p className="text-[11px] text-muted-foreground">
                Todos los estudiantes se encuentran al día con sus pensiones.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}