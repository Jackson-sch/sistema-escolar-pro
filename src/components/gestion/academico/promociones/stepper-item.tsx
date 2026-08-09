"use client";

import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StepperItemProps {
  active: boolean;
  completed: boolean;
  icon: React.ReactNode;
  label: string;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function StepperItem({
  active,
  completed,
  icon,
  label,
  title,
  onClick,
  disabled,
}: StepperItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={cn(
        "flex items-center gap-3.5 px-5 py-3.5 rounded-2xl border transition-[background-color,border-color,box-shadow,transform,z-index] duration-300 min-w-[240px] text-left select-none",
        active
          ? "bg-indigo-600/10 dark:bg-indigo-950/40 border-indigo-500/40 shadow-lg shadow-indigo-500/10 scale-[1.02] z-10"
          : completed
            ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/10"
            : "bg-muted/10 border-border/40 opacity-40 grayscale pointer-events-none"
      )}
    >
      <div
        className={cn(
          "size-9 rounded-xl flex items-center justify-center transition-[color,background-color,box-shadow] duration-300 shrink-0",
          active
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
            : completed
              ? "bg-emerald-500 text-white"
              : "bg-muted text-muted-foreground"
        )}
      >
        {completed ? <IconCheck className="size-4" strokeWidth={2.5} /> : icon}
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            active
              ? "text-indigo-600 dark:text-indigo-400"
              : completed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "text-xs mt-0.5",
            active ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
          )}
        >
          {title}
        </span>
      </div>
    </button>
  );
}
