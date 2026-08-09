import { Card } from "@/components/ui/card";
import { IconCalendarCheck } from "@tabler/icons-react";

export default function AttendanceWidget({
  attendancePercentage,
}: {
  attendancePercentage: number;
}) {
  return (
    <Card className="flex h-full min-h-[300px] flex-col rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm">
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-border/20 pb-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Asistencia General
          </span>
          <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <IconCalendarCheck className="size-4" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center py-4">
          <div className="relative size-32 @[20rem]:size-36">
            <svg className="size-full" viewBox="0 0 36 36">
              <path
                className="stroke-muted/40"
                strokeDasharray="100, 100"
                strokeWidth="3"
                fill="none"
                d="M18 2.08 a 15.92 15.92 0 0 1 0 31.83 a 15.92 15.92 0 0 1 0 -31.83"
              />
              <path
                className="stroke-emerald-500"
                strokeDasharray={`${attendancePercentage}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                d="M18 2.08 a 15.92 15.92 0 0 1 0 31.83 a 15.92 15.92 0 0 1 0 -31.83"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono text-foreground">
                {attendancePercentage.toFixed(0)}%
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                Presente
              </span>
            </div>
          </div>
          <p className="mt-6 text-xs text-center text-muted-foreground font-medium italic px-2">
            &ldquo;
            {attendancePercentage >= 95
              ? "Excelente consistencia en el periodo"
              : "Asistencia regular en aula"}
            &rdquo;
          </p>
        </div>
      </div>
    </Card>
  );
}
