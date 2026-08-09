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
  /** Solo lectura */
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

  const handleSaveText = () => {
    startTransition(async () => {
      try {
        await onSave(editValue.trim() || null);
        setIsEditing(false);
      } catch {
        // Manejado por padre
      }
    });
  };

  const handleSaveSelect = (newValue: string) => {
    setEditValue(newValue);
    startTransition(async () => {
      try {
        await onSave(newValue || null);
        setIsEditing(false);
      } catch {
        // Manejado por padre
      }
    });
  };

  const handleSaveDate = (newDate: Date | undefined) => {
    setDateValue(newDate);
    if (!newDate) return;
    startTransition(async () => {
      try {
        await onSave(newDate);
        setIsEditing(false);
      } catch {
        // Manejado por padre
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveText();
    if (e.key === "Escape") handleCancel();
  };

  // ── Render Modo Edición ──
  if (isEditing) {
    return (
      <div className="group rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 transition-[color,letter-spacing]">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
            {label}
          </p>
          {isPending && (
            <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium animate-pulse">
              <IconLoader2 className="size-3 animate-spin" /> Guardando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {type === "text" && (
            <>
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="h-8 rounded-lg text-xs flex-1 bg-background border-border/40"
                disabled={isPending}
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveText}
                  disabled={isPending}
                  className="size-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Guardar cambios (Enter)"
                >
                  {isPending ? (
                    <IconLoader2 className="size-3.5 animate-spin" />
                  ) : (
                    <IconCheck className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="size-7 rounded-lg border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                  title="Cancelar (Esc)"
                >
                  <IconX className="size-3.5" />
                </button>
              </div>
            </>
          )}

          {type === "select" && options && (
            <div className="flex items-center gap-2 w-full">
              <Select
                value={editValue}
                onValueChange={handleSaveSelect}
                disabled={isPending}
              >
                <SelectTrigger className="h-8 rounded-lg text-xs flex-1 bg-background border-border/40">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40">
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="size-7 rounded-lg border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                title="Cancelar"
              >
                <IconX className="size-3.5" />
              </button>
            </div>
          )}

          {type === "date" && (
            <div className="flex items-center gap-2 w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 rounded-lg text-xs flex-1 justify-start text-left font-medium bg-background border-border/40",
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
                <PopoverContent className="w-auto p-0 rounded-2xl border-border/40" align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={handleSaveDate}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="size-7 rounded-lg border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                title="Cancelar"
              >
                <IconX className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render Modo Lectura / Vista Previa ──
  return (
    <div
      className={cn(
        "group rounded-xl p-2.5 transition-[color,background-color,margin] relative outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !readOnly && "hover:bg-muted/40 cursor-pointer",
      )}
      role={readOnly ? undefined : "button"}
      tabIndex={readOnly ? undefined : 0}
      onClick={readOnly ? undefined : startEditing}
      onKeyDown={
        readOnly
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                startEditing();
              }
            }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {icon && (
            <div className="mt-0.5 text-muted-foreground shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-0.5">
              {label}
            </p>
            {isEmpty ? (
              readOnly ? (
                <p className="text-xs text-muted-foreground/50 italic">—</p>
              ) : (
                <button className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  <IconPlus className="size-3" />
                  {placeholder}
                </button>
              )
            ) : (
              <p className="text-xs font-semibold text-foreground truncate capitalize">
                {displayValue}
              </p>
            )}
          </div>
        </div>

        {/* Ícono de Lapicero en Hover */}
        {!readOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity size-6 rounded-md border border-border/40 bg-background flex items-center justify-center hover:bg-muted shrink-0 mt-0.5"
            title="Editar campo"
          >
            <IconPencil className="size-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
