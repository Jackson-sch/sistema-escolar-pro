"use client";

import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconSchool,
  IconCreditCard,
  IconSettings,
  IconUsersGroup,
  IconClock,
  IconClipboardCheck,
  IconMessage2,
  IconUserPlus,
  IconId,
  IconCalendarCheck,
  IconHome,
  IconReceipt,
  IconFileDownload,
  IconChartBar,
  IconHeartHandshake,
  IconShirt,
  IconUserCircle,
} from "@tabler/icons-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { BrandIcon } from "@/components/common/brand-logo";

// Menú para administradores/docentes
const adminNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Admisiones (CRM)",
    url: "/gestion/admisiones",
    icon: IconUserPlus,
  },
  {
    title: "Matrículas",
    url: "/gestion/matriculas",
    icon: IconId,
  },
  {
    title: "Estudiantes",
    url: "/gestion/estudiantes",
    icon: IconUsers,
  },
  {
    title: "Gestión Académica",
    url: "/gestion/academico/estructura",
    icon: IconSchool,
    items: [
      { title: "Estructura Base", url: "/gestion/academico/estructura" },
      { title: "Cierre y Promociones", url: "/gestion/academico/promociones" },
    ],
  },
  {
    title: "Personal",
    url: "/gestion/personal",
    icon: IconUsersGroup,
  },
  {
    title: "Finanzas",
    url: "/finanzas",
    icon: IconCreditCard,
    items: [
      { title: "Cronogramas", url: "/finanzas" },
      { title: "Verificar Pagos", url: "/finanzas/verificacion" },
    ],
  },
  {
    title: "Asistencia",
    url: "/asistencia",
    icon: IconCalendarCheck,
  },
  {
    title: "Evaluaciones",
    url: "/evaluaciones",
    icon: IconClipboardCheck,
  },
  {
    title: "Comunicaciones",
    url: "/comunicaciones",
    icon: IconMessage2,
    items: [
      { title: "Centro de Anuncios", url: "/comunicaciones" },
      { title: "Bandeja de Envíos", url: "/gestion/comunicaciones" },
      { title: "Logs de Auditoría", url: "/gestion/comunicaciones/logs" },
    ],
  },
  {
    title: "Uniformes",
    url: "/uniformes",
    icon: IconShirt,
  },
  {
    title: "Configuración",
    url: "/configuracion/institucion",
    icon: IconSettings,
    items: [
      { title: "Institución & Variables", url: "/configuracion/institucion" },
      { title: "Bitácora de Auditoría", url: "/configuracion/auditoria" },
      { title: "Estado & Diagnóstico", url: "/configuracion/estado" },
    ],
  },
];

// Menú para padres/apoderados
const padreNavItems = [
  {
    title: "Inicio",
    url: "/portal",
    icon: IconHome,
  },
  {
    title: "Comunicaciones",
    url: "/portal/comunicaciones",
    icon: IconMessage2,
  },
  {
    title: "Deudas Pendientes",
    url: "/portal/deudas",
    icon: IconReceipt,
  },
  {
    title: "Asistencia Diaria",
    url: "/portal/asistencia",
    icon: IconCalendarCheck,
  },
  {
    title: "Horario de Clases",
    url: "/portal/horario",
    icon: IconClock,
  },
  {
    title: "Mis Boletas",
    url: "/portal/boletas",
    icon: IconFileDownload,
  },
  {
    title: "Notas Académicas",
    url: "/portal/notas",
    icon: IconChartBar,
  },
  {
    title: "Conducta y Seguimiento",
    url: "/portal/disciplina",
    icon: IconHeartHandshake,
  },
  {
    title: "Tienda de Uniformes",
    url: "/portal/uniformes",
    icon: IconShirt,
  },
];

// Menú para docentes
const profesorNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Estudiantes",
    url: "/gestion/estudiantes",
    icon: IconUsers,
  },
  {
    title: "Asistencia",
    url: "/asistencia",
    icon: IconCalendarCheck,
  },
  {
    title: "Evaluaciones",
    url: "/evaluaciones",
    icon: IconClipboardCheck,
  },
  {
    title: "Comunicaciones",
    url: "/comunicaciones",
    icon: IconMessage2,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: string;
  userName?: string;
  userApellidoPaterno?: string;
  userApellidoMaterno?: string;
  userEmail?: string;
  pendingComprobantes?: number;
  institucionName?: string;
  institucionLogo?: string | null;
}

export function AppSidebar({
  userRole = "administrativo",
  userName,
  userApellidoPaterno,
  userApellidoMaterno,
  userEmail,
  pendingComprobantes = 0,
  institucionName,
  institucionLogo,
  ...props
}: AppSidebarProps) {
  const isPadre = userRole === "padre";
  const homeUrl = isPadre ? "/portal" : "/dashboard";
  const portalTitle = isPadre
    ? "Portal Padres"
    : institucionName || "EduNova Pro";

  // Actualizar el badge en Verificar Pagos si hay pendientes y filtrar por rol
  let navItems = isPadre ? padreNavItems : adminNavItems;

  if (userRole === "profesor") {
    navItems = profesorNavItems;
  } else if (!isPadre) {
    // Solo administradores ven badges de finanzas
    navItems = adminNavItems.map((item) => {
      if (item.title === "Finanzas" && item.items) {
        return {
          ...item,
          items: item.items.map((subItem) =>
            subItem.url === "/finanzas/verificacion"
              ? { ...subItem, badge: pendingComprobantes }
              : subItem,
          ),
        };
      }
      return item;
    });
  }

  const userData = {
    name: userName || "Usuario",
    apellidoPaterno: userApellidoPaterno || "",
    apellidoMaterno: userApellidoMaterno || "",
    email: userEmail || "",
    avatar: "/avatars/admin.jpg",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeUrl}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-950/40 text-primary overflow-hidden border border-indigo-500/20">
                  {!isPadre && institucionLogo ? (
                    <Image
                      src={institucionLogo}
                      alt={portalTitle}
                      width={32}
                      height={32}
                      className="size-full object-cover"
                    />
                  ) : (
                    <BrandIcon size={22} />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight text-foreground flex items-center gap-1.5">
                    {portalTitle}
                    {!institucionName && !isPadre && (
                      <span className="px-1 py-0.2 text-[9px] font-extrabold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded">
                        PRO
                      </span>
                    )}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {isPadre
                      ? "Área de Familias"
                      : institucionName
                        ? "Sistema Escolar"
                        : "Plataforma Educativa"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
