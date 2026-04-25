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
import { IconChartPie } from "@tabler/icons-react"

const colors = {
  pagados: "var(--chart-9)",
  pendientes: "var(--chart-11)",
  vencidos: "var(--chart-13)",
}

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
  const totalPagos = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  const processedData = data.map((item) => ({
    ...item,
    fill: colors[item.name.toLowerCase() as keyof typeof colors] || colors.pendientes,
  }))

  return (
    <Card className="liquid-glass border-none rounded-[2rem] overflow-hidden shadow-xl bg-card/40 backdrop-blur-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-inner">
          <IconChartPie size={24} />
        </div>
        <div>
          <CardTitle className="text-xl font-black tracking-tight">Distribución de Estados</CardTitle>
          <CardDescription className="text-sm font-medium opacity-60">Proporción de cuotas según su estado de pago</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pb-0 flex-1 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[240px]"
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
              innerRadius={60}
              strokeWidth={8}
              stroke="transparent"
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
                          className="fill-foreground text-3xl font-black tracking-tighter"
                        >
                          {totalPagos.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-[10px] font-black uppercase tracking-widest"
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

      <CardFooter className="flex flex-col gap-4 pt-0 pb-8 px-8">
        <div className="grid grid-cols-3 w-full gap-4">
          {processedData.map((item) => {
            const percentage = totalPagos > 0 ? ((item.value / totalPagos) * 100).toFixed(1) : "0"
            return (
              <div key={item.name} className="flex flex-col items-center gap-1.5 p-3 rounded-[1.25rem] bg-card/30 border border-border/5 hover:bg-card/50 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="capitalize text-[10px] font-black tracking-widest text-muted-foreground/80">{item.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black tracking-tighter">{item.value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/40">{percentage}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardFooter>
    </Card>
  )
}
 