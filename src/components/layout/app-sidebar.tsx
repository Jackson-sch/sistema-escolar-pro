"use client";

import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconSchool,
  IconBook,
  IconCreditCard,
  IconSettings,
  IconUsersGroup,
  IconClock,
  IconHierarchy,
  IconClipboardCheck,
  IconMessage2,
  IconUserPlus,
  IconId,
  IconCalendarCheck,
  IconHome,
  IconReceipt,
  IconUpload,
  IconFileDownload,
  IconChartBar,
  IconHeartHandshake,
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
    url: "/gestion/academico/carga-horaria",
    icon: IconSchool,
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
  },
  {
    title: "Configuración",
    url: "/configuracion/institucion",
    icon: IconSettings,
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
    title: "Subir Comprobante",
    url: "/portal/comprobantes/nuevo",
    icon: IconUpload,
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
}

export function AppSidebar({
  userRole = "administrativo",
  userName,
  userApellidoPaterno,
  userApellidoMaterno,
  userEmail,
  pendingComprobantes = 0,
  ...props
}: AppSidebarProps) {
  const isPadre = userRole === "padre";
  const homeUrl = isPadre ? "/portal" : "/dashboard";
  const portalTitle = isPadre ? "Portal Padres" : "EduPeru Pro";

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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconSchool className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-primary">
                    {portalTitle}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {isPadre ? "Área de Padres" : "Sistema Escolar"}
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
