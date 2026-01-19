"use client"

import { useQueryState, parseAsString } from "nuqs"
import { IconChartBar, IconClipboardText } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

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
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex flex-wrap sm:flex-nowrap h-auto sm:h-12 w-full max-w-[400px] mb-6 sm:ml-2 bg-muted/50 p-1 shadow-inner border justify-start">
        <TabsTrigger value="registro" className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2">
          <IconClipboardText className="size-4" />
          <span>Registro Diario</span>
        </TabsTrigger>

        <TabsTrigger value="reportes" className="flex-1 sm:flex-initial gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2">
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
