import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLayoutUserAction } from "@/actions/auth";
import Link from "next/link";
import { 
  IconLayoutDashboard, 
  IconSchool, 
  IconUsers, 
  IconLogout,
  IconShieldCheck
} from "@tabler/icons-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

const ADMIN_MENU_ITEMS = [
  { title: "Dashboard", href: "/admin", icon: IconLayoutDashboard },
  { title: "Instituciones", href: "/admin/instituciones", icon: IconSchool },
  { title: "Administradores", href: "/admin/usuarios", icon: IconUsers },
];

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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Top Header */}
      <header className="h-16 border-b border-border/40 bg-background/95 sticky top-0 z-50 flex items-center justify-between px-6 transition duration-500 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <IconShieldCheck className="text-white size-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">SISTEMA ESCOLAR PRO</h1>
            <p className="text-xxs text-muted-foreground/60 uppercase font-black tracking-widest">Master Control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold">{user.name || 'Master Admin'}</span>
            <span className="text-xxs text-muted-foreground/80">{user.email}</span>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Nav */}
        <aside className="w-64 h-[calc(100vh-64px)] border-r border-border/40 sticky top-16 hidden lg:block p-5 space-y-3 bg-card/80 transition-[width,height] duration-500 animate-in fade-in slide-in-from-left-4">
          <div className="space-y-1">
            {ADMIN_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-300 group"
                >
                  <Icon className="size-5 group-hover:scale-110 transition-transform duration-300 text-muted-foreground group-hover:text-primary" />
                  <span className="text-sm font-semibold">{item.title}</span>
                </Link>
              )
            })}
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/40">
             <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground/75 hover:text-foreground hover:bg-muted/20 transition-colors duration-300"
              >
                <div className="size-5 flex items-center justify-center text-sm font-black">←</div>
                <span className="text-sm font-semibold">Volver al Portal</span>
             </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 animation-duration-">
          {children}
        </main>
      </div>
    </div>
  );
}
