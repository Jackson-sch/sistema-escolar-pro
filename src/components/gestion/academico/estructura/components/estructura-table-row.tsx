"use client";

import {
  IconDoor,
  IconSun,
  IconMoon,
  IconUserCircle,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface EstructuraTableRowProps {
  row: any;
  onSelectSection: (seccion: any) => void;
  onEditSection: (seccion: any) => void;
  onDeleteSection: (id: string) => void;
  onAssignTutor: (seccion: any) => void;
}

export function EstructuraTableRow({
  row,
  onSelectSection,
  onEditSection,
  onDeleteSection,
  onAssignTutor,
}: EstructuraTableRowProps) {
  const count = row._count?.matriculas ?? row._count?.students ?? 0;
  const cap = row.capacidad || 30;
  const vacantes = Math.max(0, cap - count);
  const pct = Math.min(100, Math.round((count / cap) * 100));
  const isMorning = row.turno === "MANANA";

  return (
    <tr
      onClick={() => onSelectSection(row)}
      className="hover:bg-muted/20 cursor-pointer transition-colors group"
    >
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span
            className="size-6 rounded-md flex items-center justify-center font-bold text-xxs text-white shrink-0"
            style={{ backgroundColor: row.color || "var(--primary)" }}
          >
            {row.seccion}
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-foreground">
                {row.grado?.nombre} &quot;{row.seccion}&quot;
              </span>
              <span className="text-xxs text-muted-foreground">
                ({row.grado?.codigo})
              </span>
              {row.sede && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-muted/70 text-muted-foreground border border-border/50 font-medium">
                  {row.sede.nombre}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="py-2.5 px-3 whitespace-nowrap">
        <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
          {isMorning ? (
            <IconSun size={13} className="text-amber-500" />
          ) : (
            <IconMoon size={13} className="text-indigo-400" />
          )}
          {isMorning ? "Mañana" : "Tarde"}
        </span>
      </td>

      <td className="py-2.5 px-3 text-muted-foreground">
        {row.aulaAsignada ? (
          <span className="inline-flex items-center gap-1">
            <IconDoor size={13} className="opacity-60" />
            {row.aulaAsignada}
          </span>
        ) : (
          <span className="text-muted-foreground/40 italic">Sin asignar</span>
        )}
      </td>

      <td className="py-2.5 px-3 min-w-[140px]">
        <div className="space-y-1">
          <div className="flex justify-between text-xxs font-semibold">
            <span>
              {count}/{cap} alumnos
            </span>
            <span className="text-muted-foreground">{vacantes} vac.</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </td>

      <td className="py-2.5 px-3">
        {row.tutor ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="size-5">
              <AvatarImage src={row.tutor.image || undefined} />
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                {row.tutor.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[130px] font-medium text-foreground">
              {row.tutor.name} {row.tutor.apellidoPaterno}
            </span>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignTutor(row);
            }}
            className="text-xxs font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            <IconUserCircle size={13} />
            Asignar tutor
          </button>
        )}
      </td>

      <td className="py-2.5 px-3 text-right">
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-primary"
            onClick={() => onEditSection(row)}
          >
            <IconPencil size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
            onClick={() => onDeleteSection(row.id)}
          >
            <IconTrash size={13} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
