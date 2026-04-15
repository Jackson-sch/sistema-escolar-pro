"use client";

import { NIVEL_ICON_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
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
    <section className={cn("space-y-2.5", className)}>
      {label && <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</Label>}
      <div className="flex p-1.5 bg-muted/50 rounded-xl gap-1 border border-border/40 backdrop-blur-sm">
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
                "flex-1 flex flex-col items-center justify-center py-2.5 px-2 rounded-lg cursor-pointer transition-all duration-300 gap-1.5 group relative overflow-hidden",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02] z-10"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >

              <Icon className={cn(
                "size-5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="text-[10px] font-bold tracking-wider uppercase">
                {name}
              </span>
              
              {/* Subtle indicator for active state */}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
