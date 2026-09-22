"use client";

import { useMemo } from "react";
import {
  IconSchool,
  IconRocket,
  IconUserCheck,
  IconSearch,
  IconRefresh,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SeccionPromocion, EstudiantePromocion } from "./promociones-types";

interface MappingStudentListProps {
  sourceSeccionId: string;
  sourceSeccionObj?: SeccionPromocion;
  targetSeccionId: string;
  targetSeccionObj?: SeccionPromocion;
  anioOrigen: number;
  loadingStudents: boolean;
  filteredStudents: EstudiantePromocion[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedIds: string[];
  onToggleStudent: (id: string) => void;
  onToggleAll: () => void;
  isPending: boolean;
  onPromote: () => void;
}

export function MappingStudentList({
  sourceSeccionId,
  sourceSeccionObj,
  targetSeccionId,
  targetSeccionObj,
  anioOrigen,
  loadingStudents,
  filteredStudents,
  searchQuery,
  onSearchChange,
  selectedIds,
  onToggleStudent,
  onToggleAll,
  isPending,
  onPromote,
}: MappingStudentListProps) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <Card className="p-5 rounded-2xl border-border/40 bg-card/80 backdrop-blur-md space-y-4 shadow-md">
      {/* Header nómina */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <IconUserCheck className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Nómina de Alumnos para Promoción
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {sourceSeccionObj
                ? `Sección ${sourceSeccionObj.grado?.nombre} "${sourceSeccionObj.seccion}" (${anioOrigen})`
                : "Selecciona una sección de origen para ver la lista"}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[11px] font-bold rounded-full px-3 py-1 bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
        >
          {selectedIds.length} de {filteredStudents.length} Seleccionados
        </Badge>
      </div>

      {/* Toolbar: Búsqueda y Marca Masiva */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por apellido o nombre..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9.5 text-xs rounded-xl border-border/40 bg-background/80"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAll}
          disabled={filteredStudents.length === 0}
          className="h-9.5 text-xs font-semibold rounded-xl shrink-0 cursor-pointer border-border/50"
        >
          {selectedIds.length === filteredStudents.length
            ? "Desmarcar Todos"
            : "Seleccionar Todos"}
        </Button>
      </div>

      {/* Lista de Alumnos */}
      {!sourceSeccionId ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/40 rounded-2xl p-6 text-center gap-2 bg-muted/20">
          <IconSchool className="size-10 text-muted-foreground/30 mb-1" />
          <p className="text-xs font-bold text-foreground">
            Selecciona una Sección de Origen
          </p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            Usa el panel de arriba para seleccionar el aula del ciclo {anioOrigen}.
          </p>
        </div>
      ) : loadingStudents ? (
        <div className="flex flex-col items-center justify-center h-64 border border-border/30 rounded-2xl text-xs font-bold text-muted-foreground gap-2">
          <IconRefresh className="size-6 text-indigo-500 animate-spin" />
          <span>Cargando nómina de estudiantes...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/40 rounded-2xl text-xs font-semibold text-muted-foreground p-6 text-center">
          No se encontraron alumnos matriculados en esta sección.
        </div>
      ) : (
        <ScrollArea className="h-[360px] pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredStudents.map((st) => {
              const isSelected = selectedSet.has(st.id);
              return (
                <div
                  key={st.id}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => onToggleStudent(st.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggleStudent(st.id);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 outline-none",
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-500/40 shadow-xs"
                      : "bg-background/60 border-border/40 hover:bg-card hover:border-indigo-500/30",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleStudent(st.id)}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">
                        {st.apellidoPaterno} {st.apellidoMaterno}, {st.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        DNI: {st.dni || st.documentoIdentidad || "Sin registro"}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0"
                  >
                    Apto 2027
                  </Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Footer Action Bar */}
      <div className="pt-3 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {sourceSeccionObj && targetSeccionObj ? (
            <span>
              Transición:{" "}
              <strong className="text-foreground font-semibold">
                {sourceSeccionObj.grado?.nombre} &quot;{sourceSeccionObj.seccion}&quot;
              </strong>{" "}
              ➔{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                {targetSeccionObj.grado?.nombre} &quot;{targetSeccionObj.seccion}&quot;
              </strong>
            </span>
          ) : (
            <span>
              Selecciona la sección de destino para activar el botón de promoción.
            </span>
          )}
        </div>

        <Button
          onClick={onPromote}
          disabled={selectedIds.length === 0 || !targetSeccionId || isPending}
          className="w-full sm:w-auto rounded-xl h-11 px-7 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 text-xs gap-2 cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
        >
          <IconRocket className="size-4" />
          <span>Promover {selectedIds.length} Alumno(s)</span>
        </Button>
      </div>
    </Card>
  );
}
