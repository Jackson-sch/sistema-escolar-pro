"use client";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (val: string) => void;
  disabled: boolean;
  step: number;
  completed: boolean;
  children: React.ReactNode;
}

export function SelectField({
  label,
  placeholder,
  value,
  onValueChange,
  disabled,
  step,
  completed,
  children,
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 ml-0.5">
        <span className={cn(
          "size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors",
          completed
            ? "bg-primary text-primary-foreground"
            : "bg-muted-foreground/15 text-muted-foreground/50"
        )}>
          {step}
        </span>
        <label className={cn(
          "text-xxs font-bold uppercase transition-colors",
          completed ? "text-primary/80" : "text-muted-foreground/60"
        )}>
          {label}
        </label>
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(
          "h-9 w-full rounded-lg border text-sm transition-all",
          completed
            ? "border-primary/30 bg-primary/5 text-foreground focus:ring-primary/30"
            : "border-border/60 bg-muted/30 focus:ring-primary/30",
          disabled && "opacity-40 cursor-not-allowed",
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}
