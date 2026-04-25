"use client";

import { useQueryState, parseAsString } from "nuqs";
import {
  IconChartBar,
  IconClipboardText,
  IconQrcode,
  IconClockCog,
} from "@tabler/icons-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

interface AsistenciaTabsProps {
  children: {
    registro: React.ReactNode;
    reportes: React.ReactNode;
    scanner: React.ReactNode;
    politicas: React.ReactNode;
  };
  isProfessor?: boolean;
}

export function AsistenciaTabs({ children, isProfessor }: AsistenciaTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("registro"),
  );

  const tabs = [
    {
      id: "registro",
      label: "Registro Diario",
      icon: <IconClipboardText className="size-4" />,
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: <IconChartBar className="size-4" />,
    },
    {
      id: "scanner",
      label: "Scanner QR",
      icon: <IconQrcode className="size-4" />,
    },
    {
      id: "politicas",
      label: "Políticas",
      icon: <IconClockCog className="size-4" />,
    },
  ].filter((t) => {
    if (isProfessor && (t.id === "scanner" || t.id === "politicas"))
      return false;
    return true;
  });

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <AnimatedTabs
        layoutId="attendance-main-tabs"
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        className="mb-6 ml-2"
      />

      <TabsContent value="registro" className="space-y-4">
        {children.registro}
      </TabsContent>

      <TabsContent value="reportes" className="space-y-4">
        {children.reportes}
      </TabsContent>

      {!isProfessor && (
        <TabsContent value="scanner" className="space-y-4">
          {children.scanner}
        </TabsContent>
      )}

      {!isProfessor && (
        <TabsContent value="politicas" className="space-y-4">
          {children.politicas}
        </TabsContent>
      )}
    </Tabs>
  );
}
