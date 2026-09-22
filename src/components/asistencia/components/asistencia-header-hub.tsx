"use client";

import { format, startOfDay, addDays, subDays, isToday } from "date-fns";
import { es } from "date-fns/locale";
import {
  IconSchool,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SeccionAsistencia } from "./asistencia-types";

interface AsistenciaHeaderHubProps {
  seccionId: string;
  onSeccionIdChange: (id: string) => void;
  visibleSecciones: SeccionAsistencia[];
  niveles: { id: string; nombre: string }[];
  selectedNivelFilter: string;
  onNivelFilterChange: (id: string) => void;
  fecha: Date;
  onFechaChange: (date: Date) => void;
}

export function AsistenciaHeaderHub({
  seccionId,
  onSeccionIdChange,
  visibleSecciones,
  niveles,
  selectedNivelFilter,
  onNivelFilterChange,
  fecha,
  onFechaChange,
}: AsistenciaHeaderHubProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-4 shadow-xs space-y-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Selector de Aula / Sección */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1.5">
            <IconSchool size={15} className="text-primary" />
            Aula / Sección:
          </span>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Select value={seccionId} onValueChange={onSeccionIdChange}>
              <SelectTrigger className="h-9.5 rounded-xl text-xs font-bold bg-background border-border/60 shadow-2xs">
                <SelectValue placeholder="Seleccionar aula..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border/60 max-h-72">
                {visibleSecciones.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    className="text-xs font-medium cursor-pointer"
                  >
                    <span className="font-bold">{s.nivel?.nombre}</span> —{" "}
                    {s.grado?.nombre} &ldquo;{s.seccion}&rdquo;{" "}
                    {s.turno ? `(${s.turno})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Rápido de Nivel */}
          {niveles.length > 1 && (
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => onNivelFilterChange("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                  selectedNivelFilter === "all"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Todos
              </button>
              {niveles.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onNivelFilterChange(n.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    selectedNivelFilter === n.id
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selector y Navegador Rápido de Fecha */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="size-8.5 rounded-xl border-border/60 hover:bg-muted cursor-pointer"
            onClick={() => onFechaChange(subDays(fecha, 1))}
            title="Día anterior"
          >
            <IconChevronLeft size={16} />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8.5 px-3 rounded-xl text-xs font-bold gap-2 border-border/60 cursor-pointer",
                  isToday(fecha) &&
                    "border-primary/40 bg-primary/5 text-primary",
                )}
              >
                <IconCalendar size={14} />
                <span className="capitalize">
                  {isToday(fecha) ? "Hoy, " : ""}
                  {format(fecha, "d MMM", { locale: es })}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 rounded-2xl shadow-xl border-border/60"
              align="end"
            >
              <Calendar
                mode="single"
                selected={fecha}
                onSelect={(d) => d && onFechaChange(startOfDay(d))}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            className="size-8.5 rounded-xl border-border/60 hover:bg-muted cursor-pointer"
            onClick={() => onFechaChange(addDays(fecha, 1))}
            title="Día siguiente"
          >
            <IconChevronRight size={16} />
          </Button>

          {!isToday(fecha) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8.5 text-xs text-primary font-bold px-2 rounded-xl cursor-pointer"
              onClick={() => onFechaChange(startOfDay(new Date()))}
            >
              Ir a Hoy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
