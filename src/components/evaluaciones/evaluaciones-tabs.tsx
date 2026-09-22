"use client";

import { useQueryState, parseAsString } from "nuqs";
import {
  IconClipboardList,
  IconReportAnalytics,
  IconCalendarTime,
} from "@tabler/icons-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

interface EvaluacionesTabsProps {
  children: {
    evaluaciones: React.ReactNode;
    reportes: React.ReactNode;
    periodos?: React.ReactNode;
  };
}

const EVALUACIONES_TABS = [
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
  {
    id: "periodos",
    label: "Periodos",
    icon: <IconCalendarTime className="size-4" />,
  },
];

export function EvaluacionesTabs({ children }: EvaluacionesTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("evaluaciones"),
  );


  return (
    <Tabs value={tab} onValueChange={setTab}>
      <AnimatedTabs
        tabs={EVALUACIONES_TABS}
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

      {children.periodos && (
        <TabsContent value="periodos" className="space-y-4 px-2">
          {children.periodos}
        </TabsContent>
      )}
    </Tabs>
  );
}
