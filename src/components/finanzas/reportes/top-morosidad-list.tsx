"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrophy, IconCrown } from "@tabler/icons-react"
import { formatCurrency } from "@/lib/formats"

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
    <Card className="bg-card border-border shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Top Morosidad
          <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {deudores.length} {deudores.length === 1 ? 'alumno' : 'alumnos'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {deudores.map((deudor, i) => {
          // Estilos para los primeros 3 puestos
          const isTop = i < 3
          let rankColor = "bg-muted text-muted-foreground"
          let RankIcon = null

          if (i === 0) {
            rankColor = "bg-primary text-primary-foreground"
            RankIcon = IconCrown
          } else if (i === 1) {
            rankColor = "bg-muted-foreground text-background"
          } else if (i === 2) {
            rankColor = "bg-secondary text-secondary-foreground"
          }

          return (
            <div 
              key={deudor.id} 
              className="flex items-center justify-between group p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Número de Ranking */}
                <div className={`flex size-8 items-center justify-center rounded-full text-[10px] font-bold shrink-0 transition-transform group-hover:scale-110 ${rankColor}`}>
                  {RankIcon ? <RankIcon className="size-4" /> : `0${i + 1}`}
                </div>

                {/* Info Estudiante */}
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {deudor.nombre}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {deudor.cuotas} cuota{deudor.cuotas > 1 ? "s" : ""} pendiente{deudor.cuotas > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Badge Deuda */}
              <Badge 
                variant="outline" 
                className="font-mono text-xs bg-destructive/10 text-destructive border-destructive/20 whitespace-nowrap ml-2"
              >
                {formatCurrency(deudor.deuda)}
              </Badge>
            </div>
          )
        })}
        
        {/* Estado Vacío */}
        {deudores.length === 0 && (
          <div className="py-8 text-center flex flex-col items-center gap-2">
            <IconTrophy className="size-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Sin registros de morosidad.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}