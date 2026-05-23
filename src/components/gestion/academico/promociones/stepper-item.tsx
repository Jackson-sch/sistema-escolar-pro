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
      className={cn(
        "flex items-center gap-4 transition-all duration-500 px-6 py-4 rounded-[2rem] border min-w-[260px]",
        active
          ? "bg-primary/10 border-primary/40 shadow-xl shadow-primary/10 scale-105 z-10"
          : completed
            ? "bg-green-500/5 border-green-500/20 opacity-80"
            : "bg-muted/10 border-transparent opacity-40 grayscale pointer-events-none"
      )}
    >
      <div
        className={cn(
          "size-10 rounded-2xl flex items-center justify-center transition-all duration-500",
          active
            ? "bg-primary text-primary-foreground shadow-lg rotate-0"
            : completed
              ? "bg-green-500 text-white"
              : "bg-border text-muted-foreground rotate-12"
        )}
      >
        {completed ? <IconCheck className="size-5" strokeWidth={3} /> : icon}
      </div>
      <div className="text-left">
        <p
          className={cn(
            "text-[9px] font-bold uppercase tracking-widest",
            active ? "text-primary" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-xs font-bold leading-tight",
            active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {title}
        </p>
      </div>
    </button>
  );
}
