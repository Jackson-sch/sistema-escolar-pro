"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconReceipt,
  IconUpload,
  IconFileDownload,
  IconUser,
  IconLogout,
  IconSchool,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";

const navItems = [
  {
    title: "Dashboard",
    url: "/portal",
    icon: IconHome,
  },
  {
    title: "Deudas Pendientes",
    url: "/portal/deudas",
    icon: IconReceipt,
  },
  {
    title: "Subir Comprobante",
    url: "/portal/comprobantes/nuevo",
    icon: IconUpload,
  },
  {
    title: "Mis Boletas",
    url: "/portal/boletas",
    icon: IconFileDownload,
  },
];

interface PortalSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function PortalSidebar({ user }: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <IconSchool className="size-5 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm">Portal Padres</span>
            <span className="text-xs text-muted-foreground">
              Sistema Escolar
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Menú
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className="h-10 rounded-xl data-[active=true]:bg-primary data-[active=true]:text-white"
                >
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border-2 border-primary/20">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {user.name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="size-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group-data-[collapsible=icon]:hidden"
            title="Cerrar sesión"
          >
            <IconLogout className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
