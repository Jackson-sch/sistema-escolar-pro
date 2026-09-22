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
  IconBuildingStore,
  IconUserCircle,
} from "@tabler/icons-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import { SidebarCalendarCard } from "@/components/layout/sidebar-calendar-card";
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

// Menú para administradores y equipo directivo / secretaría / tesorería (Job-to-be-Done)
const adminNavItems = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: IconDashboard,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    title: "Matrícula",
    url: "/gestion/matriculas",
    icon: IconId,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    items: [
      { title: "Padrón de Matrículas", url: "/gestion/matriculas" },
      { title: "Admisiones (CRM)", url: "/gestion/admisiones" },
      { title: "Cierre y Promociones", url: "/gestion/academico/promociones" },
    ],
  },
  {
    title: "Académico",
    url: "/gestion/academico/estructura",
    icon: IconSchool,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    items: [
      { title: "Secciones y Horarios", url: "/gestion/academico/estructura" },
      { title: "Evaluaciones & CNEB", url: "/evaluaciones" },
      { title: "Validador SIAGIE", url: "/gestion/academico/siagie" },
      { title: "Control de Asistencia", url: "/asistencia" },
    ],
  },
  {
    title: "Personas",
    url: "/gestion/estudiantes",
    icon: IconUsers,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    items: [
      { title: "Estudiantes & Familias", url: "/gestion/estudiantes" },
      { title: "Personal & Docentes", url: "/gestion/personal" },
    ],
  },
  {
    title: "Tesorería",
    url: "/finanzas",
    icon: IconCreditCard,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    items: [
      { title: "Caja Rápida (POS)", url: "/finanzas/caja" },
      { title: "Cronogramas y Deudas", url: "/finanzas" },
      { title: "Verificar Pagos", url: "/finanzas/verificacion" },
      { title: "Tienda Escolar", url: "/uniformes" },
    ],
  },
  {
    title: "Comunidad",
    url: "/comunicaciones",
    icon: IconMessage2,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    items: [
      { title: "Centro de Anuncios", url: "/comunicaciones" },
      { title: "Centro de Alertas (WhatsApp)", url: "/gestion/comunicaciones" },
    ],
  },
  {
    title: "Configuración",
    url: "/configuracion/institucion",
    icon: IconSettings,
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-500/10 border-slate-500/20",
    items: [
      { title: "Datos de la I.E.", url: "/configuracion/institucion" },
      { title: "Roles & Permisos", url: "/configuracion/permisos" },
      { title: "Bitácora de Auditoría", url: "/configuracion/auditoria" },
      { title: "Estado del Sistema", url: "/configuracion/estado" },
    ],
  },
];

// Menú para padres/apoderados
const padreNavItems = [
  {
    title: "Inicio",
    url: "/portal",
    icon: IconHome,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    title: "Comunicaciones",
    url: "/portal/comunicaciones",
    icon: IconMessage2,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    title: "Deudas Pendientes",
    url: "/portal/deudas",
    icon: IconReceipt,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "Asistencia Diaria",
    url: "/portal/asistencia",
    icon: IconCalendarCheck,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Horario de Clases",
    url: "/portal/horario",
    icon: IconClock,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    title: "Mis Boletas",
    url: "/portal/boletas",
    icon: IconFileDownload,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    title: "Notas Académicas",
    url: "/portal/notas",
    icon: IconChartBar,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Conducta y Seguimiento",
    url: "/portal/disciplina",
    icon: IconHeartHandshake,
    iconColor: "text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    title: "Tienda Escolar",
    url: "/portal/uniformes",
    icon: IconBuildingStore,
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    iconBg: "bg-fuchsia-500/10 border-fuchsia-500/20",
  },
];

// Menú operativo diario para docentes (Job-to-be-Done)
const profesorNavItems = [
  {
    title: "Agenda de Hoy",
    url: "/dashboard",
    icon: IconDashboard,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    title: "Pasar Asistencia",
    url: "/asistencia",
    icon: IconCalendarCheck,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Registro de Notas",
    url: "/evaluaciones",
    icon: IconClipboardCheck,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    title: "Mis Secciones & Alumnos",
    url: "/gestion/estudiantes",
    icon: IconUsers,
    iconColor: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500/10 border-teal-500/20",
  },
  {
    title: "Avisos & Comunicados",
    url: "/comunicaciones",
    icon: IconMessage2,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
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

function getNavItemsByRole(userRole: string, pendingComprobantes: number) {
  if (userRole === "padre") return padreNavItems;
  if (userRole === "profesor") return profesorNavItems;
  return adminNavItems.map((item) => {
    if (item.title === "Tesorería" && item.items) {
      return {
        ...item,
        items: item.items.map((subItem) =>
          subItem.url === "/finanzas/verificacion"
            ? { ...subItem, badge: pendingComprobantes }
            : subItem
        ),
      };
    }
    return item;
  });
}

function buildUserData(
  userName?: string,
  userApellidoPaterno?: string,
  userApellidoMaterno?: string,
  userEmail?: string
) {
  return {
    name: userName || "Usuario",
    apellidoPaterno: userApellidoPaterno || "",
    apellidoMaterno: userApellidoMaterno || "",
    email: userEmail || "",
    avatar: "/avatars/admin.jpg",
  };
}

function SidebarBrandHeader({
  homeUrl,
  isPadre,
  portalTitle,
  institucionLogo,
  institucionName,
}: {
  homeUrl: string;
  isPadre: boolean;
  portalTitle: string;
  institucionLogo?: string | null;
  institucionName?: string;
}) {
  const subtitle = isPadre
    ? "Área de Familias"
    : institucionName
      ? "Sistema Escolar"
      : "Plataforma Educativa";

  return (
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
                <span className="truncate text-[11px] text-muted-foreground">{subtitle}</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
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
    ? "Portal Familias"
    : institucionName || "Sistema Escolar Pro";

  const navItems = getNavItemsByRole(userRole, pendingComprobantes);
  const userData = buildUserData(userName, userApellidoPaterno, userApellidoMaterno, userEmail);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarBrandHeader
        homeUrl={homeUrl}
        isPadre={isPadre}
        portalTitle={portalTitle}
        institucionLogo={institucionLogo}
        institucionName={institucionName}
      />
      <SidebarContent className="flex flex-col justify-between overflow-x-hidden">
        <NavMain items={navItems} />
        <SidebarCalendarCard />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
