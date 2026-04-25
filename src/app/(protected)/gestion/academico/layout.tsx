"use client";

import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBooks,
  IconLayoutGrid,
  IconSchool,
  IconClock,
} from "@tabler/icons-react";

export default function AcademicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { label: "Estructura Académica", value: "/gestion/academico/estructura", icon: IconSchool },
    { label: "Malla Curricular", value: "/gestion/academico/areas", icon: IconBooks },
    { label: "Carga Académica", value: "/gestion/academico/carga-horaria", icon: IconLayoutGrid },
    { label: "Horarios", value: "/gestion/academico/horarios", icon: IconClock },
  ];

  const currentTab =
    tabs.find((tab) => pathname.includes(tab.value))?.value || tabs[0].value;

  const tabsForAnimated = tabs.map(tab => ({
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
