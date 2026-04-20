import { Card } from "@/components/ui/card";

export default function AttendanceWidget({
  attendancePercentage,
}: {
  attendancePercentage: number;
}) {
  return (
    <Card className="flex flex-col p-6 h-full min-h-[300px] liquid-glass relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="relative z-10 w-full h-full flex flex-col">
      <h3 className="font-bold text-sm uppercase tracking-wider mb-6">
        Asistencia
      </h3>
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        <div className="relative size-32 @[20rem]:size-40">
          <svg className="size-full" viewBox="0 0 36 36">
            <path
              className="stroke-muted-foreground"
              strokeDasharray="100, 100"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="stroke-emerald-500 shadow-glow"
              strokeDasharray={`${attendancePercentage}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl @[20rem]:text-4xl font-black">
              {attendancePercentage.toFixed(0)}%
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Presente
            </span>
          </div>
        </div>
        <p className="mt-8 text-xs text-center text-muted-foreground font-medium italic px-4">
          "
          {attendancePercentage >= 95
            ? "Excelente consistencia este periodo"
            : "Asistencia regular"}
          "
        </p>
      </div>
      </div>
    </Card>
  );
}
