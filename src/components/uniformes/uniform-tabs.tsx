"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Shirt, Package, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UniformTabsProps {
  children: {
    catalogo: React.ReactNode;
    inventario: React.ReactNode;
    ventas: React.ReactNode;
  };
}

export function UniformTabs({ children }: UniformTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("catalogo"),
  );

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <div className="flex justify-between items-center bg-slate-100/50 p-1 rounded-xl w-fit">
        <TabsList className="bg-transparent border-none">
          <TabsTrigger
            value="catalogo"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            <Shirt className="h-4 w-4 mr-2" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger
            value="inventario"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            <Package className="h-4 w-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger
            value="ventas"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            <History className="h-4 w-4 mr-2" />
            Ventas y Reservas
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="catalogo" className="border-none p-0 outline-none">
        {children.catalogo}
      </TabsContent>

      <TabsContent value="inventario" className="border-none p-0 outline-none">
        {children.inventario}
      </TabsContent>

      <TabsContent value="ventas" className="border-none p-0 outline-none">
        {children.ventas}
      </TabsContent>
    </Tabs>
  );
}
