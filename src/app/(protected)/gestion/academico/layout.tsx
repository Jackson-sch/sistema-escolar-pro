"use client";

import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBooks,
  IconLayoutGrid,
  IconSchool,
  IconClock,
  IconAward,
  IconRosette,
} from "@tabler/icons-react";

const ACADEMICO_TABS = [
  { label: "Estructura Académica", value: "/gestion/academico/estructura", icon: IconSchool },
  { label: "Malla Curricular", value: "/gestion/academico/areas", icon: IconBooks },
  { label: "Competencias CNEB", value: "/gestion/academico/competencias", icon: IconAward },
  { label: "Carga Académica", value: "/gestion/academico/carga-horaria", icon: IconLayoutGrid },
  { label: "Horarios", value: "/gestion/academico/horarios", icon: IconClock },
  { label: "Promociones y Cierre", value: "/gestion/academico/promociones", icon: IconRosette },
];

export default function AcademicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab =
    ACADEMICO_TABS.find((tab) => pathname.includes(tab.value))?.value || ACADEMICO_TABS[0].value;

  const tabsForAnimated = ACADEMICO_TABS.map(tab => ({
    id: tab.value,
    label: tab.label,
    icon: <tab.icon className="size-4" />
  }));

  return (
    <div className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8 pt-5">
      {/* ── Page Header ── */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Gestión Académica
        </h2>
        <p className="text-xs text-muted-foreground/70">
          Configuración de la malla curricular y asignación de carga docente.
        </p>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="border-b border-border/40 pb-0 -mx-1">
        <AnimatedTabs
          tabs={tabsForAnimated}
          activeTab={currentTab}
          onTabChange={(v) => router.push(v)}
        />
      </div>

      {/* ── Page Content ── */}
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}
