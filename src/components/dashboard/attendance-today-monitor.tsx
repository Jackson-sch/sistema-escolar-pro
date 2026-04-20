"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconUsers, IconUserCheck, IconUserX, IconClock } from "@tabler/icons-react";

interface AttendanceTodayMonitorProps {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export function AttendanceTodayMonitor({
  present,
  absent,
  late,
  total,
}: AttendanceTodayMonitorProps) {
  const presentPerc = total > 0 ? (present / total) * 100 : 0;
  const absentPerc = total > 0 ? (absent / total) * 100 : 0;
  const latePerc = total > 0 ? (late / total) * 100 : 0;

  return (
    <Card className="liquid-glass border-none h-full overflow-hidden group">
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <IconUsers size={18} />
          </div>
          Asistencia Real (Hoy)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Main Stat Circle/Layout */}
        <div className="flex items-center justify-center py-4">
          <div className="relative size-32">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * presentPerc) / 100}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{presentPerc.toFixed(0)}%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Presentes</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-3">
          <AttendanceDetail 
            icon={IconUserCheck}
            label="Presentes"
            value={present}
            color="emerald"
          />
          <AttendanceDetail 
            icon={IconClock}
            label="Tardanzas"
            value={late}
            color="amber"
          />
          <AttendanceDetail 
            icon={IconUserX}
            label="Faltas"
            value={absent}
            color="red"
          />
          <AttendanceDetail 
            icon={IconUsers}
            label="Total"
            value={total}
            color="blue"
          />
        </div>

        <div className="pt-2 text-[10px] text-center text-muted-foreground italic">
          * Basado en el último registro de hoy
        </div>
      </CardContent>

      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 size-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-700" />
    </Card>
  );
}

function AttendanceDetail({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any, 
  label: string, 
  value: number, 
  color: "emerald" | "amber" | "red" | "blue"
}) {
  const colors = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    red: "text-red-500 bg-red-500/10",
    blue: "text-blue-500 bg-blue-500/10",
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
      <div className={cn("size-7 rounded-lg flex items-center justify-center shrink-0", colors[color])}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-muted-foreground uppercase truncate">{label}</p>
        <p className="text-xs font-black">{value}</p>
      </div>
    </div>
  );
}
