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
    <div className="flex flex-col gap-4">
      <QuickSummaryHero
        studentName={currentStudent?.name || "Estudiante"}
        asistenciaHoy={asistenciaHoy}
        payments={payments}
      />
      <div className="grid gap-4 @3xl:grid-cols-3">
        <div className="@3xl:col-span-2">
          <Card className="h-full min-h-[400px] rounded-2xl border-border/50 bg-card/80 p-6 shadow-sm">
            <div className="h-full w-full">
              <AcademicProgressChart data={chartData} />
            </div>
          </Card>
        </div>
        <div className="@3xl:col-span-1">
          <FinancialStatus payments={payments} />
        </div>
      </div>

      <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3">
        <AttendanceWidget attendancePercentage={attendancePercentage} />

        {/* Psychopedagogical Widget */}
        <PsychopedagogicalWidget
          fichas={fichas}
          studentId={data.currentStudent.id}
        />

        {/* School Announcements Widget */}
        <SchoolAnnouncementsWidget
          anuncios={anuncios}
          studentId={data.currentStudent.id}
        />
      </div>
    </div>
  );
}
