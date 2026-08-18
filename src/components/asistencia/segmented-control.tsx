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

const SEGMENTED_OPTIONS = [
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
    label: "F",
    icon: IconX,
    activeColor:
      "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]",
  },
  {
    id: "justificado",
    label: "J",
    icon: IconFileCheck,
    activeColor:
      "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]",
  },
];

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  const isSelected = (optId: string) => {
    if (value === optId) return true;
    if (optId === "ausente" && value === "falta") return true;
    if (optId === "justificado" && value === "justificada") return true;
    return false;
  };

  return (
    <div className="flex bg-card/5 p-1 rounded-full border items-center gap-0.5">
      {SEGMENTED_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-full transition-[color,background-color,box-shadow] text-[10px] font-black uppercase tracking-tighter cursor-pointer",
            isSelected(opt.id)
              ? opt.activeColor
              : "text-muted-foreground/30 hover:text-muted-foreground/60",
          )}
          title={opt.id.charAt(0).toUpperCase() + opt.id.slice(1)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
