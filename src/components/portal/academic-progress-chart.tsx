"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface AcademicProgressChartProps {
  data: { name: string; gpa: number }[];
}

const chartConfig = {
  gpa: {
    label: "Promedio",
    color: "#10b981",
  },
} satisfies ChartConfig;

export function AcademicProgressChart({ data }: AcademicProgressChartProps) {
  const currentGPA = data[data.length - 1]?.gpa || 0;
  const previousGPA = data.length >= 2 ? data[data.length - 2].gpa : currentGPA;
  const trend =
    previousGPA !== 0
      ? (((currentGPA - previousGPA) / previousGPA) * 100).toFixed(1)
      : "0";
  const isUp = Number(trend) >= 0;

  return (
    <div className="space-y-6 w-auto h-full flex flex-col">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">
            Progreso Académico
          </h3>
          <p className="text-xs text-slate-500 font-medium tracking-tight">
            Rendimiento Semestre Actual
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-4xl font-black text-emerald-500">
              {currentGPA.toFixed(1)}
            </span>
            <span className="text-slate-500 font-bold text-sm">/ 20</span>
          </div>
          <div
            className={cn(
              "text-[10px] font-black flex items-center justify-end gap-1",
              isUp ? "text-emerald-500" : "text-red-500",
            )}
          >
            <span className="text-sm leading-none">{isUp ? "↑" : "↓"}</span>
            {Math.abs(Number(trend))}% vs mes anterior
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillGpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#475569"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3).toUpperCase()}
                dy={10}
              />
              <ChartTooltip
                cursor={{ stroke: "#10b981", strokeWidth: 1 }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Area
                type="monotone"
                dataKey="gpa"
                stroke="#10b981"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#fillGpa)"
                animationDuration={1500}
                dot={{
                  stroke: "#10b981",
                  strokeWidth: 2,
                  r: 4,
                  fill: "#0f172a",
                }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
