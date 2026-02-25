"use client";

import * as React from "react";
import { IconSearch } from "@tabler/icons-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { VariableItem } from "./variable-item";
import { VariableSistema } from "./types";

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

  const filteredVariables = variables.filter((v) =>
    v.clave.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <InputGroup className="flex-1 w-full sm:max-w-md bg-background border-border shadow-sm rounded-full">
          <InputGroupAddon>
            <IconSearch className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar variable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        <InputGroupAddon align="inline-end" className="text-[10px]">
          <span className="font-medium text-primary">
            {filteredVariables.length}
          </span>{" "}
          variable(s)
        </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filteredVariables.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card/50 border border-dashed border-border rounded-2xl">
            <p className="text-sm">No se encontraron variables</p>
            <p className="text-xs mt-1">
              Ajusta tu búsqueda o añade una nueva variable arriba.
            </p>
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
