"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Icon } from "@tabler/icons-react";

interface TeacherKPIItemProps {
  title: string;
  value: string;
  subtitle: string;
  icon: Icon;
  color: "blue" | "amber" | "emerald" | "indigo" | "purple";
  badgeText?: string;
  progress?: number;
}

const COLOR_MAP = {
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
};

export function TeacherKPIItem({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  badgeText,
  progress,
}: TeacherKPIItemProps) {

  return (
    <div className="rounded-3xl p-5 border border-border/60 bg-card/90 backdrop-blur-md shadow-xs flex flex-col justify-between relative overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div
          className={cn(
            "size-9 rounded-2xl flex items-center justify-center border shadow-xs",
            COLOR_MAP[color],
          )}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {value}
          </h3>
          {badgeText && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                badgeText === "Al día"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
              )}
            >
              {badgeText}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-medium truncate">
          {subtitle}
        </p>

        {progress !== undefined && progress > 0 && (
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
