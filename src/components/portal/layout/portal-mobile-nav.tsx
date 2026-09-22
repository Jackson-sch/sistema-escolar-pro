"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconCalendarCheck,
  IconChartBar,
  IconReceipt,
  IconMessage2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Inicio", href: "/portal", icon: IconHome },
  { label: "Asistencia", href: "/portal/asistencia", icon: IconCalendarCheck },
  { label: "Notas", href: "/portal/notas", icon: IconChartBar },
  { label: "Pensiones", href: "/portal/deudas", icon: IconReceipt },
  { label: "Avisos", href: "/portal/comunicaciones", icon: IconMessage2 },
];

export function PortalMobileNav() {
  const pathname = usePathname();

  // Solo mostrar en rutas bajo /portal
  if (!pathname.startsWith("/portal")) return null;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/60 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/portal"
            ? pathname === "/portal"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all text-[10px] font-bold gap-0.5",
              isActive
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-5 transition-transform",
                isActive && "scale-110 text-primary",
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
