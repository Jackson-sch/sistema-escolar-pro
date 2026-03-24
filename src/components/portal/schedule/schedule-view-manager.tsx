"use client";

import { useState } from "react";
import { PortalStudentSelector } from "@/components/portal/common/portal-student-selector";
import { DailyTimeline } from "./daily-timeline";
import { WeeklySchedule } from "./weekly-schedule";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleStudentSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("hijoId", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Control Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-2">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1 block">
            Estudiante Seleccionado
          </label>
          <PortalStudentSelector
            students={hijos}
            selectedId={selectedHijoId}
            onSelect={handleStudentSelect}
            showGeneralOption={false}
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-card border border-border/20 w-full md:w-auto h-12 md:h-14">
          <button
            onClick={() => setView("daily")}
            className={cn(
              "flex-1 md:w-[150px] flex items-center justify-center gap-2 h-full rounded-xl text-[10px] md:text-xs font-black transition-all duration-300",
              view === "daily"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground/60 hover:text-white hover:bg-white/5",
            )}
          >
            Timeline Diario
          </button>
          <button
            onClick={() => setView("weekly")}
            className={cn(
              "flex-1 md:w-[150px] flex items-center justify-center gap-2 h-full rounded-xl text-[10px] md:text-xs font-black transition-all duration-300",
              view === "weekly"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground/60 hover:text-white hover:bg-white/5",
            )}
          >
            Vista Semanal
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
