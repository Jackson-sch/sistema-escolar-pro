import { useState } from "react";
import { IconClock, IconCalendarEvent } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { HorarioDocente, parseTimeToMinutes } from "./teacher-types";
import { TeacherScheduleItem } from "./teacher-schedule-item";
import { TeacherWeeklyScheduleDialog } from "./teacher-weekly-schedule-dialog";

interface TeacherScheduleSectionProps {
  todaySchedule: HorarioDocente[];
  weeklySchedule?: HorarioDocente[];
  currentMinutes: number;
}

export function TeacherScheduleSection({
  todaySchedule,
  weeklySchedule = [],
  currentMinutes,
}: TeacherScheduleSectionProps) {
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <div className="size-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <IconClock size={14} />
          </div>
          Jornada de Clases de Hoy
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground font-semibold">
            {todaySchedule.length}{" "}
            {todaySchedule.length === 1 ? "bloque" : "bloques"}
          </span>

          {weeklySchedule.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWeeklyModal(true)}
              className="h-7 px-2.5 text-[11px] font-semibold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-lg cursor-pointer gap-1"
            >
              <IconCalendarEvent size={13} />
              <span>Horario Semanal</span>
            </Button>
          )}
        </div>
      </div>

      <TeacherWeeklyScheduleDialog
        open={showWeeklyModal}
        onOpenChange={setShowWeeklyModal}
        weeklySchedule={weeklySchedule}
      />

      <div className="grid gap-3">
        {todaySchedule.length === 0 ? (
          <div className="rounded-3xl p-8 text-center border border-dashed border-border/60 bg-card/60 backdrop-blur-md space-y-2">
            <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-500">
              <IconClock size={22} opacity={0.6} />
            </div>
            <h4 className="text-sm font-bold text-foreground">
              Sin clases lectivas hoy
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No tienes sesiones asignadas para la fecha actual. Puedes
              aprovechar para avanzar en la calificación de notas.
            </p>
          </div>
        ) : (
          todaySchedule.map((item) => {
            const start = parseTimeToMinutes(item.horaInicio);
            const end = parseTimeToMinutes(item.horaFin);
            const isCurrent = currentMinutes >= start && currentMinutes <= end;
            const isPassed = currentMinutes > end;

            return (
              <TeacherScheduleItem
                key={item.id}
                item={item}
                isCurrent={isCurrent}
                isPassed={isPassed}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
