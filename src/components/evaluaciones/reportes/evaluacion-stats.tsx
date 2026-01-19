import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconChartBar, IconUsers, IconAlertTriangle, IconAward } from "@tabler/icons-react"

interface EvaluacionStatsProps {
  totalEvaluaciones: number
  totalNotas: number
  sinCalificar: number
  promedioGeneral: number
}

export function EvaluacionStats({
  totalEvaluaciones,
  totalNotas,
  sinCalificar,
  promedioGeneral
}: EvaluacionStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card/30 border-border/40 shadow-sm transition-all hover:bg-card/40 hover:border-violet-500/20">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            Total Evaluaciones
          </CardTitle>
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <IconChartBar className="size-4 text-violet-500" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-3xl font-bold text-foreground">{totalEvaluaciones}</div>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">Programadas esta gestión</p>
        </CardContent>
      </Card>

      <Card className="bg-card/30 border-border/40 shadow-sm transition-all hover:bg-card/40 hover:border-emerald-500/20">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            Notas Registradas
          </CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <IconUsers className="size-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-3xl font-bold text-foreground">{totalNotas}</div>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">Ingresadas al sistema</p>
        </CardContent>
      </Card>

      <Card className="bg-card/30 border-border/40 shadow-sm transition-all hover:bg-card/40 hover:border-amber-500/20">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            Sin Calificar
          </CardTitle>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <IconAlertTriangle className="size-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-3xl font-bold text-foreground">{sinCalificar}</div>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">Evaluaciones pendientes</p>
        </CardContent>
      </Card>

      <Card className="bg-card/30 border-border/40 shadow-sm transition-all hover:bg-card/40 hover:border-blue-500/20">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            Promedio General
          </CardTitle>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <IconAward className="size-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-3xl font-bold text-foreground">{promedioGeneral.toFixed(1)}</div>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">Escala vigesimal (estimado)</p>
        </CardContent>
      </Card>
    </div>
  )
}
