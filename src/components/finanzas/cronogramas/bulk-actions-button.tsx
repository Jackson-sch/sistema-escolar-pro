"use client";

import { useState } from "react";
import {
  IconTrash,
  IconCalendarEvent,
  IconSettings,
  IconPercentage,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Nuevos componentes de modal refactorizados
import { DeleteCronogramasModal } from "./delete-cronogramas-modal";
import { UpdateDueDateModal } from "./update-due-date-modal";
import { ApplyMoraModal } from "./apply-mora-modal";

interface BulkActionsButtonProps {
  conceptos: { id: string; nombre: string }[];
  secciones: {
    id: string;
    seccion: string;
    grado: { nombre: string };
    nivel: { nombre: string };
  }[];
}

export function BulkActionsButton({
  conceptos,
  secciones,
}: BulkActionsButtonProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [moraDialogOpen, setMoraDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto sm:px-4"
              >
                <IconSettings className="sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Gestión</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Gestión Masiva</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl shadow-xl border-white/5 bg-zinc-950/90 backdrop-blur-xl"
        >
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 py-2">
            Acciones Masivas
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem
            onClick={() => setUpdateDialogOpen(true)}
            className="rounded-lg m-1 gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors"
          >
            <IconCalendarEvent className="size-4" />
            <span className="text-xs font-medium">Cambiar Vencimientos</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setMoraDialogOpen(true)}
            className="rounded-lg m-1 gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors"
          >
            <IconPercentage className="size-4" />
            <span className="text-xs font-medium">Aplicar Mora Diaria</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="rounded-lg m-1 gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
          >
            <IconTrash className="size-4" />
            <span className="text-xs font-medium">Eliminar Lote</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modales refactorizados */}
      <DeleteCronogramasModal
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        conceptos={conceptos}
        secciones={secciones}
      />

      <UpdateDueDateModal
        isOpen={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        conceptos={conceptos}
        secciones={secciones}
      />

      <ApplyMoraModal
        isOpen={moraDialogOpen}
        onOpenChange={setMoraDialogOpen}
        conceptos={conceptos}
        secciones={secciones}
      />
    </>
  );
}
