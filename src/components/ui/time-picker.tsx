"use client";

import * as React from "react";
import { IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const [selectedHour, setSelectedHour] = React.useState(
    value?.split(":")[0] || "08",
  );
  const [selectedMinute, setSelectedMinute] = React.useState(
    value?.split(":")[1] || "00",
  );

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setSelectedHour(h || "08");
      setSelectedMinute(m || "00");
    }
  }, [value]);

  const handleTimeChange = (type: "hour" | "minute", val: string) => {
    let newHour = selectedHour;
    let newMinute = selectedMinute;

    if (type === "hour") {
      newHour = val;
      setSelectedHour(val);
    } else {
      newMinute = val;
      setSelectedMinute(val);
    }

    if (onChange) {
      onChange(`${newHour}:${newMinute}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-full border-border/40 bg-background/50 h-10 px-4 font-normal",
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <IconClock className="h-4 w-4 text-muted-foreground" />
            {value || "Seleccionar hora"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0 border-border/40 bg-background/95 backdrop-blur-xl shrink-0"
        align="start"
      >
        <div className="flex h-64 divide-x divide-border/20">
          <ScrollArea className="flex-1">
            <div className="flex flex-col p-1">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  variant={selectedHour === hour ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "justify-center h-8 w-full text-xs transition-all",
                    selectedHour === hour
                      ? "bg-primary font-bold shadow-lg"
                      : "hover:bg-primary/10",
                  )}
                  onClick={() => handleTimeChange("hour", hour)}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className="flex-1">
            <div className="flex flex-col p-1">
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  variant={selectedMinute === minute ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "justify-center h-8 w-full text-xs transition-all",
                    selectedMinute === minute
                      ? "bg-primary font-bold shadow-lg"
                      : "hover:bg-primary/10",
                  )}
                  onClick={() => handleTimeChange("minute", minute)}
                >
                  {minute}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="p-2 border-t border-border/40 flex justify-end bg-muted/5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-[10px] uppercase tracking-wider font-bold"
          >
            Cerrar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
