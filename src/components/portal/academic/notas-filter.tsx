"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconUsers, IconCalendar } from "@tabler/icons-react";
import { PortalStudentSelector } from "../common/portal-student-selector";

interface NotasFilterProps {
  hijos: any[];
  periodos: { id: string; nombre: string }[];
  currentHijoId: string;
  currentPeriodoId: string;
  showPeriodo?: boolean;
  showGeneralOption?: boolean;
}

export function NotasFilter({
  hijos,
  periodos,
  currentHijoId,
  currentPeriodoId,
  showPeriodo = true,
  showGeneralOption = false,
}: NotasFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const onHijoChange = (id: string) => updateFilter("hijoId", id);
  const onPeriodoChange = (id: string) => updateFilter("periodoId", id);

  return (
    <div className="flex flex-col gap-3">
      {/* Selector de Estudiante (Horizontal) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <div className="size-1.5 rounded-full bg-primary" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Seleccionar Estudiante
          </h3>
        </div>
        <PortalStudentSelector
          students={hijos}
          selectedId={currentHijoId}
          onSelect={onHijoChange}
          showGeneralOption={showGeneralOption}
        />
      </div>

      {/* Filtros Secundarios */}
      {showPeriodo && (
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 px-1">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-primary/60" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Periodo Académico
              </h3>
            </div>
            <Select value={currentPeriodoId} onValueChange={onPeriodoChange}>
              <SelectTrigger className="h-9 bg-background/50 border-border/40 rounded-xl text-xs font-semibold hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2">
                  <IconCalendar className="size-3.5 text-primary/70" />
                  <SelectValue placeholder="Seleccionar periodo" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem
                  value="all"
                  className="text-xs font-bold text-primary focus:bg-primary/5"
                >
                  Todos los Periodos
                </SelectItem>
                {periodos.length > 0 ? (
                  periodos.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="text-xs focus:bg-primary/5 focus:text-primary"
                    >
                      {p.nombre}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-[10px] text-center text-muted-foreground italic">
                    No hay periodos disponibles
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
