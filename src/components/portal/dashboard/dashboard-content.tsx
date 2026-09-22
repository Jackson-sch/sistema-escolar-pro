"use client";

import { Card } from "@/components/ui/card";
import { AcademicProgressChart } from "@/components/portal/academic/academic-progress-chart";
import { FinancialStatus } from "@/components/portal/finance/financial-status";
import { useComponentShortcuts } from "@/hooks/use-component-shortcuts";
import AttendanceWidget from "@/components/portal/dashboard/attendance-widget";
import PsychopedagogicalWidget from "@/components/portal/dashboard/psychopedagogical-widget";
import SchoolAnnouncementsWidget from "@/components/portal/dashboard/school-announcements-widget";

import { QuickSummaryHero } from "@/components/portal/dashboard/quick-summary-hero";

interface DashboardContentProps {
  data: any;
}

export function DashboardContent({ data }: DashboardContentProps) {
  const { currentStudent, stats } = data;
  const {
    payments,
    attendancePercentage,
    asistenciaHoy,
    chartData,
    fichas,
    anuncios,
  } = stats;

  useComponentShortcuts({
    onSearch: () => {},
  });

  return (
    <div className="flex flex-col gap-5">
      {/* 1. El Parte del Día & Accesos Directos */}
      <QuickSummaryHero
        studentId={currentStudent?.id}
        studentName={currentStudent?.name || "Estudiante"}
        studentGrade={currentStudent?.grado}
        asistenciaHoy={asistenciaHoy}
        payments={payments}
        attendancePercentage={attendancePercentage}
      />

      {/* 2. Gráficos & Estado Financiero */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[380px] rounded-2xl border-border/60 bg-card p-5 sm:p-6 shadow-2xs">
            <div className="h-full w-full">
              <AcademicProgressChart data={chartData} />
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <FinancialStatus payments={payments} />
        </div>
      </div>

      {/* 3. Comunicados, Tutoría y Asistencia */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SchoolAnnouncementsWidget
          anuncios={anuncios}
          studentId={data.currentStudent.id}
        />

        <AttendanceWidget attendancePercentage={attendancePercentage} />

        <PsychopedagogicalWidget
          fichas={fichas}
          studentId={data.currentStudent.id}
        />
      </div>
    </div>
  );
}
