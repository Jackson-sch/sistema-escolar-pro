"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconLayoutDashboard,
  IconSchool,
  IconCreditCard,
} from "@tabler/icons-react";
import { DashboardGeneralTab } from "./dashboard-general-tab";
import { DashboardAcademicTab } from "./dashboard-academic-tab";
import { DashboardFinancialTab } from "./dashboard-financial-tab";

interface DashboardTabsContainerProps {
  stats: any;
  admissions: any[];
}

export function DashboardTabsContainer({
  stats,
  admissions,
}: DashboardTabsContainerProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("general"),
  );

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="w-full space-y-6"
    >
      <div className="px-4 sm:px-2">
        <TabsList className="h-10 p-1 bg-muted/40 rounded-xl border border-border/50 flex w-full sm:w-fit justify-start gap-1">
          <TabsTrigger
            value="general"
            className="rounded-lg text-xs font-bold gap-2 px-3.5 h-8 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
          >
            <IconLayoutDashboard size={14} className="text-primary" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger
            value="academico"
            className="rounded-lg text-xs font-bold gap-2 px-3.5 h-8 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
          >
            <IconSchool size={14} className="text-violet-500" />
            <span>Académico & CNEB</span>
          </TabsTrigger>
          <TabsTrigger
            value="financiero"
            className="rounded-lg text-xs font-bold gap-2 px-3.5 h-8 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
          >
            <IconCreditCard size={14} className="text-emerald-500" />
            <span>Tesorería & Flujo</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* 1. Pestaña General */}
      <TabsContent
        value="general"
        className="px-4 sm:px-2 space-y-6 m-0 focus-visible:outline-hidden"
      >
        <DashboardGeneralTab stats={stats} admissions={admissions} />
      </TabsContent>

      {/* 2. Pestaña Académica */}
      <TabsContent
        value="academico"
        className="px-4 sm:px-2 space-y-6 m-0 focus-visible:outline-hidden"
      >
        <DashboardAcademicTab stats={stats} />
      </TabsContent>

      {/* 3. Pestaña Financiera */}
      <TabsContent
        value="financiero"
        className="px-4 sm:px-2 space-y-6 m-0 focus-visible:outline-hidden"
      >
        <DashboardFinancialTab stats={stats} />
      </TabsContent>
    </Tabs>
  );
}
