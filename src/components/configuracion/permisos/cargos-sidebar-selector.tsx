"use client";

import { useState } from "react";
import {
  IconSearch,
  IconShield,
  IconUsers,
  IconCheck,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CargoItem } from "./permisos-types";

interface CargosSidebarSelectorProps {
  cargos: CargoItem[];
  selectedCargoId: string;
  onSelectCargo: (cargoId: string) => void;
  totalPermisosCount: number;
}

export function CargosSidebarSelector({
  cargos,
  selectedCargoId,
  onSelectCargo,
  totalPermisosCount,
}: CargosSidebarSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredCargos = cargos.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-md backdrop-blur-md p-4 space-y-3.5 w-full lg:w-80 shrink-0">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <IconShield size={18} className="text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Cargos Escolares
          </h3>
        </div>
        <Badge variant="outline" className="rounded-full text-[10px] font-bold px-2 py-0 border-border/50">
          {cargos.length} Roles
        </Badge>
      </div>

      {/* Buscador de cargos */}
      <div className="relative">
        <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cargo institucional..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8.5 pl-8.5 rounded-xl text-xs bg-muted/40 border-border/50 focus-visible:ring-primary/20"
        />
      </div>

      {/* Lista de cargos */}
      <ScrollArea className="h-[520px] pr-2">
        <div className="space-y-1.5">
          {filteredCargos.map((cargo) => {
            const isSelected = cargo.id === selectedCargoId;
            const permisosCount = cargo.permisos.length;
            const usuariosCount = cargo._count.usuarios;

            return (
              <button
                key={cargo.id}
                onClick={() => onSelectCargo(cargo.id)}
                className={cn(
                  "w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-card hover:bg-muted/40 border-border/40 text-foreground"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn(
                    "text-xs font-bold truncate leading-snug",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {cargo.nombre}
                  </span>
                  {isSelected && (
                    <div className="size-4.5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <IconCheck size={11} className="text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1.5 text-[10px] font-medium">
                  <span className={cn(
                    "flex items-center gap-1",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    <IconUsers size={12} />
                    {usuariosCount} {usuariosCount === 1 ? "usuario" : "usuarios"}
                  </span>

                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-[9px] font-bold px-2 py-0 border",
                      isSelected
                        ? "bg-white/20 text-white border-white/30"
                        : permisosCount > 0
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border/40"
                    )}
                  >
                    {permisosCount}/{totalPermisosCount} Permisos
                  </Badge>
                </div>
              </button>
            );
          })}

          {filteredCargos.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8">
              No se encontraron cargos con &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
