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
  className,
}: LevelSegmentedControlProps) {
  return (
    <div className={cn("inline-flex items-center h-9 p-0.5 bg-muted/40 rounded-xl border border-border/50 shrink-0", className)}>
      {levels.map((item) => {
        const id = typeof item === "string" ? item : item.id;
        const rawName = typeof item === "string" ? item : item.label;
        // Convert to clean sentence case if uppercase
        const name = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
        const Icon = NIVEL_ICON_MAP[rawName.toUpperCase()] || IconBook;
        const isActive = value === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "h-8 flex items-center justify-center gap-1.5 px-3 rounded-lg cursor-pointer transition-all duration-150 text-xs font-bold select-none",
              isActive
                ? "bg-background text-foreground shadow-2xs border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            <Icon className="size-3.5 shrink-0 opacity-70" />
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}
