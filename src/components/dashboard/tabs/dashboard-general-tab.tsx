"use client";

import { SectionCards } from "@/components/common/section-cards";
import { ChartAreaInteractive } from "@/components/common/chart-area-interactive";
import { AdmissionsTable } from "@/components/dashboard/admissions-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CapacityGauge } from "@/components/dashboard/capacity-gauge";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { FinancialHealthCard } from "@/components/dashboard/financial-health-card";
import { AttendanceTodayMonitor } from "@/components/dashboard/attendance-today-monitor";
import { AIProactiveAlerts } from "@/components/dashboard/ai-proactive-alerts";
import { UpcomingEventsCard } from "./upcoming-events-card";
import { Button } from "@/components/ui/button";
import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";

interface DashboardGeneralTabProps {
  stats: any;
  admissions: any[];
}

function RecentAdmissionsCard({ admissions }: { admissions: any[] }) {
  return (
    <Card className="flex flex-1 flex-col overflow-hidden rounded-2xl border-border/50 bg-card/80 p-0 shadow-sm">
      <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/50 py-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">
            Admisiones Recientes
          </CardTitle>
          <CardDescription>
            Últimos estudiantes registrados en la institución
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 font-semibold text-primary group"
          asChild
        >
          <Link href="/gestion/estudiantes">
            Ver todos{" "}
            <IconArrowUpRight
              size={14}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[390px]">
          <div className="p-4">
            <AdmissionsTable students={admissions} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function DashboardGeneralTab({
  stats,
  admissions,
}: DashboardGeneralTabProps) {
  const attendance = stats?.attendanceToday;
  const capacity = stats?.capacityStats;
  const upcomingEvents = stats?.upcomingEvents || [];

  return (
    <div className="space-y-6">
      {/* Alertas Inteligentes */}
      <AIProactiveAlerts
        totalOverdue={stats?.totalOverdue || 0}
        lateTodayCount={stats?.attendanceToday?.late || 0}
        absentTodayCount={stats?.attendanceToday?.absent || 0}
        capacityPercentage={stats?.capacityStats?.percentage || 0}
      />

      {/* Métricas Principales */}
      <SectionCards stats={stats} />

      {/* Monitores en Vivo (Asistencia, Finanzas, Vacantes) */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AttendanceTodayMonitor
            present={attendance?.present || 0}
            absent={attendance?.absent || 0}
            late={attendance?.late || 0}
            total={attendance?.total || 0}
          />
        </div>
        <div className="lg:col-span-4">
          <FinancialHealthCard
            collected={stats?.totalRevenue || 0}
            overdue={stats?.totalOverdue || 0}
            pending={stats?.totalPending || 0}
          />
        </div>
        <div className="lg:col-span-4">
          <CapacityGauge
            occupied={capacity?.occupied || 0}
            total={capacity?.total || 0}
            percentage={capacity?.percentage || 0}
          />
        </div>
      </div>

      {/* Gráfico y Actividad / Agenda */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <ChartAreaInteractive data={stats?.chartData} />
          <RecentAdmissionsCard admissions={admissions} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <UpcomingEventsCard events={upcomingEvents} />
          <RecentActivity
            activities={(stats?.recentActivity || []) as any}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
