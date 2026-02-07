"use client";

import { ChartConfig } from "@/components/ui/chart";
import { EvaluacionStats, ActividadCursoChart, TiposEvaluacionChart } from "./";

interface EvaluacionReportsProps {
  evaluaciones: any[];
}

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function EvaluacionReports({ evaluaciones }: EvaluacionReportsProps) {
  // Estadísticas generales
  const totalNotas = evaluaciones.reduce((sum, ev) => sum + ev._count.notas, 0);
  const totalEvaluaciones = evaluaciones.length;
  const sinCalificar = evaluaciones.filter(
    (ev) => ev._count.notas === 0,
  ).length;

  // Datos para gráfico de barras: Notas por Curso
  const cursosData = evaluaciones
    .reduce((acc: any[], ev) => {
      const cursoName = ev.curso.nombre;
      const existing = acc.find((item) => item.name === cursoName);
      if (existing) {
        existing.evaluations += 1;
        existing.grades += ev._count.notas;
      } else {
        acc.push({ name: cursoName, evaluations: 1, grades: ev._count.notas });
      }
      return acc;
    }, [])
    .slice(0, 5);

  // Datos para gráfico de torta: Distribución de tipos
  const tiposData = evaluaciones.reduce((acc: any[], ev) => {
    const tipoName = ev.tipoEvaluacion.nombre;
    const existing = acc.find((item) => item.name === tipoName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: tipoName,
        value: 1,
        fill: PIE_COLORS[acc.length % PIE_COLORS.length],
      });
    }
    return acc;
  }, []);

  // Generar config dinámico para el pie chart
  const dynamicPieConfig = tiposData.reduce(
    (acc: ChartConfig, item: any, index: number) => {
      acc[item.name] = {
        label: item.name,
        color: PIE_COLORS[index % PIE_COLORS.length],
      };
      return acc;
    },
    { value: { label: "Cantidad" } } as ChartConfig,
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <EvaluacionStats
        totalEvaluaciones={totalEvaluaciones}
        totalNotas={totalNotas}
        sinCalificar={sinCalificar}
        promedioGeneral={14.5}
      />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-7">
        <ActividadCursoChart data={cursosData} />
        <TiposEvaluacionChart data={tiposData} config={dynamicPieConfig} />
      </div>
    </div>
  );
}
