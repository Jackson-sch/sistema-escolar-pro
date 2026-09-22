"use client";

import {
  IconBolt,
  IconSearch,
  IconLoader2,
  IconX,
  IconArrowRight,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface POSSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  searchResults: any[];
  selectedStudentId: string | null;
  onSelectStudent: (student: any) => void;
  onReset: () => void;
}

export function POSSearchBar({
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  selectedStudentId,
  onSelectStudent,
  onReset,
}: POSSearchBarProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <IconBolt className="size-5" />
        </div>
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar estudiante por DNI, Nombres o Apellidos para cobrar..."
            className="h-10 pl-9 pr-4 text-sm font-medium bg-background border-border/50 rounded-xl placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          {isSearching && (
            <IconLoader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary animate-spin" />
          )}
        </div>
        {selectedStudentId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="rounded-xl h-10 px-3 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <IconX className="size-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Dropdown de Resultados de Búsqueda */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 p-2 rounded-2xl bg-popover border border-border/60 shadow-xl divide-y divide-border/30 max-h-80 overflow-y-auto">
          {searchResults.map((s) => (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectStudent(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectStudent(s);
                }
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="size-9 rounded-xl shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {s.name?.[0]}
                    {s.apellidoPaterno?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {s.name} {s.apellidoPaterno} {s.apellidoMaterno || ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    DNI: {s.dni || "S/D"} ·{" "}
                    {s.nivelAcademico
                      ? `${s.nivelAcademico.grado?.nombre || ""} "${s.nivelAcademico.seccion}"`
                      : "Sin aula"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg text-xs font-bold gap-1 shrink-0"
              >
                <span>Seleccionar</span>
                <IconArrowRight size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
