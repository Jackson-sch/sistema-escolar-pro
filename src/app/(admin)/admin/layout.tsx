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

  const menuItems = [
    { title: "Dashboard", href: "/admin", icon: IconLayoutDashboard },
    { title: "Instituciones", href: "/admin/instituciones", icon: IconSchool },
    { title: "Administradores", href: "/admin/usuarios", icon: IconUsers },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <IconShieldCheck className="text-white size-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">SISTEMA ESCOLAR PRO</h1>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Master Control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-medium">{user.name || 'Master Admin'}</span>
            <span className="text-[10px] text-zinc-500">{user.email}</span>
          </div>
          <div className="size-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center">
             <IconLogout className="size-4 text-zinc-400" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Nav */}
        <aside className="w-64 h-[calc(100vh-64px)] border-r border-white/5 sticky top-16 hidden lg:block p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
              >
                <Icon className="size-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            )
          })}
          
          <div className="mt-8 pt-8 border-t border-white/5">
             <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-300 transition-all"
              >
                <div className="size-5 flex items-center justify-center">←</div>
                <span className="text-sm font-medium">Volver al Portal</span>
              </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
