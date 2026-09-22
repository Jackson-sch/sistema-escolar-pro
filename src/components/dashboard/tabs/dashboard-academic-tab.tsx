"use client";

import { AcademicCnebDistribution } from "./academic-cneb-distribution";
import { AcademicRiskTable } from "./academic-risk-table";
import {
  IconSchool,
  IconAward,
  IconAlertTriangle,
  IconCalendarCheck,
  IconArrowRight,
  IconBook,
  IconFileCertificate,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardAcademicTabProps {
  stats: any;
}

export function DashboardAcademicTab({ stats }: DashboardAcademicTabProps) {
  const cnebStats = stats?.cnebStats || { total: 0, ad: 0, a: 0, b: 0, c: 0 };
  const academicAverage = stats?.academicAverage || 0;
  const atRiskStudents = stats?.atRiskStudents || [];
  const attendanceRate = stats?.attendanceRate || 0;

  return (
    <div className="space-y-6">
      {/* Mini KPIs Académicos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Promedio General */}
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Promedio Institucional
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-mono text-primary mt-0.5">
              {academicAverage.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 20</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Escala vigesimal oficial
            </p>
          </div>
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <IconSchool className="size-5" />
          </div>
        </div>

        {/* KPI 2: Logro Destacado / Esperado (AD + A) */}
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Rendimiento Satisfactorio
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {cnebStats.total > 0
                ? `${Math.round(((cnebStats.ad + cnebStats.a) / cnebStats.total) * 100)}%`
                : "0%"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Calificaciones AD y A
            </p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <IconAward className="size-5" />
          </div>
        </div>

        {/* KPI 3: Casos en Riesgo (C) */}
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Alumnos en Riesgo
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              {cnebStats.c}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Calificaciones en Inicio (C)
            </p>
          </div>
          <div className="size-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <IconAlertTriangle className="size-5" />
          </div>
        </div>

        {/* KPI 4: Asistencia Escolar */}
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Asistencia de Hoy
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-mono text-foreground mt-0.5">
              {Math.round(attendanceRate)}%
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Tasa de puntualidad y presencia
            </p>
          </div>
          <div className="size-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <IconCalendarCheck className="size-5" />
          </div>
        </div>
      </div>

      {/* Semáforo CNEB */}
      <AcademicCnebDistribution
        cnebStats={cnebStats}
        academicAverage={academicAverage}
      />

      {/* Alerta Temprana & Accesos Rápidos */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AcademicRiskTable students={atRiskStudents} />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-2xl border-border/50 bg-card/80 p-5 shadow-2xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Accesos Pedagógicos</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Módulos de gestión curricular y normativas
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between rounded-xl h-10 border-border/60 text-xs font-semibold"
                asChild
              >
                <Link href="/evaluaciones">
                  <span className="flex items-center gap-2">
                    <IconAward size={16} className="text-primary" /> Registro de Evaluaciones
                  </span>
                  <IconArrowRight size={14} className="text-muted-foreground" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between rounded-xl h-10 border-border/60 text-xs font-semibold"
                asChild
              >
                <Link href="/gestion/academico/siagie">
                  <span className="flex items-center gap-2">
                    <IconFileCertificate size={16} className="text-amber-500" /> Validador Oficial SIAGIE
                  </span>
                  <IconArrowRight size={14} className="text-muted-foreground" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between rounded-xl h-10 border-border/60 text-xs font-semibold"
                asChild
              >
                <Link href="/gestion/academico/estructura">
                  <span className="flex items-center gap-2">
                    <IconBook size={16} className="text-indigo-500" /> Malla Curricular y Horarios
                  </span>
                  <IconArrowRight size={14} className="text-muted-foreground" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
