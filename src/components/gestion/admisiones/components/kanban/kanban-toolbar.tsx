"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KanbanToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedGradeId: string;
  onSelectedGradeIdChange: (gradeId: string) => void;
  grados: any[];
  onClearFilters: () => void;
}

export function KanbanToolbar({
  searchQuery,
  onSearchQueryChange,
  selectedGradeId,
  onSelectedGradeIdChange,
  grados,
  onClearFilters,
}: KanbanToolbarProps) {
  const hasFilters = searchQuery || selectedGradeId !== "ALL";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Buscar postulante por DNI, Nombres o Teléfono..."
            className="h-9 pl-9 pr-3 text-xs font-medium bg-background border-border/50 rounded-xl"
          />
        </div>

        <Select
          value={selectedGradeId}
          onValueChange={onSelectedGradeIdChange}
        >
          <SelectTrigger className="w-48 h-9 text-xs font-bold rounded-xl border-border/60 bg-background">
            <SelectValue placeholder="Grado de Interés" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="text-xs">
              Todos los Grados
            </SelectItem>
            {grados.map((g) => (
              <SelectItem key={g.id} value={g.id} className="text-xs">
                {g.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 px-3 text-xs font-bold text-muted-foreground rounded-xl cursor-pointer"
        >
          <IconX className="size-3.5 mr-1" />
          Limpiar Filtros
        </Button>
      )}
    </div>
  );
}
