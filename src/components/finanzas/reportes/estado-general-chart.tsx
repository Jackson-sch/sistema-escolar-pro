"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const colors = {
  pagados: "var(--chart-9)",
  pendientes: "var(--chart-11)",
  vencidos: "var(--chart-13)",
}

// Definimos colores semánticos usando las variables del tema
const chartConfig = {
  count: {
    label: "Cantidad",
  },
  pagados: {
    label: "Pagados",
    color: colors.pagados,
  },
  pendientes: {
    label: "Pendientes",
    color: colors.pendientes,
  },
  vencidos: {
    label: "Vencidos",
    color: colors.vencidos,
  },
} satisfies ChartConfig

interface EstadoData {
  name: string
  value: number
  fill: string
}

interface EstadoGeneralChartProps {
  data: EstadoData[]
}

export function EstadoGeneralChart({ data }: EstadoGeneralChartProps) {
  // 1. Calculamos el total para el centro del gráfico
  const totalPagos = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  // 2. Mapeamos los datos para asegurar que usen la config de colores
  const processedData = data.map((item) => ({
    ...item,
    fill: colors[item.name.toLowerCase() as keyof typeof colors] || colors.pendientes,
  }))

  return (
    // Eliminamos h-full para que la tarjeta se ajuste al contenido
    <Card className="flex flex-col shadow-sm border-border">
      <CardHeader className="items-center pb-2 text-center">
        <CardTitle>Estado de Pagos</CardTitle>
        <CardDescription>Resumen general del periodo</CardDescription>
      </CardHeader>

      {/* Eliminamos flex-1 para que no ocupe espacio innecesario */}
      <CardContent className="pb-2">
        <ChartContainer
          config={chartConfig}
          // Reducimos la altura máxima del contenedor del gráfico
          className="mx-auto aspect-square max-h-[180px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={processedData}
              dataKey="value"
              nameKey="name"
              innerRadius={40} // Reduje ligeramente el radio interno para proporción
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold" // Reduje un poco el tamaño de fuente
                        >
                          {totalPagos.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs font-medium uppercase tracking-wider"
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      {/* Reducimos el padding superior y eliminamos el Separator */}
      <CardFooter className="flex flex-col gap-3 pt-2 pb-4">
        <div className="grid grid-cols-3 w-full gap-2 text-center text-xs">
          {processedData.map((item) => {
            const percentage = totalPagos > 0 ? ((item.value / totalPagos) * 100).toFixed(1) : "0"
            return (
              <div key={item.name} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="capitalize font-medium">{item.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold">{item.value}</span>
                  <span className="text-[10px] text-muted-foreground">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardFooter>
    </Card>
  )
}