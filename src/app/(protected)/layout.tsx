import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { DirectivoChat } from "@/components/chat/directivo-chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDashboardStatsAction } from "@/actions/dashboard";
import { getEstadisticasCobranzaAction } from "@/actions/finance";
import { getInstitucionByIdAction } from "@/actions/institucion";
import { getLayoutUserAction, getPendingComprobantesCountAction } from "@/actions/auth";
import { CommandPalette } from "@/components/common/command-palette";
import { SiteFooter } from "@/components/layout/site-footer";
import { OnboardingTourDialog } from "@/components/common/onboarding-tour-dialog";

export const dynamic = "force-dynamic";

function validateProtectedUser(session: any, user: any) {
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (user?.mustChangePassword) {
    redirect("/cambiar-password");
  }

  if (user?.role === "super_admin") {
    redirect("/admin");
  }

  if (user?.role === "padre") {
    redirect("/portal");
  }

  if (user?.role === "administrativo" && !user?.institucionId) {
    redirect("/onboarding/institucion");
  }
}

function resolveProtectedProfile(user: any, sessionUser: any) {
  return {
    role: user?.role,
    name: user?.name || sessionUser?.name || undefined,
    email: user?.email || sessionUser?.email || undefined,
    apellidoPaterno: user?.apellidoPaterno || sessionUser?.apellidoPaterno || undefined,
    apellidoMaterno: user?.apellidoMaterno || sessionUser?.apellidoMaterno || undefined,
  };
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userRes = await getLayoutUserAction(session?.user?.id || "");
  const user = userRes.success;

  validateProtectedUser(session, user);

  const [pendingRes, stats, financeStats, institucionRes] = await Promise.all([
    getPendingComprobantesCountAction(session?.user?.institucionId || undefined),
    getDashboardStatsAction({}),
    getEstadisticasCobranzaAction({}),
    getInstitucionByIdAction(session?.user?.institucionId || undefined),
  ]);

  const pendingComprobantes = pendingRes.success ?? 0;
  const institucionData = institucionRes.data;
  const profile = resolveProtectedProfile(user, session?.user);

  const contextData = {
    estadisticasGenerales: stats.success,
    resumenFinanciero: financeStats.success,
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="[--header-height:calc(var(--spacing)*14)] min-h-screen flex flex-col">
      <SidebarProvider>
        <CommandPalette userRole={profile.role as "administrativo" | "profesor" | undefined} />
        <OnboardingTourDialog userRole={profile.role} />
        <AppSidebar
          userRole={profile.role}
          userName={profile.name}
          userEmail={profile.email}
          userApellidoMaterno={profile.apellidoMaterno}
          userApellidoPaterno={profile.apellidoPaterno}
          pendingComprobantes={pendingComprobantes}
          institucionName={institucionData?.nombreInstitucion}
          institucionLogo={institucionData?.logo}
        />
        <SidebarInset className="flex flex-col min-h-screen min-w-0">
          <SiteHeader
            anioAcademico={institucionData?.cicloEscolarActual || 2025}
            institucionName={institucionData?.nombreInstitucion}
          />
          <main className="flex flex-1 flex-col gap-4 p-2 relative w-full min-w-0 overflow-x-hidden">
            <div className="flex-1 w-full min-w-0">{children}</div>
            <DirectivoChat context={contextData} />
            <SiteFooter />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
