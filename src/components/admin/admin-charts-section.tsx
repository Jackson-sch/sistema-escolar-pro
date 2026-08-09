"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

interface AdminChartsSectionProps {
  growthData?: { name: string; colegios: number }[];
  levelData?: { name: string; value: number }[];
}

const COLORS = [
  "oklch(0.553 0.195 240)",        // Inicial - Info (Blue)
  "oklch(0.627 0.194 149.214)",   // Primaria - Success (Green)
  "oklch(0.646 0.222 41.116)",     // Secundaria - Warning (Orange)
];

const growthConfig = {
  colegios: {
    label: "Colegios Registrados",
    color: "oklch(0.606 0.118 240)", // Institutional / Indigo
  },
} satisfies ChartConfig;

const EMPTY_GROWTH_DATA: any[] = [];
const EMPTY_LEVEL_DATA: any[] = [];

export function AdminChartsSection({
  growthData = EMPTY_GROWTH_DATA,
  levelData = EMPTY_LEVEL_DATA,
}: AdminChartsSectionProps) {
  const totalStudents = levelData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in animation-duration-">
      {/* Crecimiento de Colegios */}
      <Card className="lg:col-span-8 rounded-2xl border border-border/50 bg-card/80 shadow-sm p-0 overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Crecimiento de la Plataforma
          </CardTitle>
          <CardDescription className="text-muted-foreground/80 text-xs font-semibold">
            Historial mensual acumulado de colegios vinculados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer
            config={growthConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="fillColegios" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-colegios)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-colegios)"
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(1 0 0 / 5%)" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: "oklch(0.708 0 0 / 60%)", fontSize: 11, fontWeight: "bold" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(val) => `${val}`}
                tick={{ fill: "oklch(0.708 0 0 / 60%)", fontSize: 11, fontWeight: "bold" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.205 0 0 / 95%)",
                  borderRadius: "16px",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  boxShadow: "0 4px 20px oklch(0 0 0 / 30%)",
                }}
                labelStyle={{ fontWeight: "bold", color: "oklch(0.985 0 0)" }}
                itemStyle={{ color: "oklch(0.606 0.118 240)", fontWeight: "bold" }}
              />
              <Area
                dataKey="colegios"
                type="monotone"
                fill="url(#fillColegios)"
                stroke="var(--color-colegios)"
                strokeWidth={3}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribución por Niveles */}
      <Card className="lg:col-span-4 rounded-2xl border border-border/50 bg-card/80 shadow-sm p-0 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Alumnos por Nivel
          </CardTitle>
          <CardDescription className="text-muted-foreground/80 text-xs font-semibold">
            Distribución proporcional de la población estudiantil global.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col justify-center items-center relative">
          {totalStudents > 0 ? (
            <div className="w-full h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {levelData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry) => {
                      const percentage = totalStudents > 0 
                        ? ((Number(entry?.payload?.value) / totalStudents) * 100).toFixed(0)
                        : 0;
                      return (
                        <span className="text-xxs font-black text-muted-foreground/90 uppercase tracking-wide">
                          {value} ({percentage}%)
                        </span>
                      );
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.205 0 0 / 95%)",
                      borderRadius: "16px",
                      border: "1px solid oklch(1 0 0 / 10%)",
                    }}
                    itemStyle={{ color: "oklch(0.985 0 0)", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Centro de la dona */}
              <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/60 uppercase">Total</span>
                <p className="text-3xl font-black tracking-tight text-foreground">{totalStudents}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 opacity-60">
              <p className="text-sm font-semibold text-muted-foreground">Sin estudiantes registrados en el seed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
