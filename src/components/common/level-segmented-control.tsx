"use client";

import { NIVEL_ICON_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { IconBook } from "@tabler/icons-react";

interface LevelOption {
  id: string;
  label: string;
}

interface LevelSegmentedControlProps {
  levels: (string | LevelOption)[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  className?: string;
}

export function LevelSegmentedControl({
  levels,
  value,
  onChange,
  label = "Nivel Educativo",
  className,
}: LevelSegmentedControlProps) {
  return (
    <section className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center gap-1.5 ml-0.5">
          <span className={cn(
            "size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors",
            value
              ? "bg-primary text-primary-foreground"
              : "bg-muted-foreground/15 text-muted-foreground/50"
          )}>
            1
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase transition-colors",
            value ? "text-primary/80" : "text-muted-foreground/60"
          )}>
            {label}
          </span>
        </div>
      )}
      <div className="flex h-9 p-0.5 bg-muted/30 rounded-lg gap-0.5 border border-border/40">
        {levels.map((item) => {
          const id = typeof item === "string" ? item : item.id;
          const name = typeof item === "string" ? item : item.label;
          const Icon = NIVEL_ICON_MAP[name.toUpperCase()] || IconBook;
          const isActive = value === id;
          
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2 rounded-md cursor-pointer transition-[color,background-color,box-shadow] duration-200 text-[11px] font-bold tracking-wide uppercase",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
