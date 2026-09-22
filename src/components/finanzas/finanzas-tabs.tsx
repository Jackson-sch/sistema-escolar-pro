"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import {
  IconReceipt,
  IconUsers,
  IconChartBar,
  IconBolt,
} from "@tabler/icons-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

interface FinanzasTabsProps {
  children: {
    caja?: React.ReactNode;
    cronograma: React.ReactNode;
    conceptos: React.ReactNode;
    reportes: React.ReactNode;
  };
}

const FINANZAS_TABS = [
  {
    id: "caja",
    label: "Caja Rápida (POS)",
    icon: <IconBolt className="size-4 text-amber-500 animate-pulse" />,
  },
  {
    id: "cronograma",
    label: "Cronograma de Pagos",
    icon: <IconUsers className="size-4" />,
  },
  {
    id: "conceptos",
    label: "Conceptos & Tarifas",
    icon: <IconReceipt className="size-4" />,
  },
  {
    id: "reportes",
    label: "Reportes & Balance",
    icon: <IconChartBar className="size-4" />,
  },
];

export function FinanzasTabs({ children }: FinanzasTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("cronograma"),
  );
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setPage(1);
    setSearchQuery("");
  };


  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <div className="px-1">
        <AnimatedTabs
          tabs={FINANZAS_TABS}
          activeTab={tab}
          onTabChange={handleTabChange}
          className="mb-5"
        />
      </div>

      <TabsContent value="caja" className="space-y-4 px-1">
        {children.caja}
      </TabsContent>

      <TabsContent value="cronograma" className="space-y-4 px-1">
        {children.cronograma}
      </TabsContent>

      <TabsContent value="conceptos" className="space-y-4 px-1">
        {children.conceptos}
      </TabsContent>

      <TabsContent value="reportes" className="space-y-4 px-1">
        {children.reportes}
      </TabsContent>
    </Tabs>
  );
}
