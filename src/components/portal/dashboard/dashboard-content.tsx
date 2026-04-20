"use client";

import { Card } from "@/components/ui/card";
import { AcademicProgressChart } from "@/components/portal/academic/academic-progress-chart";
import { FinancialStatus } from "@/components/portal/finance/financial-status";
import { useComponentShortcuts } from "@/hooks/use-component-shortcuts";
import AttendanceWidget from "@/components/portal/dashboard/attendance-widget";
import PsychopedagogicalWidget from "@/components/portal/dashboard/psychopedagogical-widget";
import SchoolAnnouncementsWidget from "@/components/portal/dashboard/school-announcements-widget";

interface DashboardContentProps {
  data: any;
}

export function DashboardContent({ data }: DashboardContentProps) {
  const { stats } = data;
  const { payments, attendancePercentage, chartData, fichas, anuncios } = stats;

  useComponentShortcuts({
    onSearch: () => {
      // El CommandPalette ya escucha Ctrl+K globalmente,
      // pero esto asegura que el dashboard también responda si fuera necesario
      // o para estandarizar el uso del hook.
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Academic Progress & Financial Status */}
      <div className="grid gap-6 @3xl:grid-cols-3">
        <div className="@3xl:col-span-2">
          <Card className="p-6 h-full min-h-[400px] liquid-glass relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <div className="relative z-10 w-full h-full">
              <AcademicProgressChart data={chartData} />
            </div>
          </Card>
        </div>
        <div className="@3xl:col-span-1">
          <FinancialStatus payments={payments} />
        </div>
      </div>

      {/* Row 2: Attendance, Psychopedagogical, School Announcements */}
      <div className="grid gap-6 @md:grid-cols-2 @3xl:grid-cols-3">
        {/* Attendance Widget */}
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
