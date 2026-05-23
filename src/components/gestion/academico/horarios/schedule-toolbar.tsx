"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconCalendarEvent,
  IconSchool,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";

interface ScheduleToolbarProps {
  selectedYear: number;
  onYearChange: (year: string) => void;
  selectedNivel?: { id: string; nombre: string };
  selectedGrado?: { id: string; nombre: string };
  selectedSeccion?: { id: string; seccion: string };
  onAddClick: () => void;
  addDisabled: boolean;
}

export function ScheduleToolbar({
  selectedYear,
  onYearChange,
  selectedNivel,
  selectedGrado,
  selectedSeccion,
  onAddClick,
  addDisabled,
}: ScheduleToolbarProps) {
  return (
    <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 border-b border-border/30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Year Selector */}
        <Select
          key={selectedYear}
          defaultValue={selectedYear.toString()}
          onValueChange={onYearChange}
        >
          <SelectTrigger className="h-8 w-auto min-w-[90px] gap-1.5 rounded-full border-border/60 bg-white/5 px-3 text-[12px] font-bold focus:ring-1 focus:ring-primary/40 shrink-0">
            <IconCalendarEvent size={13} className="text-primary/70" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50 bg-[#09090b] text-white">
            {[selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2].map((y) => (
              <SelectItem key={y} value={y.toString()} className="text-[12px] rounded-lg">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Divider */}
        <div className="h-5 w-px bg-border/40 shrink-0 hidden sm:block" />

        {/* Breadcrumb */}
        <div className="min-w-0 hidden sm:block">
          {selectedNivel ? (
            <div className="flex items-center gap-1.5 text-micro font-medium text-muted-foreground truncate">
              <IconSchool size={13} className="text-primary/60 shrink-0" />
              <span className="text-foreground/80 font-semibold">{selectedNivel.nombre}</span>
              {selectedGrado && (
                <>
                  <IconChevronRight size={10} className="opacity-30 shrink-0" />
                  <span className="text-foreground/80 font-semibold">{selectedGrado.nombre}</span>
                </>
              )}
              {selectedSeccion && (
                <>
                  <IconChevronRight size={10} className="opacity-30 shrink-0" />
                  <Badge variant="outline" className="h-5 text-xxs font-bold border-primary/30 text-primary bg-primary/5 px-2">
                    Sección {selectedSeccion.seccion}
                  </Badge>
                </>
              )}
            </div>
          ) : (
            <p className="text-micro text-muted-foreground/50 italic">
              Selecciona nivel, grado y sección
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={onAddClick}
        size="sm"
        className="h-8 rounded-lg px-3.5 gap-1.5 text-micro font-bold shrink-0 shadow-md shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
        disabled={addDisabled}
      >
        <IconPlus size={13} strokeWidth={3} />
        <span className="hidden sm:inline">Asignar Hora</span>
        <span className="sm:hidden">Nuevo</span>
      </Button>
    </div>
  );
}
