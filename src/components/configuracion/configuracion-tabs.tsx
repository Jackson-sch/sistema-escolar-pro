"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedTabs } from "../ui/animated-tabs";

interface ConfiguracionTabsProps {
  children: {
    datos: React.ReactNode;
    sedes: React.ReactNode;
    variables: React.ReactNode;
  };
}

export function ConfiguracionTabs({ children }: ConfiguracionTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("datos"),
  );

  const TABS = [
    { id: "datos", label: "Datos Institucionales" },
    { id: "sedes", label: "Sedes" },
    { id: "variables", label: "Variables de Sistema" },
  ];

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <AnimatedTabs
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        className="mb-4"
      />

      <TabsContent value="datos" className="mt-0 outline-none">
        <div className="animate-in fade-in duration-500">{children.datos}</div>
      </TabsContent>

      <TabsContent value="sedes" className="mt-0 outline-none">
        <div className="animate-in fade-in duration-500">{children.sedes}</div>
      </TabsContent>

      <TabsContent value="variables" className="mt-0 outline-none">
        <div className="animate-in fade-in duration-500">
          {children.variables}
        </div>
      </TabsContent>
    </Tabs>
  );
}
