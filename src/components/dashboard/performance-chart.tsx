"use client"

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { level: "Inicial", score: 18.5, b: 15.2 },
  { level: "Primaria", score: 16.8, b: 14.5 },
  { level: "Secundaria", score: 14.2, b: 13.0 },
]

const chartConfig = {
  score: {
    label: "Promedio 2025",
    color: "hsl(var(--chart-1))",
  },
  b: {
    label: "Promedio 2024",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function PerformanceChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="level"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="score" fill="var(--color-score)" radius={4} />
          <Bar dataKey="b" fill="var(--color-b)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
