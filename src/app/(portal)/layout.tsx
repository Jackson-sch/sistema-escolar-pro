import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getInstitucionByIdAction } from "@/actions/institucion";
import { SiteFooter } from "@/components/layout/site-footer";
import { getParentUserAction } from "@/actions/portal";
import { CommandPalette } from "@/components/common/command-palette";
import { OnboardingTourDialog } from "@/components/common/onboarding-tour-dialog";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Verificar que el usuario está autenticado y tiene un rol permitido (padre o profesor)
  if (!session?.user?.id) {
    redirect("/login");
  }

  const allowedRoles = ["padre", "profesor"];
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  // Verificar si debe cambiar la contraseña
  const userRes = await getParentUserAction({});
  const user = userRes.success;

  if (user?.mustChangePassword) {
    redirect("/cambiar-password");
  }

  const institucionRes = await getInstitucionByIdAction(
    session.user.institucionId || undefined,
  );
  const institucionData = institucionRes.data;

  const headerTitle =
    user?.role === "profesor" ? "Portal Docente" : "Portal Padres";

  return (
    <div className="[--header-height:calc(var(--spacing)*14)] min-h-screen">
      <SidebarProvider>
        <CommandPalette />
        <OnboardingTourDialog userRole={user?.role || "padre"} />
        <AppSidebar
          userRole={user?.role || "padre"}
          userName={user?.name || session.user.name || undefined}
          userEmail={user?.email || session.user.email || undefined}
          userApellidoPaterno={
            user?.apellidoPaterno || session.user.apellidoPaterno || undefined
          }
          userApellidoMaterno={
            user?.apellidoMaterno || session.user.apellidoMaterno || undefined
          }
          institucionName={institucionData?.nombreInstitucion}
          institucionLogo={institucionData?.logo}
        />
        <SidebarInset className="flex min-h-screen flex-col">
          <SiteHeader institucionName={headerTitle} />
          <main className="relative flex flex-1 flex-col gap-4 overflow-x-hidden p-2">
            <div className="flex-1 w-full">{children}</div>
            <SiteFooter />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
