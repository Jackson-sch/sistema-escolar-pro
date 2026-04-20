"use client"

import { useQueryState, parseAsString } from "nuqs"
import { IconReceipt, IconUsers, IconChartBar } from "@tabler/icons-react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AnimatedTabs } from "@/components/ui/animated-tabs"

interface FinanzasTabsProps {
  children: {
    cronograma: React.ReactNode
    conceptos: React.ReactNode
    reportes: React.ReactNode
  }
}

export function FinanzasTabs({ children }: FinanzasTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("cronograma")
  )

  const tabs = [
    {
      id: "cronograma",
      label: "Cronograma",
      icon: <IconUsers className="size-4" />,
    },
    {
      id: "conceptos",
      label: "Conceptos",
      icon: <IconReceipt className="size-4" />,
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: <IconChartBar className="size-4" />,
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

      <TabsContent value="cronograma" className="space-y-4 px-2">
        {children.cronograma}
      </TabsContent>

      <TabsContent value="conceptos" className="space-y-4 px-2">
        {children.conceptos}
      </TabsContent>

      <TabsContent value="reportes" className="space-y-4">
        {children.reportes}
      </TabsContent>
    </Tabs>
  )
}
