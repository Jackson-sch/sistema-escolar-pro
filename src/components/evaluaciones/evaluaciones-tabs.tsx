"use client";

import { useQueryState, parseAsString } from "nuqs";
import { IconClipboardList, IconReportAnalytics } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="flex flex-wrap sm:flex-nowrap h-auto sm:h-12 mb-2 sm:ml-2 bg-muted/50 p-1 shadow-inner border justify-start rounded-full">
        <TabsTrigger
          value="evaluaciones"
          className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2 rounded-full"
        >
          <IconClipboardList className="size-4" />
          <span>Evaluaciones</span>
        </TabsTrigger>

        <TabsTrigger
          value="reportes"
          className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2 rounded-full"
        >
          <IconReportAnalytics className="size-4" />
          <span>Reportes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="evaluaciones" className="space-y-4">
        {children.evaluaciones}
      </TabsContent>

      <TabsContent value="reportes" className="space-y-4">
        {children.reportes}
      </TabsContent>
    </Tabs>
  );
}
