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

function formatFieldValue(
  value: string | Date | null | undefined,
  type: FieldType,
  options?: readonly SelectOption[],
  formatDisplay?: (value: any) => string
): string {
  if (formatDisplay) return formatDisplay(value);
  if (type === "date" && value instanceof Date) {
    return format(value, "dd 'de' MMMM, yyyy", { locale: es });
  }
  if (type === "select" && options) {
    return options.find((o) => o.value === value)?.label || String(value || "");
  }
  return String(value || "");
}

function InlineTextEditor({
  inputRef,
  value,
  onChange,
  onSave,
  onCancel,
  onKeyDown,
  placeholder,
  isPending,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder: string;
  isPending: boolean;
}) {
  return (
    <>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="h-8 rounded-lg text-xs flex-1 bg-background border-border/40"
        disabled={isPending}
      />
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onSave}
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
          onClick={onCancel}
          disabled={isPending}
          className="size-7 rounded-lg border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
          title="Cancelar (Esc)"
        >
          <IconX className="size-3.5" />
        </button>
      </div>
    </>
  );
}

function InlineSelectEditor({
  value,
  onSave,
  onCancel,
  options,
  placeholder,
  isPending,
}: {
  value: string;
  onSave: (val: string) => void;
  onCancel: () => void;
  options: readonly SelectOption[];
  placeholder: string;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      <Select value={value} onValueChange={onSave} disabled={isPending}>
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
        onClick={onCancel}
        disabled={isPending}
        className="size-7 rounded-lg border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        title="Cancelar"
      >
        <IconX className="size-3.5" />
      </button>
    </div>
  );
}

function InlineDateEditor({
  dateValue,
  onSave,
  onCancel,
  placeholder,
  isPending,
}: {
  dateValue: Date | undefined;
  onSave: (val: Date | undefined) => void;
  onCancel: () => void;
  placeholder: string;
  isPending: boolean;
}) {
  return (
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
            {dateValue ? format(dateValue, "PPP", { locale: es }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl border-border/40" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={onSave}
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
        onClick={onCancel}
        disabled={isPending}
        className="size-7 rounded-lg border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        title="Cancelar"
      >
        <IconX className="size-3.5" />
      </button>
    </div>
  );
}

function InlineEditingContainer({
  label,
  isPending,
  type,
  inputRef,
  editValue,
  setEditValue,
  handleSaveText,
  handleCancel,
  handleKeyDown,
  placeholder,
  options,
  handleSaveSelect,
  dateValue,
  handleSaveDate,
}: {
  label: string;
  isPending: boolean;
  type: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  editValue: string;
  setEditValue: (v: string) => void;
  handleSaveText: () => void;
  handleCancel: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  placeholder: string;
  options?: readonly SelectOption[];
  handleSaveSelect: (v: string) => void;
  dateValue?: Date;
  handleSaveDate: (d: Date | undefined) => void;
}) {
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
          <InlineTextEditor
            inputRef={inputRef}
            value={editValue}
            onChange={setEditValue}
            onSave={handleSaveText}
            onCancel={handleCancel}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            isPending={isPending}
          />
        )}

        {type === "select" && options && (
          <InlineSelectEditor
            value={editValue}
            onSave={handleSaveSelect}
            onCancel={handleCancel}
            options={options}
            placeholder={placeholder}
            isPending={isPending}
          />
        )}

        {type === "date" && (
          <InlineDateEditor
            dateValue={dateValue}
            onSave={handleSaveDate}
            onCancel={handleCancel}
            placeholder={placeholder}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}

function InlineDisplayValue({
  isEmpty,
  readOnly,
  placeholder,
  displayValue,
}: {
  isEmpty: boolean;
  readOnly: boolean;
  placeholder: string;
  displayValue: React.ReactNode;
}) {
  if (isEmpty) {
    if (readOnly) {
      return <p className="text-xs text-muted-foreground/50 italic">—</p>;
    }
    return (
      <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
        <IconPlus className="size-3" />
        {placeholder}
      </span>
    );
  }
  return (
    <p className="text-xs font-semibold text-foreground truncate capitalize">
      {displayValue}
    </p>
  );
}

function InlinePreviewMode({
  readOnly,
  startEditing,
  icon,
  label,
  isEmpty,
  placeholder,
  displayValue,
}: {
  readOnly: boolean;
  startEditing: () => void;
  icon?: React.ReactNode;
  label: string;
  isEmpty: boolean;
  placeholder: string;
  displayValue: React.ReactNode;
}) {
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
            <InlineDisplayValue
              isEmpty={isEmpty}
              readOnly={readOnly}
              placeholder={placeholder}
              displayValue={displayValue}
            />
          </div>
        </div>

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
  const displayValue = formatFieldValue(value, type, options, formatDisplay);

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

  if (isEditing) {
    return (
      <InlineEditingContainer
        label={label}
        isPending={isPending}
        type={type}
        inputRef={inputRef}
        editValue={editValue}
        setEditValue={setEditValue}
        handleSaveText={handleSaveText}
        handleCancel={handleCancel}
        handleKeyDown={handleKeyDown}
        placeholder={placeholder}
        options={options}
        handleSaveSelect={handleSaveSelect}
        dateValue={dateValue}
        handleSaveDate={handleSaveDate}
      />
    );
  }

  return (
    <InlinePreviewMode
      readOnly={readOnly}
      startEditing={startEditing}
      icon={icon}
      label={label}
      isEmpty={isEmpty}
      placeholder={placeholder}
      displayValue={displayValue}
    />
  );
}
