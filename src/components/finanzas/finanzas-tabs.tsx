"use client"

import { useQueryState, parseAsString } from "nuqs"
import { IconReceipt, IconUsers, IconChartBar } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex flex-wrap sm:flex-nowrap h-auto sm:h-12 w-full max-w-lg mb-6 ml-0 sm:ml-2 bg-muted/50 p-1 shadow-inner border justify-start">
        <TabsTrigger value="cronograma" className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2">
          <IconUsers className="size-4" />
          Cronograma
        </TabsTrigger>
        <TabsTrigger value="conceptos" className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2">
          <IconReceipt className="size-4" />
          Conceptos
        </TabsTrigger>
        <TabsTrigger value="reportes" className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2">
          <IconChartBar className="size-4" />
          Reportes
        </TabsTrigger>
      </TabsList>

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
