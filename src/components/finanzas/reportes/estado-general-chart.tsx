"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"
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
import { cn } from "@/lib/utils"

const colors = {
  pagados: "var(--chart-9)",
  pendientes: "var(--chart-11)",
  vencidos: "var(--chart-13)",
}

const statusConfig: Record<string, { label: string; description: string; dotClass: string }> = {
  pagados: {
    label: "Pagados",
    description: "Cuotas completadas",
    dotClass: "bg-[var(--chart-9)]",
  },
  pendientes: {
    label: "Pendientes",
    description: "Por vencer",
    dotClass: "bg-[var(--chart-11)]",
  },
  vencidos: {
    label: "Vencidos",
    description: "Fuera de plazo",
    dotClass: "bg-[var(--chart-13)]",
  },
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

  // Find the dominant state
  const dominantState = processedData.reduce(
    (max, curr) => (curr.value > max.value ? curr : max),
    processedData[0] || { name: "-", value: 0, fill: "" }
  )

  return (
    <Card className="bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-inner transition-transform duration-300 hover:scale-110">
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
          className="mx-auto aspect-square w-full max-w-[220px]"
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
              innerRadius={55}
              outerRadius={90}
              strokeWidth={6}
              stroke="transparent"
              paddingAngle={3}
              cornerRadius={6}
            >
              {processedData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.fill}
                  className="transition-opacity duration-300 hover:opacity-80"
                />
              ))}
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
                          y={(viewBox.cy || 0) - 8}
                          className="fill-foreground text-3xl font-black tracking-tighter"
                        >
                          {totalPagos.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          Cuotas
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

      <CardFooter className="flex flex-col gap-3 pt-2 pb-6 px-6">
        {/* Legend with progress bars */}
        <div className="w-full space-y-2.5">
          {processedData.map((item, i) => {
            const percentage = totalPagos > 0 ? (item.value / totalPagos) * 100 : 0
            const config = statusConfig[item.name.toLowerCase()] || {
              label: item.name,
              description: "",
              dotClass: "bg-muted",
            }

            return (
              <div
                key={item.name}
                className="group p-3 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/80 hover:border-border/50 transition-[background-color,border-color] duration-300 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-125",
                        config.dotClass
                      )}
                    />
                    <div>
                      <span className="text-xs font-bold text-foreground/80">
                        {config.label}
                      </span>
                      {config.description && (
                        <span className="text-[10px] text-muted-foreground/50 ml-2 hidden sm:inline">
                          {config.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black tracking-tight tabular-nums">
                      {item.value}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/40">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-1000 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardFooter>
    </Card>
  )
}