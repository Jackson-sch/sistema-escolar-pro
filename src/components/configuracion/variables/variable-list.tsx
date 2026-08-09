"use client";

import * as React from "react";
import { IconSearch, IconKey } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { VariableItem } from "./variable-item";
import { VariableSistema } from "./types";
import { Badge } from "@/components/ui/badge";

interface VariableListProps {
  variables: VariableSistema[];
  onUpdateVariable: (variable: VariableSistema) => Promise<void>;
  onDeleteVariable: (id: string) => void;
}

export function VariableList({
  variables,
  onUpdateVariable,
  onDeleteVariable,
}: VariableListProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredVariables = variables.filter(
    (v) =>
      v.clave.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.seccion?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Barra de Filtro e Indicador */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-background/50 border border-border/40 shadow-xs">
        <div className="relative flex-1 max-w-sm w-full">
          <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
          <Input
            placeholder="Buscar por clave, descripción o sección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
          />
        </div>

        <Badge variant="outline" className="rounded-xl px-3 py-1 bg-background border-border/40 text-xs font-semibold text-foreground">
          {filteredVariables.length} variable(s) encontrada(s)
        </Badge>
      </div>

      {/* Lista de Variables */}
      <div className="space-y-2.5">
        {filteredVariables.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground/60 bg-background/40 border border-dashed border-border/40 rounded-2xl space-y-2">
            <IconKey className="size-10 text-muted-foreground/30 mx-auto" />
            <p className="text-xs font-semibold text-foreground">No se encontraron variables registradas</p>
            <p className="text-[11px]">Intenta con otros términos de búsqueda o registra una nueva arriba.</p>
          </div>
        ) : (
          filteredVariables.map((variable) => (
            <VariableItem
              key={variable.id}
              variable={variable}
              onUpdate={onUpdateVariable}
              onDelete={onDeleteVariable}
            />
          ))
        )}
      </div>
    </div>
  );
}
