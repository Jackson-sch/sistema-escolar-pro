import { auth } from "@/auth";
import { PageHeader } from "@/components/common/page-header";
import {
  getDashboardStatsAction,
  getRecentAdmissionsAction,
} from "@/actions/dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { redirect } from "next/navigation";
import { getInstitucionAction } from "@/actions/institucion";
import {
  IconLayoutDashboard,
  IconUserPlus,
  IconCreditCard,
  IconSpeakerphone,
  IconBolt,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardTabsContainer } from "@/components/dashboard/tabs/dashboard-tabs-container";

function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-2 sm:flex sm:shrink-0 gap-2">
      <QuickAction
        href="/finanzas/caja"
        label="Caja POS"
        icon={IconBolt}
        iconColor="text-amber-500"
        variant="default"
      />
      <QuickAction
        href="/gestion/estudiantes"
        label="Matrícula"
        icon={IconUserPlus}
        iconColor="text-violet-500"
        variant="outline"
      />
      <QuickAction
        href="/finanzas"
        label="Cobranza"
        icon={IconCreditCard}
        iconColor="text-indigo-500"
        variant="outline"
      />
      <QuickAction
        href="/comunicaciones"
        label="Anuncio"
        icon={IconSpeakerphone}
        iconColor="text-rose-500"
        variant="outline"
      />
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
  iconColor,
  variant,
}: {
  href: string;
  label: string;
  icon: any;
  iconColor?: string;
  variant: "default" | "outline";
}) {
  return (
    <Button
      variant={variant}
      className={cn(
        "h-9 min-w-0 gap-2 rounded-xl px-3 text-xs font-semibold shadow-xs transition-transform hover:scale-102",
        variant === "outline" &&
          "border-border/60 bg-card/80 text-foreground hover:bg-accent",
      )}
      asChild
    >
      <Link href={href}>
        <Icon size={16} className={cn("shrink-0", iconColor)} />
        {label}
      </Link>
    </Button>
  );
}

async function renderTeacherDashboard() {
  const { getTeacherDashboardAction } = await import("@/actions/dashboard");
  const teacherData = await getTeacherDashboardAction({});

  return (
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-6 pt-0">
      {teacherData.success && <TeacherDashboard data={teacherData.success} />}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "profesor") {
    return renderTeacherDashboard();
  }

  const [statsRes, admissionsRes, institucionRes] = await Promise.all([
    getDashboardStatsAction({}),
    getRecentAdmissionsAction({}),
    getInstitucionAction(),
  ]);

  const stats = statsRes.success;
  const admissions = admissionsRes.success || [];
  const institucion = institucionRes.data;
  const nombreInst = institucion?.nombreInstitucion ?? "Sistema Escolar Pro";
  const cicloInst = institucion?.cicloEscolarActual ?? "2026";

  return (
    <div className="flex flex-1 flex-col gap-6 px-0 pb-6 sm:px-4 pt-0 animate-in fade-in duration-200">
      {/* Cabecera & Accesos Rápidos */}
      <div className="flex flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-2">
        <PageHeader
          icon={<IconLayoutDashboard className="size-5" />}
          title="Dashboard Institucional"
          description={`Panel de control directivo · ${nombreInst} · Periodo ${cicloInst}`}
        />
        <DashboardQuickActions />
      </div>

      {/* Pestañas con persistencia en URL (nuqs) */}
      <DashboardTabsContainer stats={stats} admissions={admissions} />
    </div>
  );
}
