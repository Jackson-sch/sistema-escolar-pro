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
import { PortalMobileNav } from "@/components/portal/layout/portal-mobile-nav";

function validatePortalAuth(session: any, user: any) {
  if (!session?.user?.id) {
    redirect("/login");
  }

  const allowedRoles = ["padre", "profesor"];
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  if (user?.mustChangePassword) {
    redirect("/cambiar-password");
  }
}

function resolveUserProfile(user: any, sessionUser: any) {
  const role = (user?.role || sessionUser?.role || "padre") as "padre" | "profesor";
  return {
    role,
    name: user?.name || sessionUser?.name || undefined,
    email: user?.email || sessionUser?.email || undefined,
    apellidoPaterno: user?.apellidoPaterno || sessionUser?.apellidoPaterno || undefined,
    apellidoMaterno: user?.apellidoMaterno || sessionUser?.apellidoMaterno || undefined,
  };
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userRes = await getParentUserAction({});
  const user = userRes.success;

  validatePortalAuth(session, user);

  const institucionRes = await getInstitucionByIdAction(
    session?.user?.institucionId || undefined,
  );
  const institucionData = institucionRes.data;
  const profile = resolveUserProfile(user, session?.user);
  const headerTitle =
    profile.role === "profesor" ? "Portal Docente" : "Portal Padres";

  return (
    <div className="[--header-height:calc(var(--spacing)*14)] min-h-screen">
      <SidebarProvider>
        <CommandPalette userRole={profile.role} />
        <OnboardingTourDialog userRole={profile.role} />
        <AppSidebar
          userRole={profile.role}
          userName={profile.name}
          userEmail={profile.email}
          userApellidoPaterno={profile.apellidoPaterno}
          userApellidoMaterno={profile.apellidoMaterno}
          institucionName={institucionData?.nombreInstitucion}
          institucionLogo={institucionData?.logo}
        />
        <SidebarInset className="flex min-h-screen flex-col">
          <SiteHeader institucionName={headerTitle} />
          <main className="relative flex flex-1 flex-col gap-4 overflow-x-hidden p-2 pb-16 sm:pb-2">
            <div className="flex-1 w-full">{children}</div>
            <SiteFooter />
          </main>
          <PortalMobileNav />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
