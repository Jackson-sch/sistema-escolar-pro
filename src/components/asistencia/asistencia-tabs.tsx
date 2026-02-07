"use client"

import { useQueryState, parseAsString } from "nuqs"
import { IconChartBar, IconClipboardText } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AsistenciaTabsProps {
  children: {
    registro: React.ReactNode
    reportes: React.ReactNode
  }
}

export function AsistenciaTabs({ children }: AsistenciaTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("registro")
  )

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="flex flex-wrap sm:flex-nowrap h-auto sm:h-12 mb-6 sm:ml-2 bg-muted/50 p-1 shadow-inner border justify-start rounded-full">
        <TabsTrigger value="registro" className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2 rounded-full">
          <IconClipboardText className="size-4" />
          <span>Registro Diario</span>
        </TabsTrigger>

        <TabsTrigger value="reportes" className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2 rounded-full">
          <IconChartBar className="size-4" />
          <span>Reportes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="registro" className="space-y-4">
        {children.registro}
      </TabsContent>

      <TabsContent value="reportes" className="space-y-4">
        {children.reportes}
      </TabsContent>
    </Tabs>
  )
}
