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
import { AIProactiveAlerts } from "@/components/dashboard/ai-proactive-alerts";
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
    <div className="flex flex-1 flex-col gap-6 px-0 pb-6 sm:px-4 pt-0">
      <div className="flex flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-2">
        <PageHeader
          icon={<IconLayoutDashboard className="size-5" />}
          title="Dashboard Institucional"
          description={`Panel de control · ${institucion?.nombreInstitucion ?? "Sistema Escolar Pro"} · Periodo ${institucion?.cicloEscolarActual ?? "2025"}`}
        />

        <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
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

      <div className="px-4 sm:px-2">
        <AIProactiveAlerts
          totalOverdue={stats?.totalOverdue || 0}
          lateTodayCount={stats?.attendanceToday?.late || 0}
          absentTodayCount={stats?.attendanceToday?.absent || 0}
          capacityPercentage={stats?.capacityStats?.percentage || 0}
        />
      </div>

      <section className="px-4 sm:px-2">
        <SectionCards stats={stats} />
      </section>

      <section className="grid gap-4 px-4 lg:grid-cols-12 sm:px-2">
        <div className="lg:col-span-4">
          <AttendanceTodayMonitor
            present={stats?.attendanceToday?.present || 0}
            absent={stats?.attendanceToday?.absent || 0}
            late={stats?.attendanceToday?.late || 0}
            total={stats?.attendanceToday?.total || 0}
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
            occupied={stats?.capacityStats?.occupied || 0}
            total={stats?.capacityStats?.total || 0}
            percentage={stats?.capacityStats?.percentage || 0}
          />
        </div>
      </section>

      <section className="grid min-h-[600px] gap-4 px-4 lg:grid-cols-12 sm:px-2">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <div>
            <ChartAreaInteractive data={stats?.chartData} />
          </div>

          <Card className="flex flex-1 flex-col overflow-hidden rounded-2xl border-border/50 bg-card/80 p-0 shadow-sm">
            <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/50 py-4 sm:flex-row sm:items-center">
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
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[390px]">
                <div className="p-4">
                  <AdmissionsTable students={admissions} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="min-h-[500px] lg:col-span-4">
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
        "h-9 min-w-0 gap-1.5 rounded-xl px-3 text-xs font-semibold shadow-xs",
        variant === "outline" &&
          "border-border/60 bg-card/80 text-foreground hover:bg-accent",
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
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h1>
        <p className="text-xxs font-medium text-muted-foreground sm:text-xs">
          {description}
        </p>
      </div>
    </div>
  );
}
