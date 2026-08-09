"use client";

import { useQueryState, parseAsString } from "nuqs";
import { IconClipboardList, IconReportAnalytics } from "@tabler/icons-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

interface EvaluacionesTabsProps {
  children: {
    evaluaciones: React.ReactNode;
    reportes: React.ReactNode;
  };
}

export function EvaluacionesTabs({ children }: EvaluacionesTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("evaluaciones"),
  );

  const tabs = [
    {
      id: "evaluaciones",
      label: "Evaluaciones",
      icon: <IconClipboardList className="size-4" />,
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: <IconReportAnalytics className="size-4" />,
    },
  ];

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <AnimatedTabs
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        className="mb-6 ml-2"
      />

      <TabsContent value="evaluaciones" className="space-y-4 px-2">
        {children.evaluaciones}
      </TabsContent>

      <TabsContent value="reportes" className="space-y-4 px-2">
        {children.reportes}
      </TabsContent>
    </Tabs>
  );
}
