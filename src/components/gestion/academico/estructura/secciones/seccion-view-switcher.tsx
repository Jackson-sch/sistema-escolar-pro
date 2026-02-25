"use client";

import { useQueryState, parseAsString } from "nuqs";
import { IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SeccionTable, type SeccionTableType } from "./seccion-table";
import { SeccionGrid } from "./seccion-grid";

interface SeccionViewSwitcherProps {
  data: SeccionTableType[];
  meta: {
    grados: any[];
    tutores: any[];
    sedes: any[];
    institucionId: string;
  };
  currentAnio?: number;
}

export function SeccionViewSwitcher({
  data,
  meta,
  currentAnio,
}: SeccionViewSwitcherProps) {
  const [view, setView] = useQueryState(
    "vista",
    parseAsString.withDefault("grid"),
  );

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex justify-end">
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
