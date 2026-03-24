import { auth } from "@/auth";
import { SectionCards } from "@/components/common/section-cards";
import { ChartAreaInteractive } from "@/components/common/chart-area-interactive";
import { AdmissionsTable } from "@/components/dashboard/admissions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardStatsAction,
  getRecentAdmissionsAction,
} from "@/actions/dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { redirect } from "next/navigation";
import { getInstitucionAction } from "@/actions/institucion";
import { CapacityGauge } from "@/components/dashboard/capacity-gauge";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { IconLayoutDashboard } from "@tabler/icons-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;

  // Teacher view
  if (userRole === "profesor") {
    const { getTeacherDashboardAction } = await import("@/actions/dashboard");
    const teacherData = await getTeacherDashboardAction({});

    return (
      <div className="flex flex-1 flex-col gap-6 p-0 sm:p-6 pt-0">
        <PageHeader
          icon={<IconLayoutDashboard className="size-5" />}
          title="Panel del Docente"
          description={`Bienvenido, ${session.user.name}. Aquí tienes un resumen de tus cursos y alumnos.`}
        />
        {teacherData.success && <TeacherDashboard data={teacherData.success} />}
      </div>
    );
  }

  // Admin / Director / Administrativo view
  const [statsRes, admissionsRes, institucionRes] = await Promise.all([
    getDashboardStatsAction({}),
    getRecentAdmissionsAction({}),
    getInstitucionAction(),
  ]);

  const stats = statsRes.success;
  const admissions = admissionsRes.success || [];
  const institucion = institucionRes.data || [];

  return (
    <div className="flex flex-1 flex-col gap-8 p-0 sm:p-6 pt-0">
      {/* Header */}
      <PageHeader
        icon={<IconLayoutDashboard className="size-5" />}
        title="Dashboard Institucional"
        description={`Panel de control · ${institucion?.nombreInstitucion ?? ""} · Periodo ${institucion?.cicloEscolarActual ?? ""}`}
      />

      {/* KPI Cards */}
      <section>
        <SectionCards stats={stats} />
      </section>

      {/* Row 1: Chart + Capacity */}
      <section className="grid gap-6 px-2 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ChartAreaInteractive data={stats?.chartData} />
        </div>
        <div className="lg:col-span-4">
          <CapacityGauge
            occupied={stats?.capacityStats?.occupied || 0}
            total={stats?.capacityStats?.total || 0}
            percentage={stats?.capacityStats?.percentage || 0}
          />
        </div>
      </section>

      {/* Row 2: Activity + Admissions */}
      <section className="grid gap-6 px-2 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentActivity activities={stats?.recentActivity || []} />
        </div>
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                Admisiones Recientes
              </CardTitle>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {admissions.length} registros
              </span>
            </CardHeader>
            <CardContent className="flex-1 pt-4 px-4">
              <AdmissionsTable students={admissions} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 sm:px-2">
      <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
      </div>
    </div>
  );
}