import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Verificar que el usuario está autenticado
  if (!session?.user) {
    redirect("/login");
  }

  // Verificar si debe cambiar la contraseña
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      mustChangePassword: true,
      role: true,
      name: true,
      email: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
  });

  if (user?.mustChangePassword) {
    redirect("/cambiar-password");
  }

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
        />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 relative ">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
