"use client";

import { LevelSegmentedControl } from "@/components/common/level-segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Section } from "./schedule-types";

function SelectField({
  label,
  placeholder,
  value,
  onValueChange,
  disabled,
  step,
  completed,
  children,
}: {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (val: string) => void;
  disabled: boolean;
  step: number;
  completed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 ml-0.5">
        <span
          className={cn(
            "size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors",
            completed
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-muted-foreground/15 text-muted-foreground/50",
          )}
        >
          {step}
        </span>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider transition-colors",
            completed
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-muted-foreground/60",
          )}
        >
          {label}
        </span>
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-9 w-full rounded-xl border text-xs font-semibold transition-all duration-200",
            completed
              ? "border-indigo-500/30 bg-indigo-500/10 text-foreground focus:ring-indigo-500/30"
              : "border-border/50 bg-background/80 focus:ring-indigo-500/30",
            disabled && "opacity-40 cursor-not-allowed",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border border-border/50 bg-background shadow-lg z-[80]">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ScheduleSelectorsRowProps {
  niveles: Array<{ id: string; nombre: string }>;
  selectedNivelId: string;
  onNivelChange: (val: string) => void;
  grados: Array<{ id: string; nombre: string }>;
  selectedGradoId: string;
  onGradoChange: (val: string) => void;
  filteredSecciones: Section[];
  selectedSeccionId: string;
  onSeccionChange: (val: string) => void;
}

export function ScheduleSelectorsRow({
  niveles,
  selectedNivelId,
  onNivelChange,
  grados,
  selectedGradoId,
  onGradoChange,
  filteredSecciones,
  selectedSeccionId,
  onSeccionChange,
}: ScheduleSelectorsRowProps) {
  return (
    <div className="px-4 py-3.5 bg-card/80 backdrop-blur-md rounded-2xl border border-border/40 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center shadow-xs">
      {/* 1. Level Selector */}
      <div className="md:col-span-6 lg:col-span-6">
        <LevelSegmentedControl
          levels={niveles.map((n) => ({ id: n.id, label: n.nombre }))}
          value={selectedNivelId}
          onChange={onNivelChange}
          label="Nivel Educativo"
        />
      </div>

      {/* 2. Grade Selector */}
      <div className="md:col-span-3 lg:col-span-3">
        <SelectField
          label="Grado / Año"
          placeholder="Selecciona grado"
          value={selectedGradoId}
          onValueChange={onGradoChange}
          disabled={!selectedNivelId}
          step={2}
          completed={!!selectedGradoId}
        >
          {grados.map((g) => (
            <SelectItem
              key={g.id}
              value={g.id}
              className="rounded-xl text-xs font-medium"
            >
              {g.nombre}
            </SelectItem>
          ))}
        </SelectField>
      </div>

      {/* 3. Section Selector */}
      <div className="md:col-span-3 lg:col-span-3">
        <SelectField
          label="Sección"
          placeholder="Selecciona sección"
          value={selectedSeccionId}
          onValueChange={onSeccionChange}
          disabled={!selectedGradoId}
          step={3}
          completed={!!selectedSeccionId}
        >
          {filteredSecciones.map((s) => (
            <SelectItem
              key={s.id}
              value={s.id}
              className="rounded-xl text-xs font-semibold"
            >
              Sección {s.seccion}
            </SelectItem>
          ))}
        </SelectField>
      </div>
    </div>
  );
}
