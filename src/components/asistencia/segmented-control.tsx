"use client";

import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconX,
  IconClock,
  IconFileCheck,
} from "@tabler/icons-react";

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  const options = [
    {
      id: "presente",
      label: "P",
      icon: IconCheck,
      activeColor:
        "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    },
    {
      id: "tarde",
      label: "T",
      icon: IconClock,
      activeColor:
        "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    },
    {
      id: "ausente",
      label: "A",
      icon: IconX,
      activeColor:
        "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]",
    },
    {
      id: "justificado",
      label: "J",
      icon: IconFileCheck,
      activeColor:
        "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    },
  ];

  return (
    <div className="flex bg-card/5 p-1 rounded-full border items-center gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-full transition-all text-[10px] font-black uppercase tracking-tighter",
            value === opt.id
              ? opt.activeColor
              : "text-muted-foreground/20 hover:text-muted-foreground/40",
          )}
          title={opt.id.charAt(0).toUpperCase() + opt.id.slice(1)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
