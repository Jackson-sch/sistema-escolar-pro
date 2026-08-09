"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrophy, IconCrown, IconMedal } from "@tabler/icons-react"
import { formatCurrency } from "@/lib/formats"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Deudor {
  id: string
  nombre: string
  deuda: number
  cuotas: number
}

interface TopMorosidadListProps {
  deudores: Deudor[]
}

export function TopMorosidadList({ deudores }: TopMorosidadListProps) {
  const maxDeuda = deudores.length > 0 ? deudores[0].deuda : 1

  return (
    <Card className="bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-inner transition-transform duration-300 hover:scale-110">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl font-black tracking-tight flex items-center justify-between">
            Top Morosidad
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-full px-3 h-6 text-[10px] font-black uppercase tracking-wider">
              {deudores.length} ALUMNOS
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm font-medium opacity-60">Estudiantes con mayor deuda acumulada</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-0 flex-1">
        {deudores.map((deudor, i) => {
          const percentage = (deudor.deuda / maxDeuda) * 100

          const rankConfig = [
            {
              bg: "bg-amber-500/15 border-amber-500/30",
              text: "text-amber-600",
              icon: IconCrown,
              glow: "shadow-amber-500/10 shadow-md",
            },
            {
              bg: "bg-muted/30 border-border/30",
              text: "text-muted-foreground",
              icon: IconMedal,
              glow: "",
            },
            {
              bg: "bg-amber-800/10 border-amber-800/20",
              text: "text-amber-800 dark:text-amber-200/70",
              icon: IconMedal,
              glow: "",
            },
          ]

          const rank = rankConfig[i] || {
            bg: "bg-muted/20 border-border/15",
            text: "text-muted-foreground/60",
            icon: null,
            glow: "",
          }

          const RankIcon = rank.icon

          return (
            <div
              key={deudor.id}
              className={cn(
                "relative flex items-center justify-between group p-3.5 rounded-2xl bg-muted/50 border border-border/30 hover:bg-muted/80 hover:border-amber-500/20 transition-[background-color,border-color] duration-300 animate-in fade-in slide-in-from-left-3",
                rank.glow,
              )}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              {/* Progress bar background */}
              <div
                className="absolute inset-0 rounded-2xl bg-amber-500/[0.06] transition-[width] duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />

              <div className="relative flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl text-xs font-black shrink-0 transition-transform duration-300 group-hover:scale-110 border",
                    rank.bg,
                    rank.text,
                  )}
                >
                  {RankIcon ? (
                    <RankIcon className="size-5" />
                  ) : (
                    <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-black text-foreground/90 truncate group-hover:text-amber-600 transition-colors duration-300">
                    {deudor.nombre}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-muted-foreground/60 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-destructive/60 animate-pulse" />
                      {deudor.cuotas} cuota{deudor.cuotas > 1 ? "s" : ""} pendiente{deudor.cuotas > 1 ? "s" : ""}
                    </span>
                    {/* Mini bar showing relative debt */}
                    <div className="hidden sm:flex items-center gap-1.5 flex-1">
                      <div className="h-1 flex-1 max-w-20 bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500/50 transition-[color,width] duration-700 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Badge
                variant="outline"
                className="relative font-mono text-xs bg-destructive/5 text-destructive border-destructive/10 whitespace-nowrap ml-3 px-3 h-8 rounded-xl font-black group-hover:bg-destructive/10 transition-colors"
              >
                {formatCurrency(deudor.deuda)}
              </Badge>
            </div>
          )
        })}

        {deudores.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 animation-duration-">
            <div className="size-20 rounded-full bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
              <IconTrophy className="size-10 text-emerald-500/30" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground/60">¡Sin morosidad!</p>
              <p className="text-xs text-muted-foreground/50">Todos los estudiantes están al día con sus pagos.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}