"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconSchool,
  IconUsers,
  IconArrowLeft,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ITEMS = [
  {
    title: "Panel Principal",
    href: "/admin",
    icon: IconLayoutDashboard,
    badge: "Global",
  },
  {
    title: "Instituciones",
    href: "/admin/instituciones",
    icon: IconSchool,
  },
  {
    title: "Administradores",
    href: "/admin/usuarios",
    icon: IconUsers,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-[calc(100vh-64px)] border-r border-border/60 sticky top-16 hidden lg:flex flex-col justify-between p-4 bg-card/50 backdrop-blur-md">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
            Navegación Maestro
          </p>
          <nav className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "size-4.5 transition-transform duration-200 group-hover:scale-110",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary",
                      )}
                    />
                    <span>{item.title}</span>
                  </div>

                  {item.badge && !isActive && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer del Sidebar */}
      <div className="pt-4 border-t border-border/40 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-200 group"
        >
          <IconArrowLeft className="size-4 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Portal Escolar</span>
        </Link>
      </div>
    </aside>
  );
}
