"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  IconCheck,
  IconX,
  IconPencil,
  IconPlus,
  IconCalendar,
  IconLoader2,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type FieldType = "text" | "select" | "date";

interface SelectOption {
  value: string;
  label: string;
}

interface InlineEditableFieldProps {
  label: string;
  value: string | Date | null | undefined;
  type?: FieldType;
  options?: readonly SelectOption[];
  icon?: React.ReactNode;
  onSave: (value: string | Date | null) => Promise<void>;
  placeholder?: string;
  formatDisplay?: (value: any) => string;
  /** When true, the field is displayed as read-only (no edit icon, no click-to-edit). */
  readOnly?: boolean;
}


export function InlineEditableField({
  label,
  value,
  type = "text",
  options,
  icon,
  onSave,
  placeholder = "Agregar...",
  formatDisplay,
  readOnly = false,
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>("");
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const isEmpty = !value || (typeof value === "string" && value.trim() === "");

  const displayValue = formatDisplay
    ? formatDisplay(value)
    : type === "date" && value instanceof Date
      ? format(value, "dd 'de' MMMM, yyyy", { locale: es })
      : type === "select" && options
        ? options.find((o) => o.value === value)?.label || String(value || "")
        : String(value || "");

  const startEditing = () => {
    if (type === "date") {
      setDateValue(value instanceof Date ? value : value ? new Date(value as string) : undefined);
    } else {
      setEditValue(typeof value === "string" ? value : "");
    }
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && type === "text" && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, type]);

  const handleSave = () => {
    startTransition(async () => {
      try {
        if (type === "date") {
          await onSave(dateValue || null);
        } else {
          await onSave(editValue.trim() || null);
        }
        setIsEditing(false);
      } catch {
        // Error handled by parent
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  // ── Render editing mode ──
  if (isEditing) {
    return (
      <div className="group rounded-xl border border-primary/20 bg-primary/2 p-3 transition-all">
        <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70 mb-2">
          {label}
        </p>

        <div className="flex items-center gap-2">
          {type === "text" && (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="h-8 rounded-lg text-sm flex-1"
              disabled={isPending}
            />
          )}

          {type === "select" && options && (
            <Select
              value={editValue}
              onValueChange={(v) => setEditValue(v)}
              disabled={isPending}
            >
              <SelectTrigger className="h-8 rounded-lg text-sm flex-1">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {type === "date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 rounded-lg text-sm flex-1 justify-start text-left font-normal",
                    !dateValue && "text-muted-foreground"
                  )}
                  disabled={isPending}
                >
                  <IconCalendar className="size-3.5 mr-2 opacity-50" />
                  {dateValue
                    ? format(dateValue, "PPP", { locale: es })
                    : placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(d) => setDateValue(d)}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={1950}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Save / Cancel */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconCheck className="size-3.5" />
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="size-7 rounded-lg border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
            >
              <IconX className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render display mode ──
  return (
    <div
      className={cn(
        "group rounded-xl p-3 transition-colors relative",
        !readOnly && "hover:bg-muted/40 cursor-pointer",
      )}
      onClick={readOnly ? undefined : startEditing}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {icon && (
            <div className="mt-0.5 text-muted-foreground shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-0.5">
              {label}
            </p>
            {isEmpty ? (
              readOnly ? (
                <p className="text-sm text-muted-foreground/50 italic">—</p>
              ) : (
                <button className="flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary transition-colors font-medium">
                  <IconPlus className="size-3.5" />
                  {placeholder}
                </button>
              )
            ) : (
              <p className="text-sm font-medium text-foreground truncate capitalize">
                {displayValue}
              </p>
            )}
          </div>
        </div>

        {/* Edit icon on hover — hidden in readOnly */}
        {!readOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity size-7 rounded-lg border border-border/50 bg-background flex items-center justify-center hover:bg-muted shrink-0 mt-1"
          >
            <IconPencil className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
