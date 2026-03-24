"use client";

import { IconCalendarEvent } from "@tabler/icons-react";

export function ScheduleBanner() {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <IconCalendarEvent className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Horario Académico
          </h1>
          <p className="text-sm font-medium text-muted-foreground/60">
            Portal para Padres
          </p>
        </div>
      </div>
    </div>
  );
}
