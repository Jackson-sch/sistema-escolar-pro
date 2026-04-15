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

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Verificar autenticación
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verificar rol y obtener datos del usuario
  const userRes = await getLayoutUserAction(session.user.id);
  const user = userRes.success;

  // Verificar si debe cambiar contraseña (para todos los roles)
  if (user?.mustChangePassword) {
    redirect("/cambiar-password");
  }

  if (user?.role === "padre") {
    // Si es padre, debe ir al portal
    redirect("/portal");
  }

  // Obtener conteo de comprobantes pendientes y datos generales
  const [pendingRes, stats, financeStats, institucionRes] = await Promise.all([
    getPendingComprobantesCountAction(session.user.institucionId || undefined),
    getDashboardStatsAction({}),
    getEstadisticasCobranzaAction({}),
    getInstitucionByIdAction(session.user.institucionId || undefined),
  ]);

  const pendingComprobantes = pendingRes.success ?? 0;
  const institucionData = institucionRes.data;

  const contextData = {
    estadisticasGenerales: stats.success,
    resumenFinanciero: financeStats.success,
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="[--header-height:calc(var(--spacing)*14)] min-h-screen flex flex-col">
      <SidebarProvider>
        <CommandPalette />
        <AppSidebar
          userRole={user?.role}
          userName={user?.name || session.user.name || undefined}
          userEmail={user?.email || session.user.email || undefined}
          userApellidoMaterno={
            user?.apellidoMaterno || session.user.apellidoMaterno || undefined
          }
          userApellidoPaterno={
            user?.apellidoPaterno || session.user.apellidoPaterno || undefined
          }
          pendingComprobantes={pendingComprobantes}
          institucionName={institucionData?.nombreInstitucion}
          institucionLogo={institucionData?.logo}
        />
        <SidebarInset className="flex flex-col min-h-screen">
          <SiteHeader
            anioAcademico={institucionData?.cicloEscolarActual || 2025}
            institucionName={institucionData?.nombreInstitucion}
          />
          <main className="flex flex-1 flex-col gap-4 p-2 relative w-full overflow-x-hidden">
            <div className="flex-1 w-full">{children}</div>
            <DirectivoChat context={contextData} />
            <SiteFooter />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
