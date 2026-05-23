import { auth } from "@/auth";
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
import {
  getDashboardStatsAction,
  getRecentAdmissionsAction,
} from "@/actions/dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { redirect } from "next/navigation";
import { getInstitucionAction } from "@/actions/institucion";
import { CapacityGauge } from "@/components/dashboard/capacity-gauge";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { FinancialHealthCard } from "@/components/dashboard/financial-health-card";
import { AttendanceTodayMonitor } from "@/components/dashboard/attendance-today-monitor";
import {
  IconLayoutDashboard,
  IconUserPlus,
  IconCreditCard,
  IconSpeakerphone,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;

  // Teacher view (stays mostly same for now)
  if (userRole === "profesor") {
    const { getTeacherDashboardAction } = await import("@/actions/dashboard");
    const teacherData = await getTeacherDashboardAction({});

    return (
      <div className="flex flex-1 flex-col gap-6 p-0 sm:p-6 pt-0">
        {teacherData.success && <TeacherDashboard data={teacherData.success} />}
      </div>
    );
  }

  // Admin / Director / Administrativo view (ELITE)
  const [statsRes, admissionsRes, institucionRes] = await Promise.all([
    getDashboardStatsAction({}),
    getRecentAdmissionsAction({}),
    getInstitucionAction(),
  ]);

  const stats = statsRes.success;
  const admissions = admissionsRes.success || [];
  const institucion = institucionRes.data;

  return (
    <div className="flex flex-1 flex-col gap-8 p-0 sm:p-6 pt-0">
      {/* Header with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 sm:px-2">
        <PageHeader
          icon={<IconLayoutDashboard className="size-5" />}
          title="Dashboard Institucional"
          description={`Panel de control · ${institucion?.nombreInstitucion ?? "Sistema Escolar Pro"} · Periodo ${institucion?.cicloEscolarActual ?? "2025"}`}
        />

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1 px-1 -m-1 lg:m-0">
          <QuickAction
            href="/gestion/estudiantes"
            label="Matrícula"
            icon={IconUserPlus}
            variant="default"
          />
          <QuickAction
            href="/finanzas"
            label="Cobranza"
            icon={IconCreditCard}
            variant="outline"
          />
          <QuickAction
            href="/comunicaciones"
            label="Anuncio"
            icon={IconSpeakerphone}
            variant="outline"
          />
        </div>
      </div>

      {/* KPI Cards (Liquid Glass) */}
      <section>
        <SectionCards stats={stats} />
      </section>

      {/* Primary Insights: Monitors & Capacity */}
      <section className="grid gap-6 px-2 lg:grid-cols-12">
        <div className="lg:col-span-4 translate-y-0 transition-all hover:-translate-y-1">
          <AttendanceTodayMonitor
            present={stats?.attendanceToday?.present || 0}
            absent={stats?.attendanceToday?.absent || 0}
            late={stats?.attendanceToday?.late || 0}
            total={stats?.attendanceToday?.total || 0}
          />
        </div>
        <div className="lg:col-span-4 translate-y-0 transition-all hover:-translate-y-1">
          <FinancialHealthCard
            collected={stats?.totalRevenue || 0}
            overdue={stats?.totalOverdue || 0}
            pending={stats?.totalPending || 0}
          />
        </div>
        <div className="lg:col-span-4 translate-y-0 transition-all hover:-translate-y-1">
          <CapacityGauge
            occupied={stats?.capacityStats?.occupied || 0}
            total={stats?.capacityStats?.total || 0}
            percentage={stats?.capacityStats?.percentage || 0}
          />
        </div>
      </section>

      {/* Main Grid: Bento Style */}
      <section className="grid gap-6 px-2 lg:grid-cols-12 min-h-[600px]">
        {/* Left Column: Trend + Admissions */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="transition-all hover:-translate-y-1 duration-300">
            <ChartAreaInteractive data={stats?.chartData} />
          </div>

          <Card className="liquid-glass border-none flex-1 p-0">
            <CardHeader className="border-b border-white/5 py-3 flex flex-col md:flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">
                  Admisiones Recientes
                </CardTitle>
                <CardDescription>
                  Últimos estudiantes registrados
                </CardDescription>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary font-bold gap-1 group"
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
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[430px]">
                <div className="p-4">
                  <AdmissionsTable students={admissions} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Activity (Spans whole height) */}
        <div className="lg:col-span-4 h-full min-h-[500px]">
          <RecentActivity
            activities={(stats?.recentActivity || []) as any}
            className="h-full"
          />
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
  variant,
}: {
  href: string;
  label: string;
  icon: any;
  variant: "default" | "outline";
}) {
  return (
    <Button
      variant={variant}
      className={cn(
        "rounded-2xl gap-2 font-bold px-5 py-6 h-auto transition-all hover:scale-105 active:scale-95",
        variant === "outline" &&
          "border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary",
      )}
      asChild
    >
      <Link href={href}>
        <Icon size={18} />
        {label}
      </Link>
    </Button>
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
      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
        {icon}
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl drop-shadow-sm">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground font-medium sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
