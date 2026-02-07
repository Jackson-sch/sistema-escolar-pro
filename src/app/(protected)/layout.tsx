import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { DirectivoChat } from "@/components/chat/directivo-chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDashboardStatsAction } from "@/actions/dashboard";
import { getEstadisticasCobranzaAction } from "@/actions/finance";
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
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      mustChangePassword: true,
      name: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      email: true,
    },
  });

  if (user?.role === "padre") {
    // Si es padre, debe ir al portal
    if (user.mustChangePassword) {
      redirect("/cambiar-password");
    }
    redirect("/portal");
  }

  // Obtener conteo de comprobantes pendientes filtrado por institución
  const pendingComprobantes = await prisma.comprobantePago.count({
    where: {
      estado: "PENDIENTE",
      cronograma: {
        estudiante: {
          institucionId: session.user.institucionId || undefined,
        },
      },
    },
  });

  const [stats, financeStats, institucion] = await Promise.all([
    getDashboardStatsAction({}),
    getEstadisticasCobranzaAction({}),
    prisma.institucionEducativa.findFirst({
      where: { id: session.user.institucionId || undefined },
      select: { cicloEscolarActual: true },
    }),
  ]);

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
        />
        <SidebarInset className="flex flex-col min-h-screen">
          <SiteHeader anioAcademico={institucion?.cicloEscolarActual || 2025} />
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
