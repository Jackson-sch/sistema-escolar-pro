"use client";

import { useState } from "react";
import { PortalStudentSelector } from "@/components/portal/common/portal-student-selector";
import { DailyTimeline } from "./daily-timeline";
import { WeeklySchedule } from "./weekly-schedule";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconClock, IconCalendar } from "@tabler/icons-react";

interface ScheduleViewManagerProps {
  horarios: any[];
  hijos: any[];
  selectedHijoId: string;
}

export function ScheduleViewManager({
  horarios,
  hijos,
  selectedHijoId,
}: ScheduleViewManagerProps) {
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const router = useRouter();

  const handleStudentSelect = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("hijoId", id);
    router.push(`${url.pathname}?${url.searchParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Control Area */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/40 bg-card/80 p-4 shadow-sm md:flex-row md:items-end">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Estudiante Seleccionado
          </span>
          <PortalStudentSelector
            students={hijos}
            selectedId={selectedHijoId}
            onSelect={handleStudentSelect}
            showGeneralOption={false}
          />
        </div>

        {/* View Toggle */}
        <div className="flex h-10 w-full items-center rounded-xl border border-border/40 bg-muted/30 p-1 md:w-auto">
          <button
            onClick={() => setView("daily")}
            className={cn(
              "flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-[color,background-color,box-shadow] cursor-pointer md:w-[150px]",
              view === "daily"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-card/80 hover:text-foreground",
            )}
          >
            <IconClock className="size-3.5" />
            <span>Timeline Diario</span>
          </button>
          <button
            onClick={() => setView("weekly")}
            className={cn(
              "flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-[color,background-color,box-shadow] cursor-pointer md:w-[150px]",
              view === "weekly"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-card/80 hover:text-foreground",
            )}
          >
            <IconCalendar className="size-3.5" />
            <span>Vista Semanal</span>
          </button>
        </div>
      </div>

      {/* Render View */}
      {view === "daily" ? (
        <DailyTimeline horarios={horarios} />
      ) : (
        <WeeklySchedule horarios={horarios} />
      )}
    </div>
  );
}
