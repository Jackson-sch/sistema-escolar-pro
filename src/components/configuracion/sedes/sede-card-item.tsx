"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  IconChevronRight,
  IconMapPin,
  IconMail,
  IconBuilding,
  IconStar,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SedeCardItemProps {
  sede: any;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrincipal: () => void;
}

export function SedeCardItem({
  sede,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  onSetPrincipal,
}: SedeCardItemProps) {
  const nivelesUnicos = Array.from(
    new Set(sede.nivelesAcademicos?.map((na: any) => na.nivel?.nombre)),
  ).filter(Boolean) as string[];

  return (
    <div
      className={cn(
        "p-3.5 rounded-2xl transition-colors border border-border/30 bg-background/40 hover:bg-background/80 group relative",
        isActive
          ? "border-indigo-500/50 bg-indigo-500/10 shadow-xs"
          : "hover:border-indigo-500/20",
        !sede.activo && "opacity-50",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Seleccionar sede ${sede.nombre}`}
        aria-pressed={isActive}
        className="absolute inset-0 size-full rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 z-0"
      />
      <div className="flex gap-3 pointer-events-none">
        <div className="size-16 rounded-xl overflow-hidden shrink-0 relative border border-border/30 bg-muted/20">
          {sede.logo ? (
            <Image
              alt={sede.nombre}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              src={sede.logo}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <IconBuilding className="size-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5 truncate">
                <IconBuilding className="size-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{sede.nombre}</span>
                {sede.esPrincipal && (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] px-1.5 py-0 rounded-md font-bold flex items-center gap-0.5">
                    <IconStar className="size-3 fill-amber-500 text-amber-500" />
                    Principal
                  </Badge>
                )}
              </h3>
              {sede.codigoIdentifier && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground font-mono uppercase mt-0.5 inline-block">
                  Cod: {sede.codigoIdentifier}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 relative z-10 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {!sede.esPrincipal && (
                <button
                  title="Establecer como Sede Principal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPrincipal();
                  }}
                  className="p-1 hover:bg-amber-500/10 rounded-lg text-amber-500 transition-colors"
                >
                  <IconStar className="size-3.5" />
                </button>
              )}
              <button
                title="Editar Sede"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 hover:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                <IconEdit className="size-3.5" />
              </button>
              <button
                title="Eliminar Sede"
                disabled={sede.esPrincipal}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  sede.esPrincipal
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "hover:bg-rose-500/10 text-rose-500",
                )}
              >
                <IconTrash className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
            {sede.direccion && (
              <div className="flex items-center gap-1.5 truncate">
                <IconMapPin className="size-3 shrink-0 text-indigo-500" />
                <span className="truncate">{sede.direccion}</span>
              </div>
            )}
            {sede.email && (
              <div className="flex items-center gap-1.5 truncate">
                <IconMail className="size-3 shrink-0 text-indigo-500" />
                <span className="truncate">{sede.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-border/20 flex justify-between items-center text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold">
            Niveles: {sede.nivelesAcademicos?.length || 0}
          </span>
          {nivelesUnicos.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {nivelesUnicos.map((nombre) => (
                <Badge
                  key={nombre}
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 rounded-md bg-indigo-500/10 text-indigo-600 border-none font-semibold"
                >
                  {nombre}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Ver en mapa <IconChevronRight className="size-3" />
        </span>
      </div>
    </div>
  );
}
