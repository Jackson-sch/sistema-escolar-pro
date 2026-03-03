import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getInstitucionByIdAction } from "@/actions/institucion";
import { SiteFooter } from "@/components/layout/site-footer";
import { getParentUserAction } from "@/actions/portal";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Verificar que el usuario está autenticado
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verificar si debe cambiar la contraseña
  const userRes = await getParentUserAction(session.user.id);
  const user = userRes.data;

  if (user?.mustChangePassword) {
    redirect("/cambiar-password");
  }

  const institucionRes = await getInstitucionByIdAction(
    session.user.institucionId || undefined,
  );
  const institucionData = institucionRes.success;

  return (
    <div className="[--header-height:calc(var(--spacing)*14)]">
      <SidebarProvider>
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
        <SidebarInset>
          <SiteHeader institucionName="Portal Padres" />
          <main className="flex flex-1 flex-col gap-4 p-4 relative ">
            <div className="flex-1 w-full">{children}</div>
            <SiteFooter />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
