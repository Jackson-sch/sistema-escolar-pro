"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBooks,
  IconLayoutGrid,
  IconSchool,
  IconLayersSubtract,
  IconUsersGroup,
  IconClock,
  IconTarget,
} from "@tabler/icons-react";

export default function AcademicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { label: "Niveles", value: "/gestion/academico/niveles", icon: IconSchool },
    {
      label: "Grados",
      value: "/gestion/academico/grados",
      icon: IconLayersSubtract,
    },
    {
      label: "Secciones",
      value: "/gestion/academico/secciones",
      icon: IconUsersGroup,
    },
    {
      label: "Malla Curricular",
      value: "/gestion/academico/areas",
      icon: IconBooks,
    },
    {
      label: "Competencias",
      value: "/gestion/academico/competencias",
      icon: IconTarget,
    },
    {
      label: "Carga Horaria",
      value: "/gestion/academico/carga-horaria",
      icon: IconLayoutGrid,
    },
    {
      label: "Horarios",
      value: "/gestion/academico/horarios",
      icon: IconClock,
    },
  ];

  const currentTab =
    tabs.find((tab) => pathname.includes(tab.value))?.value || tabs[0].value;

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Gestión Académica
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Configuración de la malla curricular y asignación de carga docente.
          </p>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(v) => router.push(v)}
        className="space-y-6"
      >
        <TabsList className="bg-muted/50 p-1 h-auto sm:h-12 shadow-inner border flex-wrap sm:flex-nowrap justify-start">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="px-3 sm:px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
            >
              <tab.icon className="size-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
