"use client";

import {
  IconPlus,
  IconSchool,
  IconLayoutGrid,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconChevronRight,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NivelListProps {
  niveles: any[];
  grados: any[];
  secciones: any[];
  selectedNivelId: string;
  onSelectNivel: (id: string) => void;
  onAddNivel: () => void;
  onEditNivel: (e: React.MouseEvent, nivel: any) => void;
  onDeleteNivel: (e: React.MouseEvent, id: string) => void;
}

export function NivelList({
  niveles,
  grados,
  secciones,
  selectedNivelId,
  onSelectNivel,
  onAddNivel,
  onEditNivel,
  onDeleteNivel,
}: NivelListProps) {
  return (
    <>
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
            <IconLayoutGrid size={16} />
          </div>
          <h2 className="font-semibold text-sm text-foreground tracking-wide uppercase">
            Niveles
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={onAddNivel}
        >
          <IconPlus size={16} />
        </Button>
      </div>

      {/* Nivel list */}
      <ScrollArea className="flex-1 h-full" type="always">
        <div className="space-y-1.5 pb-4 pr-1">
          {niveles.map((nivel) => {
            const isActive = selectedNivelId === nivel.id;
            const gradoCount = grados.filter(g => g.nivelId === nivel.id).length;
            const seccionCount = secciones.filter(s => s.nivelId === nivel.id).length;

            return (
              <div key={nivel.id} className="relative group/nivel">
                <button
                  onClick={() => onSelectNivel(nivel.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-[color,background-color,border-color] duration-200",
                    isActive
                      ? "bg-primary/10 border-primary/25 text-primary"
                      : "bg-card border-border/50 text-foreground hover:border-border hover:bg-muted/40"
                  )}
                >
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isActive ? "bg-primary/15" : "bg-muted"
                  )}>
                    <IconSchool size={15} strokeWidth={1.75} className={isActive ? "text-primary" : "text-muted-foreground"} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate leading-snug capitalize">
                      {nivel.nombre}
                    </p>
                    <p className={cn(
                      "text-[11px] font-medium mt-0.5 flex items-center gap-1.5",
                      isActive ? "text-primary/70" : "text-muted-foreground"
                    )}>
                      <span>{gradoCount} {gradoCount === 1 ? "grado" : "grados"}</span>
                      <span className="opacity-40">·</span>
                      <span>{seccionCount} {seccionCount === 1 ? "sección" : "secciones"}</span>
                    </p>
                  </div>

                  {isActive && (
                    <IconChevronRight size={14} className="text-primary shrink-0" />
                  )}
                </button>

                {/* Nivel actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover/nivel:opacity-100 transition-opacity z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 rounded-md bg-background/80 border border-border/40 shadow-sm hover:bg-muted transition-colors"
                      >
                        <IconDotsVertical size={12} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 rounded-xl">
                      <DropdownMenuItem
                        onClick={(e) => onEditNivel(e, nivel)}
                        className="rounded-lg gap-2 cursor-pointer text-xs"
                      >
                        <IconPencil size={13} className="text-blue-500" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => onDeleteNivel(e, nivel.id)}
                        className="rounded-lg gap-2 cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <IconTrash size={13} />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}
