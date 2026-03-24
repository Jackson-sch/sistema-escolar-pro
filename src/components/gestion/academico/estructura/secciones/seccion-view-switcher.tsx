"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { IconLayoutGrid, IconTable, IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SeccionTable, type SeccionTableType } from "./seccion-table";
import { SeccionGrid } from "./seccion-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ANIO_LECTIVO_OPTIONS } from "@/lib/constants";

interface SeccionViewSwitcherProps {
  data: SeccionTableType[];
  meta: {
    grados: any[];
    tutores: any[];
    sedes: any[];
    institucionId: string;
  };
  currentAnio?: number;
  selectedAnio: number;
}

export function SeccionViewSwitcher({
  data,
  meta,
  currentAnio = new Date().getFullYear(),
  selectedAnio,
}: SeccionViewSwitcherProps) {
  const [view, setView] = useQueryState(
    "vista",
    parseAsString.withDefault("grid"),
  );
  
  const [anio, setAnio] = useQueryState(
    "anio",
    parseAsInteger.withDefault(currentAnio).withOptions({ shallow: false })
  );

  return (
    <div className="space-y-4">
      {/* Filters and View toggle */}
      <div className="flex justify-between items-center bg-card/50 p-2 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <IconCalendar className="text-muted-foreground w-4 h-4 ml-2" />
          <Select
            value={anio.toString()}
            onValueChange={(val) => setAnio(parseInt(val, 10))}
          >
            <SelectTrigger className="w-[140px] h-8 rounded-full bg-background border-border/50 text-sm">
              <SelectValue placeholder="Año Académico" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ANIO_LECTIVO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-0.5 p-1 bg-muted/20 rounded-full border border-border/30">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-1.5 rounded-full transition-all duration-200",
              view === "grid"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
            title="Vista de tarjetas"
          >
            <IconLayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("tabla")}
            className={cn(
              "p-1.5 rounded-full transition-all duration-200",
              view === "tabla"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
            title="Vista de tabla"
          >
            <IconTable className="size-4" />
          </button>
        </div>
      </div>

      {/* Conditional render */}
      {view === "grid" ? (
        <SeccionGrid data={data} meta={meta} currentAnio={currentAnio} />
      ) : (
        <SeccionTable data={data} meta={meta} />
      )}
    </div>
  );
}
