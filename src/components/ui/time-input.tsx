"use client";

import * as React from "react";
import { IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TimeInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange"
> {
  value?: string;
  onChange?: (value: string) => void;
}

export function TimeInput({
  value = "",
  onChange,
  className,
  ...props
}: TimeInputProps) {
  const [internalValue, setInternalValue] = React.useState(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const formatTime = (input: string) => {
    // Remove everything except numbers
    const digits = input.replace(/\D/g, "").slice(0, 4);

    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }

    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatTime(raw);

    // Basic validation logic for Hours and Minutes
    if (formatted.length === 5) {
      const [h, m] = formatted.split(":").map(Number);
      if (h > 23 || m > 59) return; // Prevent invalid times
    } else if (formatted.length >= 2) {
      const h = Number(formatted.slice(0, 2));
      if (h > 23) return;
    }

    setInternalValue(formatted);
    if (onChange) {
      onChange(formatted);
    }
  };

  const handleBlur = () => {
    // Optional: Auto-complete 8 -> 08:00
    if (internalValue.length > 0 && internalValue.length < 5) {
      const digits = internalValue.replace(/\D/g, "");
      if (digits.length === 1) setInternalValue(`0${digits}:00`);
      if (digits.length === 2) setInternalValue(`${digits}:00`);
      if (digits.length === 3)
        setInternalValue(`${digits.slice(0, 2)}:0${digits.slice(2)}`);

      const final = formatTime(internalValue);
      if (onChange) onChange(final);
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="HH:mm"
        maxLength={5}
        className={cn(
          "rounded-full pl-10 border-border/40 bg-background/50 h-10",
          className,
        )}
      />
      <IconClock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
    </div>
  );
}
