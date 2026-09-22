"use client";

import {
  IconSearch,
  IconBuilding,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RenderSortIcon({ isSorted }: { isSorted: boolean | string }) {
  if (isSorted === "asc")
    return <IconArrowUp className="size-3.5 ml-1 text-indigo-500" />;
  if (isSorted === "desc")
    return <IconArrowDown className="size-3.5 ml-1 text-indigo-500" />;
  return <IconArrowsSort className="size-3.5 ml-1 opacity-40" />;
}

interface InventoryToolbarProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  selectedSede: string;
  onSelectedSedeChange: (value: string) => void;
  sedes: any[];
}

export function InventoryToolbar({
  globalFilter,
  onGlobalFilterChange,
  selectedSede,
  onSelectedSedeChange,
  sedes,
}: InventoryToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-background/50 border border-border/40 shadow-xs">
      <div className="relative flex-1 max-w-sm w-full">
        <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
        <Input
          placeholder="Buscar por prenda, talla o categoría..."
          value={globalFilter ?? ""}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Select value={selectedSede} onValueChange={onSelectedSedeChange}>
          <SelectTrigger className="w-full sm:w-52 bg-background border-border/40 rounded-xl text-xs h-9 font-medium">
            <IconBuilding className="size-3.5 mr-1.5 text-muted-foreground/60" />
            <SelectValue placeholder="Filtrar por Sede" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/40">
            <SelectItem value="all" className="text-xs">
              Todas las sedes
            </SelectItem>
            {sedes.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
