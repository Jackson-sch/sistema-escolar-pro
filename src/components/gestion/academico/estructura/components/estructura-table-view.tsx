"use client";

import { useState, useMemo } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EstructuraTableRow } from "./estructura-table-row";

interface EstructuraTableViewProps {
  grados: any[];
  secciones: any[];
  onSelectSection: (seccion: any) => void;
  onEditSection: (seccion: any) => void;
  onDeleteSection: (id: string) => void;
  onAssignTutor: (seccion: any) => void;
  onAddSection: (gradeId?: string) => void;
}

export function EstructuraTableView({
  grados,
  secciones,
  onSelectSection,
  onEditSection,
  onDeleteSection,
  onAssignTutor,
  onAddSection,
}: EstructuraTableViewProps) {
  const [filterMode, setFilterMode] = useState<"all" | "sin-tutor" | "vacantes">("all");
  const [tableSearch, setTableSearch] = useState("");

  // Aplanar datos para la tabla con su grado
  const rows = useMemo(() => {
    const gradoMap = new Map(grados.map((g) => [g.id, g]));
    let list = secciones
      .filter((s) => gradoMap.has(s.gradoId))
      .map((s) => ({
        ...s,
        grado: gradoMap.get(s.gradoId),
      }));

    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.grado?.nombre?.toLowerCase().includes(q) ||
          s.seccion?.toLowerCase().includes(q) ||
          s.aulaAsignada?.toLowerCase().includes(q) ||
          s.tutor?.name?.toLowerCase().includes(q),
      );
    }

    if (filterMode === "sin-tutor") {
      list = list.filter((s) => !s.tutor);
    } else if (filterMode === "vacantes") {
      list = list.filter((s) => {
        const count = s._count?.matriculas ?? s._count?.students ?? 0;
        return (s.capacidad || 30) - count > 0;
      });
    }

    return list.sort((a, b) => {
      const ordenDiff = (a.grado?.orden ?? 0) - (b.grado?.orden ?? 0);
      if (ordenDiff !== 0) return ordenDiff;
      return a.seccion.localeCompare(b.seccion);
    });
  }, [grados, secciones, tableSearch, filterMode]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-2.5 bg-muted/15 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filtrar en tabla..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="h-8 w-44 pl-8 text-xs rounded-lg bg-background"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${
                filterMode === "all" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos ({secciones.length})
            </button>
            <button
              onClick={() => setFilterMode("sin-tutor")}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${
                filterMode === "sin-tutor" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sin Tutor
            </button>
            <button
              onClick={() => setFilterMode("vacantes")}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${
                filterMode === "vacantes" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Con Vacantes
            </button>
          </div>
        </div>

        <Button size="sm" onClick={() => onAddSection()} className="h-8 gap-1.5 text-xs font-bold rounded-lg">
          <IconPlus size={14} />
          <span>Nueva Aula</span>
        </Button>
      </div>

      {/* Table Content */}
      <ScrollArea className="flex-1 w-full" type="always">
        <div className="p-3">
          <div className="rounded-xl border border-border/50 overflow-hidden bg-card shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Grado & Sección</th>
                  <th className="py-2.5 px-3">Turno</th>
                  <th className="py-2.5 px-3">Aula Asignada</th>
                  <th className="py-2.5 px-3">Ocupación / Vacantes</th>
                  <th className="py-2.5 px-3">Tutor(a)</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <EstructuraTableRow
                      key={row.id}
                      row={row}
                      onSelectSection={onSelectSection}
                      onEditSection={onEditSection}
                      onDeleteSection={onDeleteSection}
                      onAssignTutor={onAssignTutor}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      No se encontraron aulas para el criterio seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
