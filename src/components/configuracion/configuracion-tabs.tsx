"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-4 bg-primary/5 p-1 rounded-xl">
        <TabsTrigger
          value="datos"
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Datos Institucionales
        </TabsTrigger>
        <TabsTrigger
          value="sedes"
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Sedes
        </TabsTrigger>
        <TabsTrigger
          value="variables"
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Variables de Sistema
        </TabsTrigger>
      </TabsList>

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
