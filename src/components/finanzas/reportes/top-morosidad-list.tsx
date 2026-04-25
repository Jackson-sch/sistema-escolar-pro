"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrophy, IconCrown } from "@tabler/icons-react"
import { formatCurrency } from "@/lib/formats"
import { AlertTriangle } from "lucide-react"

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
  return (
    <Card className="liquid-glass border-none rounded-[2rem] overflow-hidden shadow-xl bg-card/40 backdrop-blur-md h-full">
      <CardHeader className="flex flex-row items-center gap-4 pb-6">
        <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-inner">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl font-black tracking-tight flex items-center justify-between">
            Top Morosidad
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-full px-3 h-6 text-[10px] font-black uppercase">
              {deudores.length} ALUMNOS
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm font-medium opacity-60">Estudiantes con mayor deuda acumulada</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {deudores.map((deudor, i) => {
          const isFirst = i === 0
          let rankColor = "bg-muted/50 text-muted-foreground/60 border-border/20"
          let RankIcon = null

          if (i === 0) {
            rankColor = "bg-primary/20 text-primary border-primary/30"
            RankIcon = IconCrown
          } else if (i === 1) {
            rankColor = "bg-secondary/40 text-secondary-foreground border-secondary/20"
          }

          return (
            <div 
              key={deudor.id} 
              className="flex items-center justify-between group p-3 rounded-[1.25rem] bg-card/30 border border-border/10 hover:bg-card/50 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`flex size-10 items-center justify-center rounded-xl text-xs font-black shrink-0 transition-all group-hover:scale-110 border ${rankColor} shadow-sm`}>
                  {RankIcon ? <RankIcon className="size-5" /> : `0${i + 1}`}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-black text-foreground/90 truncate group-hover:text-primary transition-colors">
                    {deudor.nombre}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground/60 flex items-center gap-1.5">
                    <span className="size-1 rounded-full bg-destructive/60" />
                    {deudor.cuotas} cuota{deudor.cuotas > 1 ? "s" : ""} pendiente{deudor.cuotas > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <Badge 
                variant="outline" 
                className="font-mono text-xs bg-destructive/5 text-destructive border-destructive/10 whitespace-nowrap ml-2 px-3 h-8 rounded-xl font-black"
              >
                {formatCurrency(deudor.deuda)}
              </Badge>
            </div>
          )
        })}
        
        {deudores.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
              <IconTrophy className="size-8 text-primary/30" />
            </div>
            <p className="text-sm font-bold text-muted-foreground/60">Sin registros de morosidad.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}