"use client";

import {
  IconId,
  IconSchool,
  IconPhone,
  IconDotsVertical,
  IconEdit,
  IconClipboardCheck,
  IconChevronRight,
  IconBrandWhatsapp,
  IconUserPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { COLUMNS, getWhatsAppUrl } from "./kanban-types";

interface KanbanCardProps {
  prospecto: any;
  gradeName: string;
  isCardLoading: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onShowEdit: (id: string) => void;
  onShowFlow: (id: string) => void;
  onMove: (id: string, newStatus: string) => void;
  onStartEvaluation: (id: string) => void;
  onEnrollStudent: (id: string) => void;
}

export function KanbanCard({
  prospecto: p,
  gradeName,
  isCardLoading,
  onDragStart,
  onDragEnd,
  onShowEdit,
  onShowFlow,
  onMove,
  onStartEvaluation,
  onEnrollStudent,
}: KanbanCardProps) {
  const waUrl = getWhatsAppUrl(p, gradeName);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, p.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group rounded-2xl p-3.5 border border-border/60 bg-card shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing relative space-y-3",
        isCardLoading ? "opacity-50 pointer-events-none" : "",
      )}
    >
      {/* Cabecera Tarjeta */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-extrabold text-xs sm:text-sm leading-tight text-foreground group-hover:text-primary transition-colors truncate">
            {p.nombre} {p.apellidoPaterno} {p.apellidoMaterno || ""}
          </h4>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5 flex items-center gap-1">
            <IconId size={12} className="text-primary shrink-0" />
            DNI: {p.dni || "S/D"}
          </p>
        </div>

        {/* Menú de Acciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Acciones de prospecto"
              className="size-7 rounded-lg hover:bg-muted shrink-0 cursor-pointer"
            >
              <IconDotsVertical className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-border/50 bg-popover shadow-md rounded-xl"
          >
            <DropdownMenuItem
              onClick={() => onShowEdit(p.id)}
              className="rounded-lg text-xs gap-2 cursor-pointer"
            >
              <IconEdit className="size-3.5 text-blue-500" />
              Editar Ficha
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onShowFlow(p.id)}
              className="rounded-lg text-xs gap-2 cursor-pointer"
            >
              <IconClipboardCheck className="size-3.5 text-emerald-500" />
              Ver Expediente
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/20" />
            {COLUMNS.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => onMove(p.id, c.id)}
                className={`rounded-lg text-xxs font-black uppercase tracking-wider gap-2 cursor-pointer ${
                  p.estado === c.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <IconChevronRight className="size-3" />
                Mover a {c.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Detalles de Contacto */}
      <div className="pt-2 border-t border-border/30 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
          <IconSchool size={13} className="text-primary shrink-0" />
          <span className="truncate">{gradeName}</span>
        </div>
        {p.telefono && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <IconPhone size={13} className="text-emerald-500 shrink-0" />
            <span>{p.telefono}</span>
          </div>
        )}
      </div>

      {/* Botones de Acción de 1 Clic */}
      <div className="pt-1 flex items-center gap-1.5">
        {waUrl && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 h-7.5 rounded-xl text-xxs font-bold gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
          >
            <a href={waUrl} target="_blank" rel="noreferrer">
              <IconBrandWhatsapp size={13} />
              <span>WhatsApp</span>
            </a>
          </Button>
        )}

        {p.estado === "INTERESADO" && (
          <Button
            size="sm"
            onClick={() => onStartEvaluation(p.id)}
            disabled={isCardLoading}
            className="h-7.5 rounded-xl text-xxs font-bold px-2.5 bg-blue-600 hover:bg-blue-700 text-white gap-1 cursor-pointer"
          >
            <span>Evaluar</span>
            <IconChevronRight size={12} />
          </Button>
        )}

        {p.estado === "EVALUANDO" && (
          <Button
            size="sm"
            onClick={() => onShowFlow(p.id)}
            disabled={isCardLoading}
            className="h-7.5 rounded-xl text-xxs font-bold px-2.5 bg-amber-600 hover:bg-amber-700 text-white gap-1 cursor-pointer"
          >
            <span>Ficha</span>
            <IconClipboardCheck size={12} />
          </Button>
        )}

        {p.estado === "ADMITIDO" && (
          <Button
            size="sm"
            onClick={() => onEnrollStudent(p.id)}
            disabled={isCardLoading}
            className="h-7.5 rounded-xl text-xxs font-extrabold px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-xs cursor-pointer"
          >
            <span>Matricular</span>
            <IconUserPlus size={12} />
          </Button>
        )}
      </div>
    </div>
  );
}
