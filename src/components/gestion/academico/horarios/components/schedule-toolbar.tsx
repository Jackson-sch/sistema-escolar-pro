"use client";

import {
  IconCalendarEvent,
  IconSchool,
  IconChevronRight,
  IconPrinter,
  IconPlus,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleToolbarProps {
  selectedYear: number;
  onYearChange: (year: string) => void;
  nivelName?: string;
  gradoName?: string;
  seccionName?: string;
  hasSeccion: boolean;
  horariosCount: number;
  onPrint: () => void;
  onAdd: () => void;
}

export function ScheduleToolbar({
  selectedYear,
  onYearChange,
  nivelName,
  gradoName,
  seccionName,
  hasSeccion,
  horariosCount,
  onPrint,
  onAdd,
}: ScheduleToolbarProps) {
  return (
    <div className="p-4 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3 min-w-0 flex-wrap">
        {/* Year Selector */}
        <Select
          key={selectedYear}
          defaultValue={selectedYear.toString()}
          onValueChange={onYearChange}
        >
          <SelectTrigger className="h-9 w-auto min-w-[100px] gap-1.5 rounded-xl border-border/50 bg-background/80 px-3 text-xs font-bold focus:ring-indigo-500/30 shrink-0 cursor-pointer">
            <IconCalendarEvent size={14} className="text-indigo-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-border/50 bg-background shadow-lg z-[80]">
            {[
              selectedYear - 1,
              selectedYear,
              selectedYear + 1,
              selectedYear + 2,
            ].map((y) => (
              <SelectItem
                key={y}
                value={y.toString()}
                className="text-xs font-medium rounded-lg"
              >
                Periodo {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Divider */}
        <div className="h-5 w-px bg-border/40 shrink-0 hidden sm:block" />

        {/* Breadcrumb */}
        <div className="min-w-0">
          {nivelName ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground truncate">
              <IconSchool size={14} className="text-indigo-500 shrink-0" />
              <span className="text-foreground font-bold">{nivelName}</span>
              {gradoName && (
                <>
                  <IconChevronRight size={12} className="opacity-40 shrink-0" />
                  <span className="text-foreground font-bold">{gradoName}</span>
                </>
              )}
              {seccionName && (
                <>
                  <IconChevronRight size={12} className="opacity-40 shrink-0" />
                  <Badge
                    variant="outline"
                    className="h-6 text-[10px] font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 rounded-full uppercase"
                  >
                    Sección {seccionName}
                  </Badge>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">
              Selecciona nivel, grado y sección para gestionar el horario.
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        <Button
          onClick={onPrint}
          size="sm"
          variant="outline"
          className="h-9 rounded-xl px-3.5 gap-1.5 text-xs font-semibold border-border/50 hover:bg-muted/60 cursor-pointer"
          disabled={!hasSeccion || horariosCount === 0}
        >
          <IconPrinter size={14} className="text-muted-foreground" />
          <span>Imprimir Horario</span>
        </Button>

        <Button
          onClick={onAdd}
          size="sm"
          className="h-9 rounded-xl px-4 gap-1.5 text-xs font-bold shadow-md shadow-indigo-500/20 transition-transform duration-200 hover:scale-[1.02] bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          disabled={!hasSeccion}
        >
          <IconPlus size={14} strokeWidth={2.5} />
          <span>Asignar Hora</span>
        </Button>
      </div>
    </div>
  );
}
