import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLayoutUserAction } from "@/actions/auth";
import { IconShieldCheck } from "@tabler/icons-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userRes = await getLayoutUserAction(session.user.id);
  const user = userRes.success;

  if (user?.role !== "super_admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
            <IconShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-tight text-foreground">
                SISTEMA ESCOLAR PRO
              </h1>
              <Badge
                variant="outline"
                className="text-[9px] font-black uppercase tracking-widest px-2 py-0 border-primary/30 text-primary bg-primary/10"
              >
                Super Admin
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">
              Panel Maestro de Administración Multi-Sede
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-foreground">
              {user.name || "Master Admin"}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {user.email}
            </span>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Nav */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
