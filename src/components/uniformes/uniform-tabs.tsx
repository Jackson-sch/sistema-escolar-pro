"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Shirt, Package, History } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

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

  const tabs = [
    {
      id: "catalogo",
      label: "Catálogo",
      icon: <Shirt className="size-4" />,
    },
    {
      id: "inventario",
      label: "Inventario",
      icon: <Package className="size-4" />,
    },
    {
      id: "ventas",
      label: "Ventas y Reservas",
      icon: <History className="size-4" />,
    },
  ];

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <AnimatedTabs
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        className="ml-0"
      />

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
