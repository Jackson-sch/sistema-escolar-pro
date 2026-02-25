"use client";

import { useQueryState, parseAsString } from "nuqs";
import {
  IconChartBar,
  IconClipboardText,
  IconQrcode,
  IconClockCog,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AsistenciaTabsProps {
  children: {
    registro: React.ReactNode;
    reportes: React.ReactNode;
    scanner: React.ReactNode;
    politicas: React.ReactNode;
  };
}

export function AsistenciaTabs({ children }: AsistenciaTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("registro"),
  );

  const tabs = [
    {
      value: "registro",
      label: "Registro Diario",
      icon: <IconClipboardText className="size-4" />,
    },
    {
      value: "reportes",
      label: "Reportes",
      icon: <IconChartBar className="size-4" />,
    },
    {
      value: "scanner",
      label: "Scanner QR",
      icon: <IconQrcode className="size-4" />,
    },
    {
      value: "politicas",
      label: "Políticas",
      icon: <IconClockCog className="size-4" />,
    },
  ];

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="flex flex-wrap sm:flex-nowrap h-auto sm:ml-2 bg-muted/50 shadow-inner border justify-start rounded-full">
        {tabs.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2 rounded-full"
          >
            {t.icon}
            <span>{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="registro" className="space-y-4">
        {children.registro}
      </TabsContent>

      <TabsContent value="reportes" className="space-y-4">
        {children.reportes}
      </TabsContent>

      <TabsContent value="scanner" className="space-y-4">
        {children.scanner}
      </TabsContent>

      <TabsContent value="politicas" className="space-y-4">
        {children.politicas}
      </TabsContent>
    </Tabs>
  );
}
