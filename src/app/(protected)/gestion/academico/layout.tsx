"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      label: "Carga Académica",
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
        <div className="relative">
          <TooltipProvider delayDuration={0}>
            <TabsList className="p-1.5 h-auto flex flex-wrap sm:flex-nowrap justify-center gap-1.5 border rounded-2xl overflow-hidden shadow-xl bg-background/20 backdrop-blur-md">
              {tabs.map((tab) => {
                const isActive = pathname.startsWith(tab.value);
                return (
                  <Tooltip key={tab.value}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={tab.value}
                        className={`
                          flex flex-col items-center justify-center gap-2 px-5 py-4 h-auto transition-all duration-300 rounded-xl shrink-0 sm:flex-1 
                          ${
                            isActive
                              ? "bg-background/20 text-primary border-muted-foreground/10"
                              : "text-default hover:bg-background dark:hover:bg-white/5 hover:text-foreground "
                          }
                        `}
                      >
                        <tab.icon
                          className={`size-6 sm:size-5 transition-transform duration-300 ${isActive ? "scale-110 text-blue-500" : "scale-100"}`}
                        />
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center transition-colors duration-300 ${isActive ? "text-blue-500" : "text-default"}`}
                        >
                          {tab.label}
                        </span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      sideOffset={8}
                    >
                      <p>{tab.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TabsList>
          </TooltipProvider>
        </div>
        {children}
      </Tabs>
    </div>
  );
}
